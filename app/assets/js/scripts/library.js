document.querySelector('[data-action="returnView"]').addEventListener('click', (e) => {
    e.preventDefault()
    let actual = VIEWS.library

    switchView(actual, VIEWS.landing)
})