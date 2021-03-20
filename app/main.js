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

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const location = path.join(__dirname, 'data', 'database')
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

if (openDev) {
    log.transports.file.level = "debug";
    endpoint = 'https://tf2.trainznation.io/api/';
} else {
    log.transports.file.level = "info";
    endpoint = 'https://tf2.trainznation.tk/api/';
}

if (process.mas) app.setName(pjson.productName);
autoUpdater.logger = log;
log.info("Demarrage de l'application...");

/**
 * Function Start
 * - StartUpdateCheckIfNotStarted() : Permet de démarrer la vérification
 *                                    de la mise à jour du programme si il n'est pas démarrer automatiquement.
 *
 * - updateJsonFileMod() asyncFunction: Met à jour la liste des mod disponible
 *
 * - createConfigurationFile() : Créer la table de configuration si elle n'existe
 *                               pas.
 *
 * - initUserTable() : Initialisation de la table Utilisateur, cette table est
 *                     remplie par le téléchargement du fichier de mod plus les informations
 *                     d'installation et permet d'avoir une base d'installation pour
 *                     l'utilisateur du programme.
 *
 * - initUserModTable(): Remplie la table utilisateurs des données relative
 *                       au fichier de mod télécharger précédement par le programme.
 *                       Actif uniquement si le résultat de la fonction initUserTable() est à
 *                       false.
 *
 * - updateUserModTable(): Remplie la table utilisateurs des données relative
 *                         au fichier de mod télécharger précédement par le programme.
 *                         Actif uniquement si le résultat de la fonction initUserTable() est à
 *                         true.
 * - createWindow(): Création de la fenetre principal de rendu electron
 *
 * - getPlatformIcon(): Définition du chemin d'accès au fichier d'icone de l'application
 */

function startUpdateCheckIfNotStarted() {
    if (updateCheckStarted)
        return;
    updateCheckStarted = true;

    if (skipAutoUpdate)
        return;

    log.debug("Demarrage de la verification de mise a jours...");
    autoUpdater.checkForUpdatesAndNotify();
    log.debug("La verification des mises a jour est probablement en cours !");
}

function updateJsonFileMod() {
    fetch("https://download.trainznation.tk/tf2/mod.json")
        .then(res => res.json())
        .then(json => {
            fs.writeFile(path.join(__dirname, "data", "mod.json"), JSON.stringify(json), (err) => {
                if (err) {
                    log.error("Erreur: " + err);
                    app.quit();
                } else {
                    initUserTable()
                    log.debug("Fichier des mods mise a jour !");
                }
            })
        }).catch(err => {
        log.error("Impossible de se connecter au serveur de mise à jours");
        log.error(err);
        app.quit();
    })
}

function createConfigurationFile() {
    if (fs.existsSync(path.join(__dirname, "data", "database", "configuration.json"))) {
        return null;
    } else {
        db.createTable('configuration', location, (succ, msg) => {
            if (!succ) {
                log.error("Erreur lors de la création de la table 'configuration'");
                log.error("Erreur : " + msg);
            } else {
                let obj = {};
                obj.path_tf2 = null;
                obj.path_tf2_mod = null;
                obj.launcher_auto_update = true;
                obj.endpoint = endpoint;

                if (db.valid('configuration', location)) {
                    db.insertTableContent('configuration', location, obj, (succ, msg) => {
                        if (!succ) {
                            log.error("Erreur lors du remplissage de la table 'configuration'");
                            log.error("Erreur: " + msg);
                        } else {
                            log.info("Initialisation de la configuration: OK");
                        }
                    })
                } else {
                    log.error("Erreur: La Table 'configuration' n'existe pas");
                }
            }
        })
    }
}

function initUserTable() {
    if (fs.existsSync(path.join(__dirname, "data", "database", "user.json"))) {
        // Si le fichier existe lancement de la mise à jours de la table
        updateUserModTable();
    } else {
        // sinon ont créer le fichier
        db.createTable('user', location, (succ, msg) => {
            if(succ) {
                initUserModTable();
            } else {
                log.error("Erreur lors de la création de la table 'User'");
                log.error("Erreur: "+msg);
                app.quit();
            }
        })
    }

}

function initUserModTable() {
    let modJson = require('./data/mod.json');
    modJson.files.forEach((mod) => {
        db.insertTableContent('user', location, {
            modid: mod.entryurl,
            name: mod.name,
            category: mod.category,
            subcategory: mod.subcategory,
            version_server: mod.version,
            mod_state: mod.state,
            mod_time: mod.utc_changed,
            mod_file: "https://download.trainznation.tk/tf2/mod/packages/"+mod.download,
            mod_file_size: mod.download_size,
            mod_img: mod.imgFile,
            description: mod.description,
            changelogs: mod.changelog,
            install: {
                installed: "not_installed",
                installed_time: null,
                installed_version: null
            }

        }, (succ, msg) => {
            if(succ) {
                log.info("Initialisation du contenue du fichier 'user': Terminer")
            } else {
                log.error("Erreur lors de l'initialisation du contenue du fichier 'User'");
                log.error("Erreur: "+msg);
                app.quit();
            }
        })
    })
}

function updateUserModTable() {
    let modJSon = require("./data/mod.json");
    modJSon.files.forEach((mod) => {
        db.getRows('user', location, {modid: mod.entryurl}, (succ, row) => {
            if(succ) {
                if(row.version_server !== mod.version) {
                    db.updateRow('user', location, {modid: mod.entryurl}, {
                        name: mod.name,
                        category: mod.category,
                        subcategory: mod.subcategory,
                        version_server: mod.version,
                        mod_state: mod.state,
                        mod_time: mod.utc_changed,
                        mod_file: "https://download.trainznation.tk/tf2/mod/packages/"+mod.download,
                        mod_file_size: mod.download_size,
                        mod_img: mod.imgFile,
                        description: mod.description,
                        changelogs: mod.changelog,
                    }, (succ, msg) => {
                        if(succ) {
                            log.info("Mise a jours du contenue du fichier 'user': Terminer");
                        } else {
                            log.error("Erreur lors de la mise a jour du contenue du fichier 'User'");
                            log.error("Erreur: "+msg);
                            app.quit();
                        }
                    })
                }
            } else {
                log.error("Erreur lors de la recuperation des donnees de la table 'user'");
                log.error("Erreur: "+row);
                app.quit();
            }
        })
    })
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

    if(openDev) {
        mainWindow.webContents.openDevTools({mode: "bottom"});
        log.info("Demarrage avec support de developpement active.");
    }

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
    updateJsonFileMod()
    createConfigurationFile()
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
    console.log(arg);
    autoUpdater.checkForUpdatesAndNotify();
})