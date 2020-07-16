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

// Login modal
// const loginSubmit  =document.querySelector('#loginSucceful');
// loginSubmit.addEventListener('click', activateModal)

// const loginSucceful = document.querySelector('#afterLogIn');
// function activateModal() {
//     loginSucceful.classList.remove('hide')
// }