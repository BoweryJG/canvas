// URL Debugger - Inject this before any other scripts
(function() {
  const OriginalURL = window.URL;
  let urlCallCount = 0;

  window.URL = function(url, base) {
    urlCallCount++;
    console.log(`[URL Debug #${urlCallCount}] Attempting to construct URL:`, {
      url: url,
      base: base,
      urlType: typeof url,
      urlValue: String(url),
      stackTrace: new Error().stack
    });

    try {
      return new OriginalURL(url, base);
    } catch (error) {
      console.error(`[URL Debug #${urlCallCount}] FAILED to construct URL:`, {
        url: url,
        base: base,
        urlType: typeof url,
        urlValue: String(url),
        error: error.message,
        stackTrace: new Error().stack
      });
      throw error;
    }
  };

  // Copy all properties
  for (const prop in OriginalURL) {
    if (OriginalURL.hasOwnProperty(prop)) {
      window.URL[prop] = OriginalURL[prop];
    }
  }

  Object.setPrototypeOf(window.URL, OriginalURL);
  Object.setPrototypeOf(window.URL.prototype, OriginalURL.prototype);

  console.log('[URL Debugger] Installed - All URL constructions will be logged');
})();