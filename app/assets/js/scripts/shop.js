const loadMore = require(path.join(__dirname, "../", "assets","js", "scripts", "loadMore.js"))
const shopInfo = require(path.join(__dirname, "../", "assets","js", "scripts", "shop_info.js"))
let table_shop = document.querySelector('#table_shop')
let menu = document.getElementById('shopMenu')
let loading = document.querySelector('.loader')

document.querySelector('[data-action="returnView"]').addEventListener('click', (e) => {
    e.preventDefault()
    let actual = VIEWS.shop
})

function populateMenuCategory() {
    fetch(config.configuration[0].endpoint+'/mod/category')
        .then(res => res.json())
        .then(json => {
            Array.from(json.DATA).forEach((data) => {
                menu.innerHTML += `
                <li class="menu_item">
                    <a href="" class="menu_link" data-filter="${data.id}">${data.name}</a>
                </li>
                `
            })
            fetchingByCategory()
        })
        .catch(err => {
            console.error(err)
        })
}

function populateAllMod() {
    loading.style.display = 'block';
    table_shop.innerHTML = ``
    $("#btnLoadMore").hide()
    fetch(config.configuration[0].endpoint+'/mod/mod')
        .then(res => res.json())
        .then(json => {
            table_shop.innerHTML = ``;
            loading.style.display = 'none';
            $("#btnLoadMore").show()
            Array.from(json.DATA).forEach((data) => {
                table_shop.innerHTML += `
                <a href="" class="tab_item" data-mod-id="${data.id}">
                    <div class="tab_item_cap">
                        <img src="${data.images.banner_extra_small}" alt="" class="img-responsive">
                    </div>
                    <div class="tab_item_content">
                        <div class="tab_item_name">${data.name}</div>
                        <div class="tab_item_desc">${data.short}</div>
                        <div class="tab_item_tags">${data.category.name}</div>
                    </div>
                </a>
                `;
            })
            loadMore.LoadMore()
            shopInfo.onClickItemMod()
        })
}

function fetchingByCategory() {
    let links = document.querySelectorAll('.menu_link')
    links.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            loading.style.display = 'block';
            table_shop.innerHTML = ``
            $("#btnLoadMore").hide()

            if(item.dataset.filter === 'all') {
                populateAllMod()
            } else {
                let headers = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }

                fetch(config.configuration[0].endpoint+'/mod/mod/filter', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({'category': item.dataset.filter})
                })
                    .then(res => res.json())
                    .then(json => {
                        loading.style.display = 'none';
                        $("#btnLoadMore").show()
                        json.DATA.forEach((data) => {
                            table_shop.innerHTML += `
                        <a href="" class="tab_item" data-mod-id="${data.id}">
                            <div class="tab_item_cap">
                                <img src="${data.images.banner_extra_small}" alt="" class="img-responsive">
                            </div>
                            <div class="tab_item_content">
                                <div class="tab_item_name">${data.name}</div>
                                <div class="tab_item_desc">${data.short}</div>
                                <div class="tab_item_tags">${data.category.name}</div>
                            </div>
                        </a>
                        `;
                        })
                        loadMore.LoadMore()
                        shopInfo.onClickItemMod()
                    })
                    .catch(err => {
                        console.error(err)
                    })
            }
        })
    })
}


function initShop() {
    $(document).ready(() => {
        populateMenuCategory()
        populateAllMod()
    })
}

initShop()


