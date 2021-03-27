let searchInput = document.querySelector('#searchInput')
let sidebarContainer = document.querySelector('.libraryContent')

db.getAll('library', pathDatabase, (succ, data) => {
    if(succ) {
        sidebarContainer.innerHTML = ``
        let mods = Array.from(data)

        if(mods.length === 0) {
            sidebarContainer.innerHTML += `
            <div class="warningContainer"> 
                <span class="iconify" data-inline="false" data-icon="ant-design:warning-outlined"></span>
                <span class="texting">Aucun mod actuellement dans la bibliothèque</span>
            </div>
            `
        } else {
            mods.forEach((mod) => {
                let installed = {
                    'not_installed': {'class': ''},
                    'installed': {'class': 'modInstalled'},
                }

                sidebarContainer.innerHTML += `
                <li class="${installed[mod.install.status].class}" data-mod-id="${mod.mod_id}">
                    <div class="icon">
                        <img src="${mod.images.icon_x_small}" alt="${mod.name}">
                    </div>
                    <div class="modTitle">${mod.name}</div>
                </li>
                `
            })
        }
        searchingModInList()
    } else {
        console.error(data)
    }
})

function searchingModInList() {
    searchInput.addEventListener('keyup', (e) => {
        e.preventDefault()
        let filter = searchInput.value.toUpperCase()
        let li = sidebarContainer.getElementsByTagName('li')

        let i
        for (i = 0; i < li.length; i++) {
            let title = li[i].getElementsByClassName('modTitle')
            let txtValue = title.textContent || title.innerText

            if(txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none"
            }
        }
    })
}