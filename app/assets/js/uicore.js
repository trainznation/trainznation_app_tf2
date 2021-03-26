const $ = require('jquery');
const {is, isFirstAppLaunch} = require('electron-util')
const {ipcRenderer} = require('electron');
const remote = require('electron').remote;
const app = require('electron').remote.app
const shell = require('electron').shell
const log = require("electron-log");
const os = require('os')
const path = require('path');
const moment = require('moment');
const db = require('electron-db');
const Toastify = require('toastify-js/src/toastify')
const Popover = require(path.join(__dirname, '../', 'assets', 'js', 'scripts', 'popover.js'))
const pjson = require(path.join(__dirname, '../../package.json'));
let config = require(app.getPath('userData')+'/data/database/configuration.json');

moment.locale('fr');


const VIEWS = {
    welcome: "#welcomeContainer",
    mod: "#modContainer",
    settings: "#settingsContainer",
    landing: "#landingContainer",
    library: "#libraryContainer",
    download: "#downloadContainer",
    shop: "#shopContainer",
    shop_info: "#shopInfoContainer",
    changelog: "#changelogContainer"
};

let currentView;


/**
 * Switcher de vue
 *
 * @param {string} current L'ID de la vue courante
 * @param {*} next l'ID de la vue suivante
 * @param {*} currentFadeTime (Optionnel) Le temps du fadeOut
 * @param {*} nextFadeTime (Optionnel) Le temps du FadeIn
 * @param {*} onCurrentFade (Optionnel)
 * @param {*} onNextFade (Optionnel)
 */
function switchView(current, next, currentFadeTime = 500, nextFadeTime = 500, onCurrentFade = () => {}, onNextFade = () => {}) {
    currentView = next;
    $(`${current}`).fadeOut(currentFadeTime, () => {
        onCurrentFade()
        $(`${next}`).fadeIn(nextFadeTime, () => {
            onNextFade()
        })
    })
}

/**
 * Obtenez le conteneur de vue actuellement affiché.
 *
 * @returns {string} Le conteneur de vue actuellement affiché.
 */
function getCurrentView() {
    return currentView;
}

function showMainUI(data) {
    if(!is.development) {
        log.info("Initialisation...");
    }

    setTimeout(() => {
        document.querySelector('#topbar').style.background = 'linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 66%, rgba(0,212,255,1) 100%);';
        $('#main').show();

        if(isFirstAppLaunch === true) {
            currentView = VIEWS.welcome
            $(VIEWS.welcome).fadeIn(1000);
        } else {
            currentView = VIEWS.landing
            $(VIEWS.landing).fadeIn(1000);
        }
    }, 750)
}

function showFatalStartupError() {
    setTimeout(() => {
        $("#loadingContainer").fadeOut(250, () => {
            document.getElementById('overlayContainer').style.background = 'none'
            setOverlayContent(
                "Erreur Fatal: Impossible de charger la configuration principal",
                "La connexion avec le serveur principal n'a pas aboutie !",
                'Close'
            )
            setOverlayHandler(() => {
                const window = remote.getCurrentWindow();
                window.close()
            })
            toggleOverlay(true)
        })
    }, 750)
}

async function testingServerOpen() {
    await fetch('https://download.trainznation.tk/').then(r => {
        log.info("Connexion: OK")
        return true;
    }).catch(err => {
        log.info("Connexion: NOT")
        return false;
    })
}


document.addEventListener('readystatechange', () => {
    if(document.readyState === 'interactive' || document.readyState === 'complete') {
        testingServerOpen().then(r => {
            const data = {}
            showMainUI(data)
        }).catch(err => {
            showFatalStartupError()
            console.error("System: "+err)
        })
    }
})

