const express = require('express');
const nunjucks = require('nunjucks');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt-nodejs');
const app = express();

const info = require('./modules/weather-info');

nunjucks.configure('src/views', {
    express: app,
    noCache: true
})
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// const db = require('knex')({
//     client: 'pg',
//     connection: {
//         host: '127.0.0.1',
//         user: 'postgres',
//         password: '123',
//         database: 'weatherHome'
//     },
// });

const db = require('knex')({
    client: 'pg',
    connection: {
        connectString: process.env.DATABASE_URL,
        ssl: true
    },
});

app.set('db', db);

// Instruções da página inicial
const length = info.stationsId.length;
let userStations = [];
let stations = [];
let station = {};
let erro = false;

const request = async (i, userReq, url, dbData, firstTime) => {
    // i = número da estação dentro do loop
    // userReq = diferencia requisição da página inicial e do usuário para exibição das estações
    // url = url da estação buscada
    // dbData = Estações do banco de dados, para ID e nome
    // firstTime - Usado para identificar se o nome da estação foi alguma vez alterado, se false, usa o nome default (local)
    await fetch(url)
        .then(async res => await res.json())
        .then(async res => {
            data = res.observations[0];

            let local = data.neighborhood;
            let temp = data.metric.temp;
            let rain = data.metric.precipTotal;

            station['est' + i] = new Object();
            station['est' + i].local = local;
            station['est' + i].temp = temp;
            station['est' + i].rain = rain;

            if (userReq == false) {
                station['est' + i].link = 'https://www.wunderground.com/dashboard/pws/' + info.stationsId[i];
                station['est' + i].id = info.stationsId[i];
                stations.push(station['est' + i]);
            } else {
                station['est' + i].link = 'https://www.wunderground.com/dashboard/pws/' + dbData.stations[i];
                station['est' + i].id = dbData.stations[i];

                if (firstTime) {
                    station['est' + i].name = local;
                } else {
                    station['est' + i].name = dbData.stationname[i];
                }

                userStations.push(station['est' + i]);
            }
        })
        .catch(err => {
            console.log('Estação offline');
            // console.log(err);
        }
        )
}

app.get('/', (req, res) => {
    stations = [];
    station = {};
    let userReq = false;
    for (i = 0; i < length; i++) {
        let url = `https://api.weather.com/v2/pws/observations/current?stationId=${info.stationsId[i]}&format=json&units=${info.units}&apiKey=${info.apiKey}&numericPrecision=${info.numericPreicison}`;
        request(i, userReq, url);
    }
    setTimeout(() => {
        res.render('index.html', {
            stations: stations
        })
    }, 4000);
})

// Carregar página inicial sem setTimeout quando clicar no botão home
app.get('/home', (req, res) => {
    res.render('index.html', {
        stations: stations
    })
})

// Rota para página de registro
app.get('/registrar', (req, res) => {
    res.render('registrar.html');
})

app.post('/save-point', (req, res) => {
    const hash = bcrypt.hashSync(req.body.password1);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: req.body.email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        name: req.body.name,
                        birthday: req.body.birthdate,
                        email: loginEmail[0],
                        address: req.body.address,
                        address2: req.body.address2,
                        state: req.body.stateName,
                        city: req.body.city,
                        joined: new Date(),
                        stations: ['ISANTACA85'],
                        stationname: ['Bairro Centro - Brusque']
                    })
                    .then(user => {
                        let userStations = [];
                        fetchStations(req.body.name);
                        setTimeout(() => {
                            res.render('usuario.html', {
                                userStations: userStations,
                                user: req.body.name,
                                email: req.body.email
                            });
                        }, 4000);
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        // .catch(err => res.status(400).json('E-mail already registered'));
        .catch(err => {
            res.status(400).json(err);
            // res.render('registrar.html', {
            //     erro: true
            // })
        }
            );
}
)

// Função para buscar as estações do usuário para rotas /login e /added
const fetchStations = async (user) => {
    let userReq = true;
    await db('users')
        .where('name', '=', user)
        .select('*')
        .then(data => {
            for (i = 0; i < data[0].stations.length; i++) {
                if (data[0].stations[i] == data[0].stationname[i]) {
                    firstTime = true;
                } else {
                    firstTime = false;
                }
                let url = `https://api.weather.com/v2/pws/observations/current?stationId=${data[0].stations[i]}&format=json&units=${info.units}&apiKey=${info.apiKey}&numericPrecision=${info.numericPreicison}`;
                request(i, userReq, url, data[0], firstTime);
            }
        })
}

