const button = {
    btnMinimized: document.getElementById('btnMinimized'),
    btnMaximized: document.getElementById('btnMaximized'),
    btnClose: document.getElementById('btnClose'),
    btnNotification: document.getElementById('btnNotifications')
}

button.btnMinimized.addEventListener("click", () => {
    remote.getCurrentWindow().minimize();
})

button.btnMaximized.addEventListener('click', () => {
    remote.getCurrentWindow().maximize();
})

button.btnClose.addEventListener('click', () => {
    remote.getCurrentWindow().close();
})

function fetchingAnnounce() {
    fetch(config.configuration[0].endpoint+'/setting/announcement')
        .then(res => res.json())
        .then(json => {
            document.querySelector('.notifications').innerHTML = ``;
            Array.from(json.DATA).forEach((data) => {
                let type = {
                    'success': {'icon': 'bx:bx-comment-check', 'color': 'green'},
                    'info': {'icon': 'tabler:info-square', 'color': 'blue'},
                    'warning': {'icon': 'carbon:warning-square-filled', 'color': 'orange'},
                    'danger': {'icon': 'uil:times-square', 'color': 'red'},
                }

                document.querySelector('.notifications').innerHTML += `<li><span class="iconify" data-inline="false" data-icon="${type[data.type].icon}" style="color: ${type[data.type].color}; width: 34px; height: 34px;"></span> ${data.title}</li>`;
            })
        })
        .catch(err => {
            Toastify({
                text: "Impossible de ce connecter au serveur de donnée: "+err,
                backgroundColor: "#af4c4c",
                position: 'right',
            }).showToast();
        })
}

setTimeout(() => {
    fetchingAnnounce()
    setInterval(fetchingAnnounce, 60000)
}, 1000);

