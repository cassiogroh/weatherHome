// Darkmode toggle
const darkButton = document.querySelector('a[class=darkmode]');
darkButton.addEventListener('click', darkmode)

const darkHome = document.getElementById("home");
const darkRegistrar = document.getElementById("registrar");
const darkLogin = document.getElementById("login");
const darkParcerias = document.getElementById("parcerias");
const darkSavepoint = document.getElementById("savepoint");
const darkAdded = document.getElementById("added");

let darkMode = document.getElementById("darkMode").value;

// 0 Sem darkmode
// 1 Com darkmode

const style = document.documentElement.style;

function darkmode() {
    if (darkMode==0) {
        darkMode = 1;
        
        darkHome.href = '/home?dark=1';
        darkRegistrar.href = '/registrar?dark=1';
        darkLogin.action = '/login?dark=1';
        darkParcerias.href = '/parcerias?dark=1';
        // darkSavepoint.action = '/save-point?dark=1';
        // darkAdded.action = '/added?dark=1';
        

    style.setProperty('--color1', '#555');
    style.setProperty('--color2', '#222');
    style.setProperty('--border-shadow', '#888');
    style.setProperty('--text-color', '#eee');
    style.setProperty('--bg-color1', '#222');
    style.setProperty('--bg-color2', '#000');
    style.setProperty('--input-color', '#aaa');
    } else {
        darkMode = 0;
        
        darkHome.href = '/home?dark=0';
        darkRegistrar.href = '/registrar?dark=0';
        darkLogin.action = '/login?dark=0';
        darkParcerias.href = '/parcerias?dark=0';
        // darkSavepoint.action = '/save-point?dark=0';
        // darkAdded.action = '/added?dark=0';
        

        style.setProperty('--color1', '#eeee9f');
        style.setProperty('--color2', '#f1f1a5');
        style.setProperty('--border-shadow', 'black');
        style.setProperty('--text-color', 'black');
        style.setProperty('--bg-color1', '#ffe');
        style.setProperty('--bg-color2', '#ffc');
        style.setProperty('--input-color', 'white');
    }
}

function darkmodeInit() {
    console.log(darkMode);
    if (darkMode==1) {
    style.setProperty('--color1', '#555');
    style.setProperty('--color2', '#222');
    style.setProperty('--border-shadow', '#888');
    style.setProperty('--text-color', '#eee');
    style.setProperty('--bg-color1', '#222');
    style.setProperty('--bg-color2', '#000');
    style.setProperty('--input-color', '#aaa');
    } else {
        style.setProperty('--color1', '#eeee9f');
        style.setProperty('--color2', '#f1f1a5');
        style.setProperty('--border-shadow', 'black');
        style.setProperty('--text-color', 'black');
        style.setProperty('--bg-color1', '#ffe');
        style.setProperty('--bg-color2', '#ffc');
        style.setProperty('--input-color', 'white');
    }
}

darkmodeInit();