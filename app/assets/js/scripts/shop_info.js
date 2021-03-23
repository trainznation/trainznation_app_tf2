let shopInfoContainer = document.querySelector('#shopInfoContainer')

document.querySelector('[data-action="returnView"]').addEventListener('click', (e) => {
    e.preventDefault()
    let actual = VIEWS.shop_info

    switchView(actual, VIEWS.shop)
})

function onClickItemMod() {
    let items = document.querySelectorAll('.tab_item')

    items.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            console.log(item.dataset.modId)
            fetch(config.configuration[0].endpoint+'/mod/mod/'+item.dataset.modId)
                .then(res => res.json())
                .then(json => {
                    console.log(json)
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
                                <span class="iconify" data-inline="false" data-icon="${feat.type.icon}" title="${feat.type.name}"></span>
                            </div>
                            <a href="" class="name">${feat.value}</a>
                        </div>
                        `;
                    })
                    document.querySelector('[name="package"]').value = data.mod_id;
                    document.querySelector('#downloadTitleText').innerHTML = `Télécharger ${data.name}`;
                    document.querySelector('#modDescriptionContent').innerHTML = data.description;
                    document.querySelector('.news_summary').innerHTML = ``;

                    data.news.forEach((news) => {
                        document.querySelector('.news_summary').innerHTML = `
                            <a href="" class="summary_row">
                                <div class="summary_news_bg" style="background-color: rgb(255,255,255); background-image: url('https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans/35210272/27df34a3b3381c5f8d839eae8c195bc8162bef03_400x225.png');"></div>
                                <div class="summary_news_content">
                                    <div class="main_image_ctn">
                                        <img src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clans/35210272/27df34a3b3381c5f8d839eae8c195bc8162bef03_400x225.png" class="main_image" alt="">
                                    </div>
                                    <div class="text_ctn">
                                        <div class="title">${news.title}</div>
                                        <div class="date">${news.published_at}</div>
                                    </div>
                                </div>
                            </a>
                        `;
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

$(document).ready(() => {
    $(".carousel_content").slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        lazyLoad: "ondemand",
        arrows: false,
        fade: true,
        asNavFor: '.carousel_nav'
    })

    $(".carousel_nav").slick({
        slidesToShow: 5,
        slidesToScroll: 1,
        asNavFor: '.carousel_content',
        dots: true,
        centerMode: true,
        focusOnSelect: true,
        arrows: true
    })
})

exports.onClickItemMod = onClickItemMod;