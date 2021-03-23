const {is, isFirstAppLaunch, openNewGitHubIssue} = require('electron-util')
const {ipcRenderer} = require('electron')
const remote = require('electron').remote
const app = require('electron').remote.app
const dialog = require('electron').dialog
const path = require('path')
const fs = require('fs-extra')
const db = require('electron-db')
const log = require('electron-log')
const system = require('systeminformation')
const logger = require('./assets/js/scripts/loggerutil')('%c[Preloading...]', 'color: #a02d2a; font-weight: bold')
const Toastify = require('toastify-js/src/toastify')


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

async function createUserFile() {
    if (!fs.existsSync(`${userPath}/data/database/user.json`)) {
        await db.createTable('user', dataDirectory + '/database', (succ, msg) => {
            if (!succ) {
                return new Promise(reject => {
                    log.error('Erreur de creation du fichier \'user.json\'')
                    log.error(reject)
                })
            } else {
                return new Promise(resolve => {
                    log.info('Fichier user: OK')
                    log.info(resolve)
                })
            }
        })
    }
}

async function createSystemFile() {
    if (!fs.existsSync(`${userPath}/data/database/system.json`)) {
        await db.createTable('system', dataDirectory + '/database', (succ, msg) => {
            if (!succ) {
                return new Promise(reject => {
                    log.error('Erreur de creation du fichier \'system.json\'')
                    log.error(reject)
                })
            } else {
                return new Promise(resolve => {
                    log.info('Fichier system: OK')
                    log.info(resolve)
                })
            }
        })
    }
}

async function verifIntegreFile() {
    if (!fs.existsSync(`${dataDirectory}/database/configuration.json`) || !fs.existsSync(`${dataDirectory}/database/user.json`) || !fs.existsSync(`${dataDirectory}/database/system.json`)) {
        log.error('Erreur lors de la vérification des fichiers d\'initialisation.')
        log.error('file: preloader.js | func: verifIntegreFile |line: 56')
        return false;
    } else {
        return true;
    }
}

