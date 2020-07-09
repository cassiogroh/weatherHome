const express = require('express');
const nunjucks = require('nunjucks');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt-nodejs');
const app = express();

const info = require('./modules/weather-info');
const { stationsId } = require('./modules/weather-info');

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
let stations = [];
let station = {};
let userStations = [];

const request = async (i, j, url, ID) => {
    await fetch(url)
        .then(async res => await res.json())
        .then(async res => {
            data = res.observations[0];

            let local = data.neighborhood;
            let temp = data.metric.temp;
            let rain = data.metric.precipTotal;

            station['est' + i] = new Object(local, temp, rain)
            station['est' + i].local = local;
            station['est' + i].temp = temp;
            station['est' + i].rain = rain;

            if (j === 1) {
                station['est' + i].link = 'https://www.wunderground.com/dashboard/pws/' + info.stationsId[i];
                stations.push(station['est' + i]);
            } else {
                station['est' + i].link = 'https://www.wunderground.com/dashboard/pws/' + ID;
                userStations.push(station['est' + i]);
            }
        })
        .catch(err => {
            console.log('Estação offline');
        }
        )
}

let j = 1;
for (i = 0; i < length; i++) {
    let url = `https://api.weather.com/v2/pws/observations/current?stationId=${info.stationsId[i]}&format=json&units=${info.units}&apiKey=${info.apiKey}&numericPrecision=${info.numericPreicison}`;
    request(i, j, url);
}

app.get('/', (req, res) => {
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
    res.render('registrar.html')
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
                        stations: 'ISANTACA56'
                    })
                    .then(user => {
                        res.render('registrar.html', { saved: true });
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('E-mail already registered'));
}
)

// Função para buscar as estações do usuário para rotas /login e /added
const fetchStations = async (user) => {
    j = 0;
    await db('users')
        .where('name', '=', user)
        .select('stations')
        .then(data => {
            groupedStations = data[0].stations;
            isolatedStations = groupedStations.split(',');
            if (isolatedStations[0] === 'null') {
                isolatedStations.shift();
            }
            let k = 0; // Inútil
            for (elemt of isolatedStations) {
                let url = `https://api.weather.com/v2/pws/observations/current?stationId=${elemt}&format=json&units=${info.units}&apiKey=${info.apiKey}&numericPrecision=${info.numericPreicison}`;
                request(k, j, url, elemt);
                k++; // Inútil
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
                            res.render('usuario.html', {
                                userStations: userStations,
                                user: user[0].name
                            })
                        }, 3000)
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
    userStations = [];
    let stationID = req.body.stationID;
    const username = req.body.user;

    db('users')
        .where('name', '=', username)
        .select('stations')
        .then(data => {
            db('users')
                .where('name', '=', username)
                .update({ stations: data[0].stations + ',' + stationID })
                .then(user => {
                    fetchStations(username);
                    setTimeout(() => {
                        res.render('usuario.html', {
                            userStations: userStations,
                            user: username
                        })
                    }, 3000)
                })
        })
})


// Rota para parcerias
app.get('/parcerias', (req, res) => {
    res.render('parcerias.html');
});

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});