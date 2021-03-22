let selectedSettingTab = 'tf2'

function settingTabScrollListener(e) {
    if(e.target.scrollTop > Number.parseFloat(getComputedStyle(e.target.firstElementChild).marginTop)) {
        document.getElementById('settingsContainer').setAttribute('scrolled', '')
    } else {
        document.getElementById('settingsContainer').removeAttribute('scrolled')
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

const settingsTabChangelog = document.getElementById('changelog')
const settingsChangelogTitle = settingsTabChangelog.getElementsByClassName('settingChangelogTitle')[0]
const settingsChangelogText = settingsTabChangelog.getElementsByClassName('settingChangelogText')[0]
const settingsChangelogButton = settingsTabChangelog.getElementsByClassName('settingChangelogButton')[0]

document.getElementById('settingChangelogDevToolsButton').onclick = (e) => {
    let window = remote.getCurrentWindow()
    window.toggleDevTools()
}

function populateVersionInformation(version, valueElement, titleElement, checkElement) {
    valueElement.innerHTML = version
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
    prepareChangelogTab()
}

prepareSettings();
