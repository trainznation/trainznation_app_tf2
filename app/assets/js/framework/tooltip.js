let tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]')

tooltipElements.forEach((tooltip) => {
    tooltip.addEventListener('mouseover', (e) => {
        e.preventDefault()
        let el = document.createElement("div")
        el.classList.add('popup')
        el.innerHTML = `<span class="popuptext">${tooltip.dataset.title}</span>`

        tooltip.appendChild(el)
    })

    tooltip.addEventListener('mouseleave', (e) => {
        e.preventDefault()
        tooltip.querySelector('.popup').remove()
    })
})