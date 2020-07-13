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

const db = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: '123',
        database: 'weatherHome'
    },
});

app.set('db', db);

// Instruções da página inicial
const length = info.stationsId.length;
let userStations = [];
let stations = [];
let station = {};

const request = async (i, j, url, dbData, firstTime) => {
    // i = número da estação dentro do loop
    // j = 0 ou 1, para diferenciar requisição da página inicial e do usuário
    // url = url da estação buscada
    // ID = ID da estação buscada
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

            if (j == 1) {
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
            // console.log('Estação offline');
            console.log(err);
        }
        )
}

app.get('/', (req, res) => {
    stations = [];
    station = {};
    let j = 1;
    for (i = 0; i < length; i++) {
        let url = `https://api.weather.com/v2/pws/observations/current?stationId=${info.stationsId[i]}&format=json&units=${info.units}&apiKey=${info.apiKey}&numericPrecision=${info.numericPreicison}`;
        request(i, j, url);
    }
    setTimeout(() => {
        res.render('index.html', {
            stations: stations,
            darkMode: 0
        })
    }, 4000);
})

// Carregar página inicial sem setTimeout quando clicar no botão home
app.get('/home', (req, res) => {
    let dark = req.query.dark;
    res.render('index.html', {
        stations: stations,
        darkMode: dark
    })
})

// Rota para página de registro
app.get('/registrar', (req, res) => {
    let dark = req.query.dark;
    res.render('registrar.html', {
        darkMode: dark
    })
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
                        let dark = req.query.dark;
                        fetchStations(req.body.name);
                        
                        setTimeout(() => {
                            res.render('usuario.html', {
                                userStations: userStations,
                                user: req.body.name,
                                email: req.body.email,
                                darkMode: dark
                            });
                        }, 4000);

                        // res.render('/registrar', {
                        //     saved: true,
                        //     dark: dark
                        // })
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('E-mail already registered'));
    // .catch(console.log)
}
)

// Função para buscar as estações do usuário para rotas /login e /added
const fetchStations = async (user) => {
    let j = 0;
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
                request(i, j, url, data[0], firstTime);
            }
        })
}
// Rota para login
app.post('/login', (req, res) => {
    userStations = [];
    const loginEmail = req.body.email;
    const loginPassword = req.body.password;

    if (!loginEmail || !loginPassword) {
        return res.status(400).json('Incorrect form submit');
    }
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
                            let dark = req.query.dark;
                            res.render('usuario.html', {
                                userStations: userStations,
                                user: user[0].name,
                                email: user[0].email,
                                darkMode: dark
                            })
                        }, 4000)
                    })
                    .catch(err => res.status(400).json('Unable to get user'));
            } else {
                res.status(400).json('Wrong credentials');
            }
        })
        .catch(err => res.status(400).json('Wrong credentials'));
})

// Rota para adicionar novas estações
app.post('/added', (req, res) => {
    let dark = req.query.dark;
    userStations = [];
    let stationID = req.body.stationID;
    let username = req.body.user;
    let userEmail = req.body.email

    db('users')
        .where('email', '=', userEmail)
        .select('*')
        .then(data => {
            for (i = 0; i < data[0].stations.length; i++) {
                if (data[0].stations[i] == stationID) {
                    console.log('Estação já cadastrado');
                    return [data[0].stations, data[0].stationname]
                } else {
                    data[0].stations.push(stationID);
                    data[0].stationname.push(stationID);
                    return [data[0].stations, data[0].stationname]
                }
            }
        })
        .then(newData => {
            db('users')
                .where('email', '=', userEmail)
                .update({
                    stations: newData[0],
                    stationname: newData[1]
                })
                .then(user => {
                    fetchStations(username);
                    setTimeout(() => {
                        res.render('usuario.html', {
                            userStations: userStations,
                            user: username,
                            email: userEmail,
                            darkMode: dark
                        })
                    }, 4000)
                })
        })
})

// Rota para excluir estações
app.get('/reload', (req, res) => {
    userStations = [];
    let dark = req.query.dark;
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
            console.log('Não foi possível deletar a estação');
            return [data[0].stations, data[0].stationname];
        }
        })
        .then(newArray => {
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
                            email: userEmail,
                            darkMode: dark
                        })
                    }, 4000)
                })
        })
})

// Rota para renomear estações
app.get('/renomear', (req, res) => {
    let dark = req.query.dark;
    let username = req.query.user;
    let userEmail = req.query.email;
    let renameStationName = req.query.stationName;
    let renameStationID = req.query.stationID;

    res.render('usuario.html', {
        rename: true,
        renameStationID: renameStationID,
        renameStationName: renameStationName,
        darkMode: dark,
        user: username,
        email: userEmail,
        userStations: userStations
    })
})

// Após renomear estação
app.post('/rename', (req, res) => {
    userStations = [];
    let dark = req.body.dark;
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
                if (renameStationID == data[0].stations[i]) {
                    data[0].stationname.splice(i, 1, newName);
                    return data[0].stationname;
                } else if (renameStationName == data[0].stationname[i]) {
                    data[0].stationname.splice(i, 1, newName);
                    return data[0].stationname;
                }
            }
        })
        .then(newArray => {
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
                                    rename: false,
                                    userStations: userStations,
                                    user: username,
                                    email: userEmail,
                                    darkMode: dark
                                })
                            }, 4000)
                        })
                })
        })
})

// Rota para exluir conta
app.get('/excluir-conta', (req, res) => {
    let dark = req.query.dark;
    let userEmail = req.query.user;

    // tem certeza?
    // se não: render 'usuario'
    // se sim:

    db('users')
        .where('email', '=', userEmail)
        .del()
        .then()

    db('login')
        .where('email', '=', userEmail)
        .del()
        .then(user => {
            stations = [];
            station = {};
            let j = 1;
            for (i = 0; i < length; i++) {
                let url = `https://api.weather.com/v2/pws/observations/current?stationId=${info.stationsId[i]}&format=json&units=${info.units}&apiKey=${info.apiKey}&numericPrecision=${info.numericPreicison}`;
                request(i, j, url);
            }
            setTimeout(() => {
                res.render('index.html', {
                    darkMode: dark,
                    stations: stations
                })
            }, 4000);
        })

})

// Rota para parcerias
app.get('/parcerias', (req, res) => {
    let dark = req.query.dark;
    res.render('parcerias.html', {
        darkMode: dark
    });
});


const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});