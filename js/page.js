$('#small-nav-dropdown').change(function() {
  window.location = $(this)
    .find('option:selected')
    .val()
})

$(function() {
  // Load GA upfront because we classify it as essential cookie
  window.dataLayer = window.dataLayer || []
  function gtag() {
    dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', 'UA-62780441-30', { anonymize_ip: true })

  if (mscc) {
    if (!mscc.hasConsent()) {
      window.addEventListener('click', function() {
        if (!mscc.hasConsent()) {
          mscc.setConsent()
        }
      })

      // Where future non-essential tracking cookie need to go
      mscc.on('consent', function() {})
    }
  }
})

var anchorForId = function(id) {
  var anchor = document.createElement('a')
  anchor.className = 'header-link'
  anchor.href = '#' + id
  anchor.innerHTML = '<i class="fa fa-link"></i>'
  return anchor
}

var linkifyAnchors = function(level, containingElement) {
  var headers = containingElement.getElementsByTagName('h' + level)
  for (var h = 0; h < headers.length; h++) {
    var header = headers[h]

    if (typeof header.id !== 'undefined' && header.id !== '') {
      header.appendChild(anchorForId(header.id))
    }
  }
}

document.onreadystatechange = function() {
  if (this.readyState === 'complete') {
    var contentBlock = document.getElementById('markdown-content-container')
    if (!contentBlock) {
      return
    }
    for (var level = 2; level <= 4; level++) {
      linkifyAnchors(level, contentBlock)
    }
  }
}
