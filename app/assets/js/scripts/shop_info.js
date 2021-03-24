let shopInfoContainer = document.querySelector('#shopInfoContainer')

document.querySelector('[data-action="returnView"]').addEventListener('click', (e) => {
    e.preventDefault()
    let actual = VIEWS.shop_info

    switchView(actual, VIEWS.shop)
})

function closeNewModOverlay() {
    let close = document.querySelectorAll('.closeBtn')

    close.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            document.querySelector('#modalNewsModOverlay').style.display = 'none'
        })
    })
}

function onClickItemMod() {
    let items = document.querySelectorAll('.tab_item')

    items.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            $("#shopInfoContainer").attr('data-mod', item.dataset.modId)
            let modId = $("#shopInfoContainer").attr('data-mod')
            fetch(config.configuration[0].endpoint+'/mod/mod/'+item.dataset.modId)
                .then(res => res.json())
                .then(json => {
                    let data = json.DATA
                    document.querySelector('.blockbg').innerHTML = `<a>Tous les mods</a> > <a>${data.category.name}</a> > <a>${data.name}</a>`;
                    document.querySelector('.appName').innerHTML = data.name;
                    document.querySelector('.mod_header_image_full').setAttribute('src', data.images.banner_small)
                    document.querySelector('.mod_description_snippet').innerHTML = data.short
                    document.querySelector('[data-flesh="date"]').innerHTML = data.published_at.format
                    document.querySelector('[data-flesh="version"]').innerHTML = data.mod_version

                    document.querySelector('.tags_content').innerHTML = ``;
                    data.tags.forEach((tag) => {
                        document.querySelector('.tags_content').innerHTML += `<a class="app_tag">${tag.tag}</a>`;
                    })

                    document.querySelector('#mod_meta_data').innerHTML = ``;
                    data.features.forEach((feat) => {
                        document.querySelector('#mod_meta_data').innerHTML += `
                        <div class="detail_spec_container">
                            <div class="icon">
                                <span class="iconify" data-inline="false" data-icon="${feat.icon}" title="${feat.type}"></span>
                            </div>
                            <a href="" class="name">${feat.value}</a>
                        </div>
                        `;
                    })
                    document.querySelector('[name="package"]').value = data.mod_id;
                    document.querySelector('#downloadTitleText').innerHTML = `Télécharger ${data.name}`;
                    document.querySelector('#modDescriptionContent').innerHTML = data.description;
                    document.querySelector('.news_summary').innerHTML = ``;

                    let headers = {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    };

                    let bodyNews = {
                        "limit": 2,
                        "state": 2,
                        "order": "published_at",
                        "sort": "asc"
                    }
                    fetch(config.configuration[0].endpoint+'/mod/mod/'+modId+'/news/filter',{
                        method: 'POST',
                        headers,
                        body: JSON.stringify(bodyNews),
                    })
                        .then(res => res.json())
                        .then(json => {
                            if(Array.from(json.DATA).length !== 0) {
                                json.DATA.forEach((nouv) => {
                                    document.querySelector('.news_summary').innerHTML += `
                                    <a href="" class="summary_row" data-mod="${nouv.mod_id}" data-id="${nouv.id}">
                                        <div class="summary_news_bg" style="background-color: rgb(255,255,255); background-image: url('${nouv.images}');"></div>
                                        <div class="summary_news_content">
                                            <div class="main_image_ctn">
                                                <img src="${nouv.images}" class="main_image" alt="">
                                            </div>
                                            <div class="text_ctn">
                                                <div class="title">${nouv.title}</div>
                                                <div class="date">${nouv.published_at.format}</div>
                                            </div>
                                        </div>
                                    </a>
                                `;
                                    onClickItemModNews()
                                })
                            } else {
                                document.querySelector('.news_summary').innerHTML += `
                                <div class="summary_row_not_content_container"> 
                                    <div class="icon"> 
                                        <span class="iconify" data-inline="false" data-icon="ant-design:warning-outlined"></span>
                                    </div>
                                    <div class="text">Aucune news actuellement disponible pour ce mod</div>
                                </div>
                                `;
                            }
                        })
                        .catch(err => {
                            setOverlayContent(
                                'Erreur Système de récupération de contenue',
                                "Erreur: "+err,
                                'Fermer', 'Dismiss'
                            )
                            setOverlayHandler(() => {
                                const window = remote.getCurrentWindow();
                                window.close()
                            })
                            toggleOverlay(true)
                            console.error(err)
                        })

                    let bodyFile = {
                        "type": ["image", "video"]
                    }

                    fetch(config.configuration[0].endpoint+'/mod/mod/'+modId+'/files/filter', {
                        method: "POST",
                        headers,
                        body: JSON.stringify(bodyFile),
                    })
                        .then(res => res.json())
                        .then(json => {
                            let carouselContent = document.getElementById('carousel_content')
                            let carouselNav = document.getElementById('carousel_nav')
                            carouselContent.innerHTML = ``
                            carouselNav.innerHTML = ``
                            let splideNav = new Splide( '.carousel_nav' , {
                                fixedWidth  : 100,
                                height      : 60,
                                gap         : 10,
                                cover       : true,
                                isNavigation: true,
                                focus       : 'center',
                                breakpoints : {
                                    '600': {
                                        fixedWidth: 66,
                                        height    : 40,
                                    }
                                },
                            }).mount(window.splide.Extensions);
                            let splide = new Splide( '.carousel_content', {
                                type       : 'fade',
                                heightRatio: 0.5,
                                pagination : false,
                                arrows     : false,
                                cover      : true,
                            } ).mount(window.splide.Extensions);

                            splide.sync(splideNav).mount();

                            json.DATA.forEach((file) => {
                                if(file.type === 'image') {
                                    carouselContent.innerHTML += `
                                    <li class="splide__slide"> 
                                        <img src="${file.file_uri}" alt="${file.nameFile}" />
                                    </li>
                                `

                                    carouselNav.innerHTML += `
                                    <li class="splide__slide"> 
                                        <img src="${file.file_uri}" alt="${file.nameFile}" />
                                    </li>
                                `
                                }

                                if(file.type === 'video') {
                                    carouselContent.innerHTML += `
                                    <li class="splide__slide" data-splide-html-video="${file.file_uri}"> 
                                        <img src="${file.file_uri}" alt="${file.nameFile}" />
                                    </li>
                                `

                                    carouselNav.innerHTML += `
                                    <li class="splide__slide"> 
                                        <img src="${file.file_uri}" alt="${file.nameFile}" />
                                    </li>
                                `
                                }
                            })

                            console.log(json)
                            console.info("Carousel Charger")
                        })
                        .catch(err => {
                            setOverlayContent(
                                'Erreur Système de récupération de contenue',
                                "Erreur: "+err,
                                'Fermer', 'Dismiss'
                            )
                            setOverlayHandler(() => {
                                const window = remote.getCurrentWindow();
                                window.close()
                            })
                            toggleOverlay(true)
                            console.error(err)
                        })

                    switchView(getCurrentView(), VIEWS.shop_info)
                })
                .catch(err => {
                    setOverlayContent(
                        'Erreur Système de récupération de contenue',
                        "Erreur: "+err,
                        'Fermer', 'Dismiss'
                    )
                    setOverlayHandler(() => {
                        const window = remote.getCurrentWindow();
                        window.close()
                    })
                    toggleOverlay(true)
                    console.error(err)
                })
        })
    })
}

