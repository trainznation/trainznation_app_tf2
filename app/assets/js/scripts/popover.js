let triggerTooltip = document.querySelectorAll('[data-toggle="tooltip"]')
let triggerPopover = document.querySelectorAll('[data-toggle="popover"]')

let templateTooltip = document.querySelector('#tooltipContainer')
let templatePopover = document.querySelector('#popoverContainer')

function onTippyScriptLoaded(tooltip) {
    tippy(tooltip, {
        placement: (tooltip.dataset.placement) ? tooltip.dataset.placement : 'left',
        boundary: document.getElementById('page-wrapper'),
        touch: false,
        theme: 'bbf',
        content: tooltip.dataset.title
    });
}

$(function ($) {
    $.getScript('https://unpkg.com/popper.js@1', function() {
        $.getScript('https://unpkg.com/tippy.js@4', () => {
            triggerTooltip.forEach((tooltip) => {
                onTippyScriptLoaded(tooltip)
            })
        });
    });
})

// Schema Tooltip

triggerTooltip.forEach((tooltip) => {
    tooltip.addEventListener('mouseover', (e) => {
        e.preventDefault()

        Popper.createPopper(tooltip, templateTooltip, {
            placement: tooltip.dataset.placement ? tooltip.dataset.placement : 'top'
        });

        console.log("OVER")
    })

    tooltip.addEventListener('click', (e) => {
        e.preventDefault()

        Popper.createPopper(tooltip, templateTooltip, {
            placement: tooltip.dataset.placement ? tooltip.dataset.placement : 'top'
        });

        console.log("Click")
    })
})