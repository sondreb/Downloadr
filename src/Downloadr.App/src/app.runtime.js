'use strict';

var environment = {};

// Figure out how to see if the app runs as Windows 10 app when time comes.

if (chrome && chrome.app.runtime) {
    environment.chrome = true;
}
else if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
    environment.cordova = true;
}
else {
    environment.browser = true;
}

module.exports = environment;