// Função para verificar se a estação está offline ou não existe
const verifyStation = async (ID) => {
    invalidStationId = false;
    let url = `https://api.weather.com/v2/pws/observations/current?stationId=${ID}&format=json&units=${info.units}&apiKey=${info.apiKey}&numericPrecision=${info.numericPreicison}`;
    await fetch(url)
        .then(res => res.json())
        .catch(err => {
            invalidStationId = true;
        })
}

// Função para excluir a última estação adicionada
const deleteLastStation = async (email) => {
    db('users')
        .where('email', '=', email)
        .select('*')
        .then(data => {
            data[0].stations.pop();
            data[0].stationname.pop();
            return [data[0].stations, data[0].stationname]
        })
        .then(newData => {
            db('users')
                .where('email', '=', email)
                .update({
                    stations: newData[0],
                    stationname: newData[1]
                })
                .then(data => {
                    return invalidStationId = false;
                })
        })
}

// Rota para login
app.post('/login', (req, res) => {
    userStations = [];
    const loginEmail = req.body.email;
    const loginPassword = req.body.password;

    db.select('email', 'hash').from('login')
        .where('email', '=', loginEmail)
        .then(data => {
            const isValid = bcrypt.compareSync(loginPassword, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', loginEmail)
                    .then(user => {
                        fetchStations(user[0].name);
                        setTimeout(() => {
                            res.render('usuario.html', {
                                userStations: userStations,
                                user: user[0].name,
                                email: user[0].email
                            })
                        }, 4000)
                    })
                    // .catch(err => res.status(400).json('Unable to get user'));
                    .catch(err => {
                        res.render('index.html', {
                            stations: stations,
                            erro_user: true
                        })
                    })
            } else {
                // res.status(400).json('Wrong credentials');
                res.render('index.html', {
                    stations: stations,
                    erro_password: true
                })
            }
        })
        // .catch(err => res.status(400).json('Wrong credentials'));
        .catch(err => {
            res.render('index.html', {
                stations: stations,
                erro_username: true
            })
        })
})

// Rota para adicionar novas estações
app.post('/added', (req, res) => {
    let stationID = req.body.stationID;
    let username = req.body.user;
    let userEmail = req.body.email;

    if (stationID == "") {
        res.render('usuario.html', {
            userStations: userStations,
            user: username,
            email: userEmail,
            erro_add_invalid: true
        })
        erro = true;
    }

    db('users')
        .where('email', '=', userEmail)
        .select('*')
        .then(data => {
            if (!erro) {
                for (i = 0; i < data[0].stations.length; i++) {
                    if (data[0].stations[i] == stationID) {
                        res.render('usuario.html', {
                            userStations: userStations,
                            user: username,
                            email: userEmail,
                            erro_add: true
                        })
                        erro = true;
                        break
                    }
                }
            }
            if (!erro) {
                verifyStation(stationID);
                data[0].stations.push(stationID);
                data[0].stationname.push(stationID);
                return [data[0].stations, data[0].stationname]
            }
        })
        .then(newData => {
            if (!erro) {
                db('users')
                    .where('email', '=', userEmail)
                    .update({
                        stations: newData[0],
                        stationname: newData[1]
                    })
                    .then(user => {
                        userStations = [];
                        fetchStations(username);
                        setTimeout(() => {
                            if (invalidStationId) {
                                deleteLastStation(userEmail);
                            }
                            res.render('usuario.html', {
                                userStations: userStations,
                                user: username,
                                email: userEmail,
                                erro_invalid_station: invalidStationId
                            })
                        }, 4000)
                    })
            }
            erro = false;
        })
})

