let modal = document.querySelector('.modal-img')
let imgs = document.querySelectorAll('.img-gallery')

imgs.forEach((img) => {
    img.addEventListener('click', (e) => {
        e.preventDefault()
        modal.querySelector('.modal-content').setAttribute('src', img.getAttribute('src'))
        $(".modal-img").fadeIn()

        let span = document.getElementsByClassName("close")[0];

        span.addEventListener('click', () => {
            $(".modal-img").fadeOut()
        })
    })
})

