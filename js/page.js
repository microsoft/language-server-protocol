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
      mscc.on('consent', function() {
      })
    }
  }
})