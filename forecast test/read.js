// var Excel = require('exceljs');
// var workbook = new Excel.Workbook();

// workbook.xlsx.readFile('teste.xlsx')
//     .then(function() {
//         var worksheet = workbook.getWorksheet('Julho');
//         var row = worksheet.getRow(37);
//         row.getCell(4).value = 12; // A5's value set to 5
//         row.commit();
//         return workbook.xlsx.writeFile('teste.xlsx');
//     })
//     .catch(console.log)

// const fetch = require('node-fetch');

let menor = 50;

fetch('https://api.weather.com/v2/pws/observations/all/1day?stationId=ISANTACA56&format=json&units=m&apiKey=5ab387f9a952492eb387f9a952392ec0&numericPrecision=decimal')
.then(res => res.json())
.then(res => {
    console.log(res.observations)
    for (i=0; i<res.observations.length; i++) {
        if (res.observations[i].metric.tempLow < menor) {
            menor = res.observations[i].metric.tempLow;
        }
    }
})
.catch(console.log)