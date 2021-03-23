function LoadMore() {
    $(function () {
        $(".tab_item").slice(0, 4).show().css('display', 'block')
        $("#btnLoadMore").on('click', (e) => {
            e.preventDefault()
            $(".tab_item:hidden").slice(0,4).css('display', 'block').slideDown();


            if($(".tab_item:hidden").length === 0) {
                $("#load").fadeOut('slow')
            }

            if(!$(".tab_item:hidden")) {
                $("#btnLoadMore").hide()
            }
        })
    })
}

exports.LoadMore = LoadMore;

