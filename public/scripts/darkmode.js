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

const initialMode = {
    color1: "#eeee9f",
    color2: "#f1f1a5",
    borderShadow: "black",
    textColor: "black",
    bgColor1: "#ffe",
    bgColor2: "#ffc",
    inputColor: "white"
}

const darkMode = {
    color1: "#555",
    color2: "#222",
    borderShadow: "#888",
    textColor: "#eee",
    bgColor1: "#222",
    bgColor2: "#000",
    inputColor: "#aaa"
}

const style = document.documentElement.style;

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