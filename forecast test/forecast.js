

const url = 'https://api.weather.com/v3/wx/forecast/daily/5day?geocode=-27.124098099999998,-48.9505257&format=json&units=m&language=pt-BR&apiKey=5ab387f9a952492eb387f9a952392ec0';

fetch(url)
.then(res => res.json())
.then(data => {
    console.log(data)
})