const tabs = document.querySelectorAll('.channelTab')

function listNews() {
    let opt = {
        order: "asc",
        published: "1",
        limit: 1000
    };
    const options = {
        method: 'POST',
        body: JSON.stringify(opt),
        headers: {
            'Content-Type': 'application/json'
        }
    }
    fetch(config.configuration[0].endpoint+'/blog/post/filter', options)
        .then(res => res.json())
        .then(json => {
            let content = document.querySelector('#listeNews')
            content.innerHTML = '';
            Array.from(json.DATA).forEach((item) => {
                content.innerHTML += `
            <div class="tileContainer">
                <a href="#" id="clickNewsOverlay" data-id="${item.id}">
                    <div class="tile">
                        <div class="tileContent">
                            <div class="tileContentText">
                                <div class="contentText_source">
                                    <div class="contentText_source_head">
                                        <div class="authorBlock">
                                            <img src="../assets/images/icons/logo.png" alt="" class="authorBlock_avatar">
                                            <div class="authorBlock_text">Trainznation Studio</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tileContentTitle">${item.title}</div>
                                <div class="tileContentCategory">
                                    <div class="tileContentCategory_text">${item.category.name}</div>
                                    <div class="tileContentCategory_date">${(item.published < moment().unix() && item.published >= moment().add('1', 'd').unix()) ? moment.unix(item.published).format('DD/MM/YYYY à HH:mm') : moment.unix(item.published).fromNow()}</div>
                                </div>
                                <div class="tileContentSummary">
                                    ${item.short}
                                </div>
                            </div>
                            <div class="tileContentCover">
                                <div class="tileContentCoverEncapsule">
                                    <div class="tileContentCoverImage" style="background-image: url('${item.image}')"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            `
            })
            clickOnNews()
        });
}

Array.from(tabs).forEach((tab) => {
    tab.addEventListener('click', (e) => {
        e.preventDefault()
        let category = tab.dataset.category ? tab.dataset.category : null
        let content = document.querySelector('#listeNews')
        let opt;
        if(category !== null) {
            opt = {
                order: "asc",
                published: "1",
                limit: 1000,
                category: category
            }
        } else {
            opt = {
                order: "asc",
                published: "1",
                limit: 1000
            }
        }

        const options = {
            method: 'POST',
            body: JSON.stringify(opt),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        fetch(config.configuration[0].endpoint+'/blog/post/filter', options)
            .then(res => res.json())
            .then(json => {
                document.querySelector('#channelTextTitle').innerHTML = tab.dataset.fetch ? tab.dataset.fetch : 'Toutes les news'
                content.innerHTML = '';
                Array.from(json.DATA).forEach((item) => {
                    content.innerHTML += `
                        <div class="tileContainer">
                            <a href="#" id="clickNewsOverlay" data-id="${item.id}">
                                <div class="tile">
                                    <div class="tileContent">
                                        <div class="tileContentText">
                                            <div class="contentText_source">
                                                <div class="contentText_source_head">
                                                    <div class="authorBlock">
                                                        <img src="../assets/images/icons/logo.png" alt="" class="authorBlock_avatar">
                                                        <div class="authorBlock_text">Trainznation Studio</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tileContentTitle">${item.title}</div>
                                            <div class="tileContentCategory">
                                                <div class="tileContentCategory_text">${item.category.name}</div>
                                                <div class="tileContentCategory_date">${(item.published < moment().unix() && item.published >= moment().add('1', 'd').unix()) ? moment.unix(item.published).format('DD/MM/YYYY à HH:mm') : moment.unix(item.published).fromNow()}</div>
                                            </div>
                                            <div class="tileContentSummary">
                                                ${item.short}
                                            </div>
                                        </div>
                                        <div class="tileContentCover">
                                            <div class="tileContentCoverEncapsule">
                                                <div class="tileContentCoverImage" style="background-image: url('${item.image}')"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                        `
                })
                clickOnNews()
            })
            .catch(err => {
                console.error(err)
            })
    })
})

function clickOnNews() {
    let news = document.querySelectorAll("#clickNewsOverlay")

    Array.from(news).forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            fetch(config.configuration[0].endpoint+'/blog/post/'+item.dataset.id)
                .then(res => res.json())
                .then(json => {
                    let modal = document.getElementById("modalNewsOverlay")
                    modal.innerHTML = ``
                    modal.innerHTML += `
                    <div class="newsOverlayPage">
                        <div class="newsBanner">
                            <div class="newsBanner_ctn">
                                <div class="newsBanner_ctn_background" style="background-image: url('https://cdn.cloudflare.steamstatic.com/steam/apps/1097150/header.jpg?t=1616428184');"></div>
                                <div class="newsBanner_ctn_group">
                                    <div class="ctn_group_logo">
                                        <img src="${json.DATA.category.image}" alt="" class="banner_logo">
                                    </div>
                                    <div class="ctn_group_title">${json.DATA.category.name}</div>
                                    <div class="ctn_group_action">
                                        <a href="" class="">Suivre sur Trainznation</a>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                    <img src="${json.DATA.image}" alt="" class="display_cover_background">
                                    <img src="${json.DATA.image}" alt="" class="display_background_blur">
                                    <div class="titleContainer">
                                        <div class="titleContainerDetail">
                                            <div class="detailTypeAndTime">
                                                <div class="detailTimeInfo">PUBLIE le ${moment.unix(json.DATA.published).format('DD MMMM YYYY à HH:mm')}</div>
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
                    closeNewOverlay()
                })
                .catch(err => {
                    console.error(err)
                })
        })
    })
}

function closeNewOverlay() {
    let btn = $("#modalNewsOverlay").find('.closeBtn')
    btn.on('click', (e) => {
        e.preventDefault()
        document.querySelector('#modalNewsOverlay').style.display = 'none'
    })
}


window.addEventListener('DOMContentLoaded', (e) => {
    listNews()
    clickOnNews()
})