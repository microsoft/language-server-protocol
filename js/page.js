$('#small-nav-dropdown').change(function() {
  window.location = $(this)
    .find('option:selected')
    .val()
})

$(function() {
  if (mscc) {
    if (!mscc.hasConsent()) {
      window.addEventListener('click', function() {
        if (!mscc.hasConsent()) {
          mscc.setConsent()
        }
      })

      mscc.on('consent', function() {
        window.dataLayer = window.dataLayer || []
        function gtag() {
          dataLayer.push(arguments)
        }
        gtag('js', new Date())
        gtag('config', 'UA-62780441-30', { anonymize_ip: true })
      })
    }
  }
})
