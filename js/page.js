document.addEventListener('DOMContentLoaded', function () {
  // Dropdown navigation for mobile
  var dropdown = document.getElementById('small-nav-dropdown');
  if (dropdown) {
    dropdown.addEventListener('change', function () {
      window.location = this.value;
    });
  }

  // Theme toggle
  var toggle = document.getElementById('theme-toggle');
  var iconDark = document.getElementById('theme-icon-dark');
  var iconLight = document.getElementById('theme-icon-light');

  function updateThemeIcons(theme) {
    if (iconDark && iconLight) {
      // Show moon icon in light mode (click to go dark), sun icon in dark mode (click to go light)
      iconDark.style.display = theme === 'light' ? '' : 'none';
      iconLight.style.display = theme === 'dark' ? '' : 'none';
    }
    // Update Microsoft logo visibility
    var logoDark = document.getElementById('ms-logo-dark');
    var logoLight = document.getElementById('ms-logo-light');
    if (logoDark && logoLight) {
      logoDark.style.display = theme === 'dark' ? '' : 'none';
      logoLight.style.display = theme === 'light' ? '' : 'none';
    }
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-bs-theme') || 'light';
  }

  updateThemeIcons(getTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = getTheme();
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', next);
      localStorage.setItem('lsp-theme', next);
      updateThemeIcons(next);
    });
  }

  // Analytics / Cookie consent
  var site_tag = 'UA-62780441-30';

  function loadAnalytics(gtag) {
    // set cookie to expire in 12 x 28 days
    gtag('config', site_tag, { 'anonymize_ip': true, 'cookie_expires': 29030400 });
  }

  function consentRequired() {
    return window.WcpConsent && WcpConsent.siteConsent && WcpConsent.siteConsent.isConsentRequired;
  }

  function onConsentChanged() {
    function gtag() {
      window.dataLayer.push(arguments);
    }
    if (!consentRequired() || WcpConsent.siteConsent.getConsentFor(WcpConsent.consentCategories.Analytics)) {
      // Load GA
      loadAnalytics(gtag);
    }
  }

  // Load GA upfront because we classify it as essential cookie
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());

  if (window.WcpConsent) {
    WcpConsent.init("en-US", "cookie-banner", function (err, _siteConsent) {}, onConsentChanged, WcpConsent.themes.light);
  }

  var cookieManager = document.getElementById('footer-cookie-link');
  if (consentRequired() && cookieManager && cookieManager.parentElement) {
    cookieManager.parentElement.style.visibility = 'visible';
  }

  // initialize consent
  onConsentChanged();
});
