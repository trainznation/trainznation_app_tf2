function listNews() {
    fetch(config.configuration[0].endpoint+'/blog/post')
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
                                            <img src="../images/icons/logo.png" alt="" class="authorBlock_avatar">
                                            <div class="authorBlock_text">Trainznation Studio</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tileContentTitle">${item.title}</div>
                                <div class="tileContentCategory">
                                    <div class="tileContentCategory_text">${item.category.name}</div>
                                    <div class="tileContentCategory_date">${item.published}</div>
                                </div>
                                <div class="tileContentSummary">
                                    ${item.content}
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
        });
}


window.addEventListener('DOMContentLoaded', (e) => {
    listNews()
})