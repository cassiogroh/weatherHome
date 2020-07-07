const express = require('express');
const nunjucks = require('nunjucks');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt-nodejs');
const app = express();

const info = require('./modules/weather-info')

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

const request = async (i, url) => {
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
            station['est' + i].link = 'https://www.wunderground.com/dashboard/pws/' + info.stationsId[i];

            stations.push(station['est' + i]);
        })
        .catch(err => {
            console.log(`Estação offline`);
        }
        )
}

for (i = 0; i < length; i++) {
    let url = `https://api.weather.com/v2/pws/observations/current?stationId=${info.stationsId[i]}&format=json&units=${info.units}&apiKey=${info.apiKey}&numericPrecision=${info.numericPreicison}`;
    request(i, url);
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
                        state: req.body.state,
                        city: req.body.city,
                        joined: new Date()
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

// Rota para login
app.post('/login', (req, res) => {
        res.render('index.html', {
            stations: stations
        })
})

// Rota para parcerias
app.get('/parcerias', (req, res) => {
    res.render('parcerias.html')
})

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});