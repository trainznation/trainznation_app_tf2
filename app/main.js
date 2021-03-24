require('@electron/remote/main').initialize()

const electron = require('electron')
const autoUpdater = require('electron-updater').autoUpdater
const {ipcMain} = require('electron');
const ejse = require('ejs-electron')
const fs = require('fs')
const path = require('path')
const semver = require('semver')
const url = require('url')
const os = require('os');
const pjson = require('../package.json')
const fetch = require('node-fetch')
const db = require('electron-db')
const log = require('electron-log')
const {is, isFirstAppLaunch} = require('electron-util')

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const location = path.join(app.getPath('userData'), 'data', 'database')
const openLinksInExternal = true

const debug = /--debug/.test(process.argv[2])
const args = process.argv.slice(2)

let openDev = false
let skipAutoUpdate = false
let mainWindow = null
let updateCheckStarted = false;
let endpoint;

args.forEach((val, index) => {
    if (val === '--debug') {
        openDev = true;
        const debug = /--debug/.test(process.argv[2]);

    } else if (val === "--skip-autoupdate") {
        skipAutoUpdate = true;
    } else {
        console.error(`Argument Invalide (${index}): ${val}`);
        process.exit();
    }
});
app.setAppUserModelId(process.execPath)
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('ignore-certificate-errors');
app.allowRendererProcessReuse = true;

Object.assign(console, log.functions)
log.catchErrors()

if (process.mas) app.setName(pjson.productName);
autoUpdater.logger = log;
log.info("Demarrage de l'application...");


function startUpdateCheckIfNotStarted() {
    if (updateCheckStarted)
        return;
    updateCheckStarted = true;

    if (skipAutoUpdate)
        return;

    log.debug("Demarrage de la verification de mise a jours...");
    if(openDev) {
        autoUpdater.checkForUpdatesAndNotify();
    } else {
        autoUpdater.checkForUpdates()
    }
    log.debug("La verification des mises a jour est probablement en cours !");
}



if (openDev) {
    log.transports.file.level = "debug";
    endpoint = 'https://tf2.trainznation.io/api/';
} else {
    log.transports.file.level = "info";
    endpoint = 'https://tf2.trainznation.io/api/';
}


function createWindow() {
    const iconFile = getPlatformIcon('logo');
    if(!fs.existsSync(iconFile)) {
        log.error("Fichier d'icone non disponible. Avez-vous bien inserer vos fichiers d'icone dans le dossier assets/images/icons")
        console.error("Fichier d'icone non disponible. Avez-vous bien inserer vos fichiers d'icone dans le dossier assets/images/icons")
        app.quit();
        return;
    }

    if(!openDev)
        electron.Menu.setApplicationMenu(null);

    mainWindow = new BrowserWindow({
        width: 1920 + (openDev ? 700 : 0),
        height: 1080 + (openDev ? 630 : 0),
        frame: openDev,
        autoHideMenuBar: !openDev,
        webPreferences: {
            preload: path.join(__dirname, 'preloader.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            worldSafeExecuteJavaScript: false,
            webSecurity: true
        },
        backgroundColor: "#404040",
        icon: iconFile
    });

    if(!openDev)
        mainWindow.removeMenu()

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
        startUpdateCheckIfNotStarted();
    })

    mainWindow.once("show", () => {
        setTimeout(startUpdateCheckIfNotStarted, 200);
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'ejs', 'app.ejs'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.webContents.openDevTools({mode: "bottom"});
    /*if(openDev) {
        mainWindow.webContents.openDevTools({mode: "bottom"});
        log.info("Demarrage avec support de developpement active.");
    }*/

    mainWindow.webContents.once('did-stop-loading', () => {})

    mainWindow.on("closed", () => {
        mainWindow = null;
    })

    if(openLinksInExternal) {
        mainWindow.webContents.on('new-window', (e, url) => {
            e.preventDefault();
            require("electron").shell.openExternal(url).catch(err => {
                log.error("Erreur lors de l'ouverture de fichier externe");
                log.error("Erreur: "+err);
            });
        })
    }

    mainWindow.webContents.on("will-navigate", (e, url) => {
        if(url !== mainWindow.webContents.getURL()) {
            e.preventDefault();
            require("electron").shell.openExternal(url).catch(err => {
                log.error("Erreur lors de l'ouverture de fichier externe");
                log.error("Erreur: "+err);
            })
        }
    });

    log.info("Démarrage du programme de téléchargement de mod pour TF2 version: "+pjson.version+" os: "+os.platform()+" arch: "+ os.arch());
    setTimeout(startUpdateCheckIfNotStarted, 800);
}

function getPlatformIcon(logo) {
    if(os.platform() === 'darwin') {
        logo = logo + '.icns'
    } else if(os.platform() === 'win32') {
        logo = logo + '.ico'
    } else {
        logo = logo + '.png'
    }

    return path.join(__dirname,'assets', 'images', 'icons', logo);
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if(process.platform !== "darwin") {
        log.info("Systeme arreter car toutes les fenetres sont ferme");
        app.quit();
    }
})

app.on('activate', () => {
    if(mainWindow === null) {
        createWindow();
    }
})

app.on("browser-window-created", (e, window) => {
    if(window === mainWindow || mainWindow === null) {

    } else {
        window.setSize(1000, 900);
        window.center();
    }

    if(!openDev)
        window.setMenu(null);
});

ipcMain.on("restartAndUpdate", () => {
    log.info("Quitter et installer la mise à jour");
    autoUpdater.quitAndInstall();
});

autoUpdater.on("update-available", () => {
    log.info("Envoi du message de mise à jour disponible");
    mainWindow.webContents.send("updateAvailable");
});

autoUpdater.on("update-downloaded", () => {
    log.info("envoi du message téléchargé de mise à jour");
    mainWindow.webContents.send("updateDownloaded");
});

ipcMain.on('update-available', (event, arg) => {
    if (openDev) {
        autoUpdater.checkForUpdates()
    } else {
        autoUpdater.checkForUpdatesAndNotify();
    }
})