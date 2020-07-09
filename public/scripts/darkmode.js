// Darkmode toggle
const darkButton = document.querySelector('a[class=darkmode]');

darkButton.addEventListener('click', darkmode)
let j = 0;

function darkmode() {
    if (j===0) {
        j = 1;
    document.documentElement.style.setProperty('--color1', '#555');
    document.documentElement.style.setProperty('--color2', '#222');
    document.documentElement.style.setProperty('--border-shadow', '#888');
    document.documentElement.style.setProperty('--text-color', '#eee');
    document.documentElement.style.setProperty('--bg-color1', '#222');
    document.documentElement.style.setProperty('--bg-color2', '#000');
    document.documentElement.style.setProperty('--input-color', '#aaa');
    } else {
        j = 0;
        document.documentElement.style.setProperty('--color1', '#eeee9f');
        document.documentElement.style.setProperty('--color2', '#f1f1a5');
        document.documentElement.style.setProperty('--border-shadow', 'black');
        document.documentElement.style.setProperty('--text-color', 'black');
        document.documentElement.style.setProperty('--bg-color1', '#ffe');
        document.documentElement.style.setProperty('--bg-color2', '#ffc');
        document.documentElement.style.setProperty('--input-color', 'white');
    }
}