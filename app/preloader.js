const {is, openNewGitHubIssue} = require('electron-util')
const app = require('electron').remote.app
const fs = require('fs-extra')
const db = require('electron-db')
const log = require('electron-log')
const Toastify = require('toastify-js/src/toastify');

const firstLaunch = !fs.existsSync(app.getPath('userData') + '/data')
const userPath = app.getPath('userData')
let dataDirectory = userPath + '/data'
let api_endpoint
let down_endpoint
if (is.development) {
    api_endpoint = 'https://tf2.trainznation.io/api'
    down_endpoint = 'https://download.trainznation.io/tf2'
} else {
    api_endpoint = 'https://tf2.trainznation.tk/api'
    down_endpoint = 'https://download.trainznation.tk/tf2'
}

function createDirectory() {
    if (!fs.existsSync(`${userPath}/data`)) {
        return new Promise((resolve, reject) => {
            dataDirectory = userPath + '/data'
            if(fs.mkdirpSync(`${userPath}/data`) && fs.mkdirpSync(`${userPath}/data/database`)) {return resolve()} else {return reject()}
        })
    } else {
        dataDirectory = userPath + '/data'
    }
}

async function createConfigFile() {
    if (!fs.existsSync(`${userPath}/data/database/configuration.json`)) {
        await db.createTable('configuration', dataDirectory + '/database', (succ, msg) => {
            if (!succ) {
                return new Promise((reject) => {
                    log.error('Erreur de creation du fichier \'configuration.json\'')
                    log.error(reject)
                })
            } else {
                return new Promise((resolve) => {
                    log.info('Fichier de configuration: OK')
                    log.info(resolve)
                })
            }
        })
    }
}

async function createLibraryFile() {
    if (!fs.existsSync(`${userPath}/data/database/library.json`)) {
        await db.createTable('library', dataDirectory + '/database', (succ, msg) => {
            if (!succ) {
                return new Promise((reject) => {
                    log.error('Erreur de creation du fichier \'library.json\'')
                    log.error(reject)
                })
            } else {
                return new Promise((resolve) => {
                    log.info('Fichier de librairie: OK')
                    log.info(resolve)
                })
            }
        })
    }
}

async function fetchTrainzServer() {
    await fetch(api_endpoint)
        .then(res => res.json())
        .then(json => {
        })
        .catch(err => {
            log.error('Erreur lors de la connexion au serveur de trainznation')
            log.error('file: preloader.js | func: fetchTrainzServer |line: 73')
            log.error(err)
            Toastify({
                text: "Impossible de ce connecter au serveur de données",
                backgroundColor: "#af4c4c",
                position: 'right',
            }).showToast();
            app.quit()
            return false
        })
}

async function insertConfigData() {
    let DEFAULT_CONFIG = {
        idconfigurator: 1,
        path_tf2: null,
        path_tf2_mod: null,
        launcher_auto_update: true,
        endpoint: api_endpoint,
        dataDirectory: dataDirectory
    }
    if (await db.valid('configuration', dataDirectory + '/database')) {
        await db.insertTableContent('configuration', dataDirectory + '/database', DEFAULT_CONFIG, (succ, msg) => {
            if (!succ) {
                log.error('Erreur lors du remplissage de la table de configuration')
                log.error('file: preloader.js | func: insertConfigData |line: 134')
                log.error(msg)
            }
        })
    } else {
        log.error('Fichier configuration: Invalide')
        log.error('file: preloader.js | func: insertConfigData |line: 133')
    }
}

if(firstLaunch === true) {
    createDirectory().then(() => {
        fetchTrainzServer().then(() => {
            createConfigFile().then(() => {
                insertConfigData().then(() => {
                    log.info("Chargement Initial terminer !")
                }).catch(err => {
                    log.error("Erreur: "+err)
                    openNewGitHubIssue({
                        user: "trainznation",
                        repo: "trainznation_app_tf2",
                        body: err
                    })
                    app.quit()
                })
            }).catch(err => {
                log.error("Erreur: "+err)
                openNewGitHubIssue({
                    user: "trainznation",
                    repo: "trainznation_app_tf2",
                    body: err
                })
                app.quit()
            })
        }).catch(err => {
            log.error("Erreur: "+err)
            openNewGitHubIssue({
                user: "trainznation",
                repo: "trainznation_app_tf2",
                body: err
            })
            app.quit()
        })
    }).catch(err => {
        log.error("Erreur: "+err)
        openNewGitHubIssue({
            user: "trainznation",
            repo: "trainznation_app_tf2",
            body: err
        })
        app.quit()
    })
}