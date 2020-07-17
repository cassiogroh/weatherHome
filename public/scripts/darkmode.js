// Darkmode toggle

// 0 Sem darkmode
// 1 Com darkmode

// Se primeira vez no site: dark mode desativado
if (document.cookie == "") {
document.cookie = 'darkMode=0';
}

const darkButton = document.querySelector('a[class=darkmode]');
darkButton.addEventListener('click', darkmode)

let dark = document.cookie[9];

const style = document.documentElement.style;

let variables = getComputedStyle(document.body);

const initialMode = {
    color1: variables.getPropertyValue('--color1'),
    color2: variables.getPropertyValue('--color2'),
    borderShadow: variables.getPropertyValue('--border-shadow'),
    textColor: variables.getPropertyValue('--text-color'),
    bgColor1: variables.getPropertyValue('--bg-color1'),
    bgColor2: variables.getPropertyValue('--bg-color2'),
    inputColor: variables.getPropertyValue('--input-color')
}

const darkMode = {
    color1: "#555",
    color2: "#222",
    borderShadow: "#888",
    textColor: "#eee",
    bgColor1: "#444",
    bgColor2: "#000",
    inputColor: "#aaa"
}

const setKey = key => "--" + key.replace(/([A-Z])/, "-$1").toLowerCase();

const setProp = (colors) => {
    Object.keys(colors).map(key => style.setProperty(setKey(key), colors[key]));
}

function darkmode() {
    if (dark==0) {
        document.cookie = 'darkMode=1';
        dark = document.cookie[9];
        setProp(darkMode);
    } else {
        document.cookie = 'darkMode=0';
        dark = document.cookie[9];
        setProp(initialMode)
    }
}

function darkmodeInit() {
    if (dark==1) {
        setProp(darkMode);
    } 
}

darkmodeInit();