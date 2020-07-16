const deleteButton = document.querySelector('.deleteAcc');
deleteButton.addEventListener('click', areYouSure);

const email = document.querySelector('#email').value;

function areYouSure() {
    let sure = confirm('Tem certeza que deseja exluir a sua conta?');
    console.log(sure)
    if (sure) {
        window.location = `/excluir-conta?user=` + email;
    }
}