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