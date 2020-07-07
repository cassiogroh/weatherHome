// Darkmode toggle
const darkButton = document.querySelector('a[class=darkmode]');

darkButton.addEventListener('click', darkmode)
let j = 0;

function darkmode() {
    if (j===0) {
        j = 1;
    document.body.style.background = 'linear-gradient(#000033, #000022)';
    document.documentElement.style.setProperty('--color1', '#888');
    document.documentElement.style.setProperty('--color2', '#555');
    document.documentElement.style.setProperty('--border-shadow', 'white');
    document.documentElement.style.setProperty('--text-color', 'white');
    } else {
        j = 0;
        document.body.style.background = 'linear-gradient(#ffffee, #ffffcc)';
        document.documentElement.style.setProperty('--color1', '#eeee9f');
        document.documentElement.style.setProperty('--color2', '#f1f1a5');
        document.documentElement.style.setProperty('--border-shadow', 'black');
        document.documentElement.style.setProperty('--text-color', 'black');
    }
}