let selectedSettingTab = 'tf2'

function settingTabScrollListener(e) {
    if(e.target.scrollTop > Number.parseFloat(getComputedStyle(e.target.firstElementChild).marginTop)) {
        document.getElementById('settingsContainer').setAttribute('scrolled', '')
    } else {
        document.getElementById('settingsContainer').removeAttribute('scrolled')
    }
}

function settingsNavItemListener(ele, fade = true) {
    if(ele.hasAttribute('selected')) {
        return
    }

    const navItems = document.getElementsByClassName('settingNavItem')
    for(let i=0; i < navItems.length; i++) {
        if(navItems[i].hasAttribute('selected')) {
            navItems[i].removeAttribute('selected')
        }
    }

    ele.setAttribute('selected', '')
    let prevTab = selectedSettingTab
    selectedSettingTab = ele.getAttribute('data-action')

    document.getElementById(prevTab).onscroll = null
    document.getElementById(selectedSettingTab).onscroll = settingTabScrollListener

    if(fade) {
        $(`#${prevTab}`).fadeOut(250, () => {
            $(`#${selectedSettingTab}`).fadeIn({
                duration: 250,
                start: () => {
                    settingTabScrollListener({
                        target: document.getElementById(selectedSettingTab)
                    })
                }
            })
        })
    } else {
        $(`#${prevTab}`).hide(0, () => {
            $(`#${selectedSettingTab}`).show({
                duration: 0,
                start: () => {
                    settingTabScrollListener({
                        target: document.getElementById(selectedSettingTab)
                    })
                }
            })
        })
    }
}

function settingNavDone() {
    document.getElementById('settingNavDone').onclick = (e) => {
        switchView(VIEWS.settings, VIEWS.landing)
    }
}

function setupSettingsTabs() {
    Array.from(document.getElementsByClassName('settingNavItem')).map((val) => {
        if(val.hasAttribute('data-action')) {
            val.onclick = () => {
                settingsNavItemListener(val)
            }
        }
    })
    settingNavDone()
}

const formUpdateConfig = $("#formUpTF2Config")
const formUpdaterConfig = $("#formUpUpdateConfig")

function populateFormConfigFromData() {
    formUpdateConfig.find('#path_tf2').val(config.configuration[0].path_tf2)
    formUpdateConfig.find('#path_tf2_mod').val(config.configuration[0].path_tf2_mod)
}

function populateFormUpdateFromData() {
    if(config.configuration[0].launcher_auto_update === true) {
        formUpdaterConfig.find('#launcher_auto_update').attr('checked', 'checked')
    } else {
        formUpdaterConfig.find('#launcher_auto_update').removeAttr('checked')
    }
}

formUpdateConfig.on('submit', (e) => {
    e.preventDefault()
    let form = formUpdateConfig
    let btn = form.find('button')
    let data = form.serializeArray()

    console.log(data)

    btn.attr('disabled', true)

    db.updateRow('configuration', app.getPath('userData')+'/data/database', {idconfigurator: 1}, {
        path_tf2: data[0].value,
        path_tf2_mod: data[1].value
    }, (succ, msg) => {
        btn.removeAttr('disabled')
        if(succ) {
            // Alert Dialog
            Toastify({
                text: "Configuration mise à jour",
                backgroundColor: "#4CAF50",
                position: 'right',
            }).showToast();
            console.log(succ, msg)
        } else {
            //alert Dialog
            Toastify({
                text: msg,
                backgroundColor: "#af4c4c",
                position: 'right',
            }).showToast();
            console.error(msg)
            log.error("Erreur traitement Formulaire de configuration")
            log.error(msg)
        }
    })
})

formUpdaterConfig.find("#launcher_auto_update").on('change', (e) => {
    e.preventDefault()
    let checkbox = $(this)
    let obj = {}
    obj.launcher_auto_update = !!checkbox.is('checked');

    db.updateRow('configuration', app.getPath('userData')+'/data/database', {idconfigurator: 1}, obj, (succ, msg) => {
        if(succ) {
            Toastify({
                text: "Configuration mise à jour",
                backgroundColor: "#4CAF50",
                position: 'right',
            }).showToast();
            console.log(succ, msg)
        } else {
            Toastify({
                text: msg,
                backgroundColor: "#af4c4c",
                position: 'right',
            }).showToast();
            console.error(msg)
        }
    })



})

function prepareConfigurationTab() {
    populateFormConfigFromData()
    populateFormUpdateFromData()
}

const settingsTabChangelog = document.getElementById('changelog')
const settingsChangelogTitle = settingsTabChangelog.getElementsByClassName('settingChangelogTitle')[0]
const settingsChangelogText = settingsTabChangelog.getElementsByClassName('settingChangelogText')[0]
const settingsChangelogButton = settingsTabChangelog.getElementsByClassName('settingChangelogButton')[0]

document.getElementById('settingChangelogDevToolsButton').onclick = (e) => {
    let window = remote.getCurrentWindow()
    window.toggleDevTools()
}

function populateVersionInformation(version, valueElement, titleElement, checkElement) {
    valueElement.innerHTML = 'v'+version
    titleElement.innerHTML = 'Stable Release'
}

function populateChangelogVersionInformation() {
    populateVersionInformation(remote.app.getVersion(), document.getElementById('currentVersionDetailValue'), document.getElementsByClassName('currentVersionDetailTitle'), document.getElementsByClassName('settingChangelogCurrentVersionCheck'))
}

function populateReleaseNote() {
    $.ajax({
        url: 'https://github.com/trainznation/trainznation_app_tf2/releases.atom',
        success: (data) => {
            console.log(data)
            const version = `v${remote.app.getVersion()}`
            const entries = $(data).find('entry')

            for(let i=0; i < entries.length; i++) {
                const entry = $(entries[i])
                let id = entry.find('id').text()
                id = id.substring(id.lastIndexOf('/')+1)

                if(id === version) {
                    settingsChangelogTitle.innerHTML = entry.find('title').text()
                    settingsChangelogText.innerHTML = entry.find('content').text()
                    settingsChangelogButton.href = entry.find('link').attr('href')
                }
            }
        },
        timeout: 2500
    }).catch(err => {
        settingsChangelogText.innerHTML = "Impossible de charger la note de mise à jour"
    })
}

function prepareChangelogTab() {
    populateChangelogVersionInformation()
    populateReleaseNote()
}

function prepareSettings() {
    setupSettingsTabs()
    prepareConfigurationTab()
    prepareChangelogTab()
}

prepareSettings();
