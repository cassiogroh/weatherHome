// Senhas

const password1 = document.querySelector('input[name=password1]');
const password2 = document.querySelector('input[name=password2]');

password1.addEventListener('change',checkPassword1);
password2.addEventListener('change',checkPassword);

function checkPassword() {
    if (password1.value != password2.value) {
        alert('Senhas não coincidem');
        password2.className = 'not-match';
    } else {
        password2.className = 'match';
    }
}

function checkPassword1() {
    if (password1.value === password2.value) {
        password2.className = 'match';
    }
}

// Estados e cidades
const statesSelect = document.querySelector('select[name=state]');
const stateName = document.querySelector('input[class=stateName]')
const citiesSelect = document.querySelector('select[name=city]');
statesSelect.addEventListener('change', populateCities);

function populateStates() {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .then(res => res.json())
    .then(states => {
        for  (i=0 ; i<states.length ; i++) {
            statesSelect.innerHTML += `<option value='${states[i].id}'>${states[i].nome}</option>`
        }
    })
}

populateStates()

function populateCities() {
    const index = event.target.selectedIndex;
    stateName.value = statesSelect.options[index].text; // Sends the name of the state as the value to the backend instead of the index

    citiesSelect.innerHTML = '<option> Selecione a cidade </option>'
    citiesSelect.disabled = false;

    let stateId = statesSelect.value;

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
    .then(res => res.json())
    .then(cities => {
        for (i=0 ; i<cities.length ; i++) {
            citiesSelect.innerHTML += `<option value='${cities[i].nome}'>${cities[i].nome}</option>`
        }
    })
    .catch(err => console.log(err))
}   

// Habilitando botão 'Registrar' após o preenchimento do formulário
const button = document.querySelector('button[id=submit]');

statesSelect.addEventListener('change', enableSubmit)
citiesSelect.addEventListener('change', enableSubmit)

function enableSubmit() {
if (
     password1.value === password2.value &&
     statesSelect.value != 'Selecione o estado' &&
     citiesSelect.value != 'Selecione a cidade'
     ) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}

// Botão limpar formulário
const clearForm = document.querySelector('button[type=reset]')

clearForm.addEventListener('click', resetPassword);

function resetPassword() {
    password2.classList.remove('match');
    password2.classList.remove('not-match');
}