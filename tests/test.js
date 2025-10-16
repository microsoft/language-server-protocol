window.onload = function() {
  var iframe = document.getElementById('site-frame');
  var iframeWindow = iframe.contentWindow;

  iframe.onload = function() {
    var implementationsLink = iframeWindow.document.querySelector('a[href="/language-server-protocol/overviews/implementations"]');

    if (implementationsLink) {
      console.log('Test passed: Implementations link found.');
    } else {
      console.error('Test failed: Implementations link not found.');
    }
  };
};
