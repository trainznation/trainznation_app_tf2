function InitChangelog() {
    let releaseNote = $('#release-notes')
    releaseNote.html('<div class="loader">&nbsp;</div>')

    let urlChangelog;
    if(is.development) {
        urlChangelog = 'https://download.trainznation.io/tf2/app/changelog_tf2_mod.json'
    } else {
        urlChangelog = 'https://download.trainznation.io/tf2/app/changelog_tf2_mod.json'
    }

    fetch(urlChangelog)
        .then(res => res.json())
        .then(json => {
            buildRelease(json)
        })
        .catch(err => {
            setOverlayContent('Erreur lors de la génération du changelog', `Erreur: ${err}`, 'Fermer', true)
            setOverlayHandler(() => {
                app.quit()
            })
            toggleOverlay(true)
            console.error(err)
        })
}

function buildRelease(data) {
    let releases = $.map(data, createRelease)

    $('#release-notes').empty().append(releases)
}

function createRelease(r) {
    let changes = r.notes.filter(isRegularNote)

    let header = $('<header class=\'timeline-decorator\' />')
        .append($('<span class=\'version-badge bg-purple\' />').text(r.version))
        .append($('<h2 class=\'version-date\' />').text(r.pub_date ? moment(r.pub_date).format('DD MMMM YYYY') : ''))

    let changelog = $('<ul class=\'changelog\' />')
        .append($.map(changes, createChange))

    return $('<section class=\'releaseNoteSection\' />').append(header).append(changelog)
}

function isRegularNote(changeText) {
    return !/^\s*\[pretext\]\s/i.test(changeText)
}

function createChange(changeText) {
    if (changeText !== '') {
        let trimmed = $.trim(changeText)
        let typeMatches = trimmed.match(/^\[(new|fixed|improved|deleted|added)\]\s(.*)/i)
        let elClassName = 'changelog-item'
        if (typeMatches) {
            let changeType = typeMatches[1]
            let changeDescription = typeMatches[2]

            let changePieces = changeDescription.split(/(#\d+)/i)

            let el = $('<li />').addClass(elClassName)

            el.append($('<div class=\'badge\' />')
                .addClass(`badge-${changeType.toLowerCase()}`)
                .text(changeType))

            let changeDescriptionContainer = $('<div class=\'description\' />')

            for (let i = 0; i < changePieces.length; i++) {
                let piece = changePieces[i]
                let issuePieces = piece.match(/#(\d+)/i)

                if(issuePieces) {
                    let link = $("<a>").attr("href", "https://github.com/trainznation/trainznation_app_tf2/issues/"+issuePieces[i]).text(piece)
                    changeDescriptionContainer = changeDescriptionContainer.append(link)
                } else {
                    changeDescriptionContainer = changeDescriptionContainer.append(document.createTextNode(piece))
                }
            }

            el = el.append(changeDescriptionContainer)

            return el;
        }

        return $("<li />").addClass(elClassName).text(changeText);
    }
}

document.addEventListener( 'DOMContentLoaded', function () {
    InitChangelog();
})


