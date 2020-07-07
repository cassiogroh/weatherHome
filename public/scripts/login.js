const loginButton = document.querySelector('a[class=login]');
const loginModal = document.querySelector('form[class=hide]');
const main = document.querySelector('main');

loginButton.addEventListener('click', toggleModal);
main.addEventListener('click', toggleModalOff);

function toggleModal() {
    loginModal.classList.toggle('hide');
    
}

function toggleModalOff() {
    loginModal.classList.add('hide')
}