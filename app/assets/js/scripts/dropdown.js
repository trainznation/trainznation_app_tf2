let toClose = null;

function toggle(e) {
    e.stopPropagation();
    let btn=this;
    let menu = btn.nextSibling;

    while(menu && menu.nodeType !== 1) {
        menu = menu.nextSibling;
    }

    if(!menu) return;

    if (menu.style.display !== 'block') {
        menu.style.display = 'block';
        if(toClose) toClose.style.display="none";
        toClose  = menu;
    } else {
        menu.style.display = 'none';
        toClose=false;
    }
}

function closeAll() {
    toClose.style.display='none';
}

document.querySelectorAll(".dropdown").forEach(function(btn){
    btn.addEventListener("click",toggle,true);
});


document.querySelectorAll('[data-log="menuAction"]').forEach((menuAction) => {
    menuAction.addEventListener('click', (e) => {
        e.preventDefault()
        switch (menuAction.dataset.action) {
            case 'searchUpdate':
                ipcRenderer.send('update-available')
                break;

            case 'openSetting':
                switchView(getCurrentView(), VIEWS.settings);
                break;

            case 'openChangelog':
                switchView(getCurrentView(), VIEWS.changelog);
                break;

            case 'appClose':
                remote.getCurrentWindow().close();
                break;

            case 'showWelcome':
                switchView(getCurrentView(), VIEWS.landing)
                break;

            case 'showShop':
                switchView(getCurrentView(), VIEWS.shop)
                break;

            case 'showMyMod':
                switchView(getCurrentView(), VIEWS.library)
                break;

            case 'showDownload':
                switchView(getCurrentView(), VIEWS.download)
                break;

            case 'showAbout':
                setOverlayContent(
                    'A Propos du Launcher Trainznation TF2',
                    `
                        Client Trainznation Mod Launcher<br>
                        <strong>Version: </strong> ${pjson.version}<br>
                        <a href="https://tf2.trainznation.tk/app/trainznation_mod">https://tf2.trainznation.tk/app/trainznation_mod</a>
                    `,
                    'Fermer',
                    true
                )
                setOverlayHandler(() => {
                    document.getElementById('overlayContainer').style.display = 'none';
                })
                toggleOverlay(true)
                break;

            case 'showWebsite':
                shell.openExternal('https://tf2.trainznation.tk/app').catch(err => {
                    setOverlayContent(
                        'Erreur !!',
                        `Erreur: ${err}`,
                        'Fermer',
                        true
                    )
                    setOverlayHandler(() => {
                        document.getElementById('overlayContainer').style.display = 'none';
                    })
                    toggleOverlay(true)
                })


        }
    })
})

window.onclick=function(event){
    if (toClose){
        closeAll.call(event.target);
    }
};


