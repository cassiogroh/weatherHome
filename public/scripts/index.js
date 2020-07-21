const syncTime = document.querySelector('.sync-time')
let today = new Date();
syncTime.innerHTML = 
    `Sincronizado em:
    ${today.getDate()},
    ${today.getMonth() + 1},
    ${today.getFullYear()}
    às ${today.getHours() + ":" + today.getMinutes()} h`;

// Habilitação de opções de exibição

const props = [
    'dewpt',
    'elev',
    'heatIndex',
    'precipRate',
    'precipTotal',
    'pressure',
    'temp',
    'windChill',
    'windGust',
    'windSpeed'
];

props.map(key => {
    let internProp = document.querySelector(`#${key}`);
    internProp.addEventListener('click', toggleHide);
})

function toggleHide(evt) {
    let param = document.querySelectorAll(`.${evt.path[0].id}`);
    for (item of param) {
        item.classList.toggle('hide');
    }
}

// Habilitando o menu suspenso para seleção de opções
const optionsButton = document.querySelector('#options-menu');
const optionsCard = document.querySelector('.options-card');

optionsButton.addEventListener('mouseenter', removeHideOptions);
optionsCard.addEventListener('mouseleave', toggleHideOptions)

function toggleHideOptions() {
    optionsCard.classList.toggle('hide');
}

function removeHideOptions() {
    optionsCard.classList.remove('hide');
}