// Rota para excluir estações
app.get('/reload', (req, res) => {
    let stationDelete = req.query.delete;
    let username = req.query.user;
    let userEmail = req.query.email;
    db('users')
        .where('email', '=', userEmail)
        .select('*')
        .then(data => {
            if (data[0].stations.length > 1) {
                for (i = 0; i < data[0].stations.length; i++) {
                    if (stationDelete === data[0].stations[i]) {
                        data[0].stations.splice(i, 1);
                        data[0].stationname.splice(i, 1);
                        return [data[0].stations, data[0].stationname];
                    }
                }
            } else {
                res.render('usuario.html', {
                    userStations: userStations,
                    user: username,
                    email: userEmail,
                    erro_delete: true
                })
                erro = true;
            }
        })
        .then(newArray => {
            if (!erro) {
                userStations = [];
                db('users')
                    .where('email', '=', userEmail)
                    .update({
                        stations: newArray[0],
                        stationname: newArray[1]
                    })
                    .then(user => {
                        fetchStations(username);
                        setTimeout(() => {
                            res.render('usuario.html', {
                                userStations: userStations,
                                user: username,
                                email: userEmail
                            })
                        }, 4000)
                    })
            }
            erro = false;
        })
})

// Rota para renomear estações
app.get('/renomear', (req, res) => {
    let username = req.query.user;
    let userEmail = req.query.email;
    let renameStationName = req.query.stationName;
    let renameStationID = req.query.stationID;

    res.render('usuario.html', {
        rename: true,
        renameStationID: renameStationID,
        renameStationName: renameStationName,
        user: username,
        email: userEmail,
        userStations: userStations
    })
})

// Após renomear estação
app.post('/rename', (req, res) => {
    let username = req.body.user;
    let userEmail = req.body.email;
    let renameStationName = req.query.renameStationName;
    let renameStationID = req.query.renameStationID;
    let newName = req.body.rename;

    db('users')
        .where('email', '=', userEmail)
        .select('*')
        .then(data => {
            for (i = 0; i < data[0].stationname.length; i++) {
                data[0].stationname[i];
                if (newName == data[0].stationname[i]) {
                    res.render('usuario.html', {
                        userStations: userStations,
                        user: username,
                        email: userEmail,
                        erro_rename: true
                    })
                    erro = true;
                    break
                }
            }

            if (!erro) {
                console.log('treta')
                for (i = 0; i < data[0].stationname.length; i++) {
                    if (renameStationID == data[0].stations[i]) {
                        data[0].stationname.splice(i, 1, newName);
                        return data[0].stationname;
                    } else if (renameStationName == data[0].stationname[i]) {
                        data[0].stationname.splice(i, 1, newName);
                        return data[0].stationname;
                    }
                }
            }
        })
        .then(newArray => {
            userStations = [];
            if (!erro) {
                db('users')
                    .where('email', '=', userEmail)
                    .select('*')
                    .then(data => {
                        db('users')
                            .where('email', '=', userEmail)
                            .update({
                                stationname: newArray
                            })
                            .then(user => {
                                fetchStations(username);
                                setTimeout(() => {
                                    res.render('usuario.html', {
                                        userStations: userStations,
                                        user: username,
                                        email: userEmail
                                    })
                                }, 4000)
                            })
                    })
            }
            erro = false;
        })
})

// Rota para exluir conta
app.get('/excluir-conta', (req, res) => {
    let userEmail = req.query.user;

    db('users')
        .where('email', '=', userEmail)
        .del()
        .then()

    db('login')
        .where('email', '=', userEmail)
        .del()
        .then(user => {
            res.render('usuario.html', {
                userStations: userStations,
                accDelete: true
            })
        })
})

// Rota para parcerias
app.get('/parcerias', (req, res) => {
    res.render('parcerias.html');
});

app.listen(process.env.PORT || 4000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


// DATABASE

// CREATE TABLE login
// (
//     id serial PRIMARY KEY,
//     name VARCHAR(100),
//     birthday date NOT NULL,
//     email TEXT UNIQUE NOT NULL,
//     address text,
//     address2 text,
//     state text,
//     city text,
//     joined timestamp NOT NULL,
//     stations VARCHAR(200) ARRAY[999] NOT NULL,
//     stationname VARCHAR(200) ARRAY[999] NOT NULL
// )

// CREATE TABLE login
// (
//     id serial PRIMARY KEY,
//     email text UNIQUE NOT NULL,
//     hash VARCHAR(100) NOT NULL
// )