function onClickItemModNews() {
    let items = document.querySelectorAll('.summary_row')

    items.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            fetch(config.configuration[0].endpoint+'/mod/mod/'+item.dataset.mod+'/news/'+item.dataset.id)
                .then(res => res.json())
                .then(json => {
                    let modal = document.getElementById("modalNewsModOverlay")
                    modal.innerHTML = ``
                    modal.innerHTML += `
                    <div class="newsOverlayPage">
                        <div class="newsBody" tabindex="-1">
                            <div class="newsCtnSection">
                                <div class="newsCtnSectionWidth">
                                    <div class="newsCtnSectionRightSide">
                                        <div class="closeBtn">
                                            <span class="iconify" data-inline="false" data-icon="clarity:close-line"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="newsContainer">
                                <div class="newsContainerDisplay">
                                    <img src="${json.DATA.images}" alt="" class="display_cover_background">
                                    <img src="${json.DATA.images}" alt="" class="display_background_blur">
                                    <div class="titleContainer">
                                        <div class="titleContainerDetail">
                                            <div class="detailTypeAndTime">
                                                <div class="detailTimeInfo">PUBLIE le ${json.DATA.published_at.format}</div>
                                            </div>
                                            <a href="" class="title">${json.DATA.title}</a>
                                            <div class="subtitle">${json.DATA.short}</div>
                                        </div>
                                    </div>
                                    <div class="bodyContainer">
                                        <div class="bodyContainerDetail">
                                            ${json.DATA.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    modal.style.display = 'block';
                    closeNewModOverlay()
                })
                .catch(err => {
                    setOverlayContent(
                        'Erreur Système de récupération de contenue',
                        "Erreur: "+err,
                        'Fermer', 'Dismiss'
                    )
                    toggleOverlay(true)
                    console.error(err)
                })
        })
    })
}

document.addEventListener( 'DOMContentLoaded', function () {

})

exports.onClickItemMod = onClickItemMod;