async function fetchTrainzServer() {
    await fetch(api_endpoint)
            .then(res => res.json())
            .then(json => {
                console.log(json)
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

async function fetchServerConnexion() {
    await fetch(down_endpoint+'/mod.json')
            .then(res => {
                return true
            })
            .catch(err => {
                log.error('Erreur lors de la connexion au serveur de téléchargement')
                log.error('file: preloader.js | func: fetchTrainzServer |line: 73')
                log.error(err)
                Toastify({
                    text: "Impossible de ce connecter au serveur de téléchargement",
                    backgroundColor: "#af4c4c",
                    position: 'right',
                }).showToast();
                app.quit();
                return false
            })
}

async function downloadModFileNotExist() {
    await fetch(down_endpoint + '/mod.json')
            .then(res => res.json())
            .then(json => {
                fs.writeFileSync(`${userPath}/data/mod.json`, JSON.stringify(json), 'UTF-8')
            })
            .catch(err => {
                log.error('Erreur lors de la création du fichier mod.json')
                log.error('file: preloader.js | func: downloadFileNotExist |line: 100')
                log.error(err)
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

async function insertSystemData() {
    if (await db.valid('system', dataDirectory + '/database')) {
        let obj = {}
        system.cpu().then(data => obj.cpu = data)
        system.mem().then(data => obj.mem = data)
        system.graphics().then(data => obj.graphics = data)
        system.osInfo().then(data => obj.os = data)
        system.diskLayout().then(data => obj.disks = data)

        await db.insertTableContent('system', dataDirectory+'/database', obj, (succ, msg) => {
                if(!succ) {
                    log.error('Erreur lors du remplissage de la table du système')
                    log.error('file: preloader.js | func: insertSystemData |line: 157')
                    log.error(msg)
                }
            })
    } else {
        log.error('Fichier Système: Invalide')
        log.error('file: preloader.js | func: insertSystemData |line: 149')
    }
}

async function insertUserData() {
    let modFile = require(dataDirectory+'/mod.json')
    if (await db.valid('user', dataDirectory+'/database')) {
        modFile.files.forEach((mod) => {

            let obj = {};
            obj.modid = mod.entryurl
            obj.name = mod.name
            obj.category = mod.category
            obj.subcategory = mod.subcategory
            obj.version_server = mod.version
            obj.mod_state = mod.state
            obj.mod_time = mod.utc_changed
            obj.mod_file = down_endpoint+'/mod/packages/'+mod.download
            obj.mod_file_size = mod.download_size
            obj.mod_img = mod.imgFile
            obj.description = mod.description
            obj.changelogs = mod.changelog
            obj.install = {}
            obj.install.installed = "not_installed"
            obj.install.installed_time = null
            obj.install.installed_version = null

            db.insertTableContent('user', dataDirectory+'/database', obj, (succ, msg) => {
                if(!succ) {
                    log.error('Erreur lors du remplissage de la table utilisateur')
                    log.error('file: preloader.js | func: insertUserData |line: 192')
                    log.error(msg)
                }
            })
        })
    } else {
        log.error('Fichier User: Invalide')
        log.error('file: preloader.js | func: insertUserData |line: 171')
    }
}

async function updateSystemData() {
    await db.clearTable('system', dataDirectory+'/database', (succ, msg) => {
        if(!succ) {
            log.error('Erreur lors du nettoyage de la table systeme')
            log.error('file: preloader.js | func: updateSystemData |line: 224')
            log.error(msg)
        } else {
            insertSystemData().then().catch(err => {
                log.error('Erreur lors du nettoyage de la table systeme')
                log.error('file: preloader.js | func: updateSystemData |line: 230')
                log.error(err)
            })
        }
    })
}

async function updateUserData() {
    let modFile = require(dataDirectory+'/mod.json')
    if(await db.valid('user', dataDirectory+'/database')) {
        modFile.files.forEach((mod) => {
            db.getRows('user', dataDirectory+'/database', {modid: mod.entryurl}, (succ, row) => {
                if(succ) {
                    if(row.version_server !== mod.version) {

                        let obju = {};
                        obju.modid = mod.entryurl
                        obju.name = mod.name
                        obju.category = mod.category
                        obju.subcategory = mod.subcategory
                        obju.version_server = mod.version
                        obju.mod_state = mod.state
                        obju.mod_time = mod.utc_changed
                        obju.mod_file = down_endpoint+'/mod/packages/'+mod.download
                        obju.mod_file_size = mod.download_size
                        obju.mod_img = mod.imgFile
                        obju.description = mod.description
                        obju.changelogs = mod.changelog
                        obju.install = {}
                        obju.install.installed = "not_installed"
                        obju.install.installed_time = null
                        obju.install.installed_version = null

                        db.updateRow('user', dataDirectory+'/database', {modid: mod.entryurl}, obju, (succ, msg) => {
                            if(!succ) {
                                log.error('Erreur lors de la mise à jour de la table utilisateur')
                                log.error('file: preloader.js | func: updateUserData |line: 242')
                                log.error(msg)
                            }
                        })
                    }
                } else {
                    log.error(`Reception des information sur le mod ${row.name}: Echec`)
                    log.error('file: preloader.js | func: updateUserData |line: 220')
                }
            })
        })
    } else {
        log.error(`Fichier User: Invalide`)
        log.error('file: preloader.js | func: updateUserData |line: 218')
    }
}

if (firstLaunch === true) {
    createDirectory().then(() => {
        createConfigFile().then(() => {
            createUserFile().then(() => {
                createSystemFile().then(() => {
                    fetchServerConnexion().then(() => {
                        fetchTrainzServer().then(() => {
                            downloadModFileNotExist().then(() => {
                                insertConfigData().then(() => {
                                    insertSystemData().then(() => {
                                        insertUserData().then(() => {
                                            verifIntegreFile().then(() => {
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
} else {
    fetchTrainzServer().then(() => {
        fetchServerConnexion().then(() => {
            downloadModFileNotExist().then(() => {
                updateSystemData().then(() => {
                    updateUserData().then(() => {
                        verifIntegreFile().then(() => {
                            log.info("Mise à jours des fichiers applicatif: OK")
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

