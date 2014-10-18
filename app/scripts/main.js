/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/trunk/apps/app.runtime.html
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */

'use strict';

chrome.app.runtime.onLaunched.addListener(function () {
    // Center window on screen.
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    var width = 850;
    var height = 600;

    chrome.app.window.create('index.html', {
        id: 'downloadrWindow',
        frame: 'none',
        outerBounds: {
            width: width,
            height: height,
            left: Math.round((screenWidth - width) / 2),
            top: Math.round((screenHeight - height) / 2),
            minWidth: 400,
            minHeight: 450
        }
    });
});

chrome.runtime.onSuspend.addListener(function () {
    // Do some simple clean-up tasks.
});


/*
"management" api is not available for Chrome Apps. Was unable to find any
events that can be listened on when app is being uninstalled. Verify if the
synced Chrome storage is deleted upon uninstall, to ensure that the auth
tokens does not persist on the users machine.
*/
/*
chrome.management.onUninstalled.addListener(function() {
  alert("Uninstalling");
});*/

//chrome.runtime.onUpdateAvailable.addListener(function (details) {
//    console.log("updating to version " + details.version);
//    chrome.runtime.reload();
//});

//chrome.runtime.requestUpdateCheck(function (status) {
//    if (status == "update_available") {
//        console.log("update pending...");
//    } else if (status == "no_update") {
//        console.log("no update found");
//    } else if (status == "throttled") {
//        console.log("Oops, I'm asking too frequently - I need to back off.");
//    }
//});
