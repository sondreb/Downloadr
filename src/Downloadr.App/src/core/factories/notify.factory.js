'use strict';
// @ngInject
function notify() {
    return function (id, type, title, body, callback, progress) {

        chrome.notifications.onClicked.addListener(function (id) {
            // Launch the local file browser at the target destination.
            callback(id);
        });

        var options = {
            type: type,
            title: title,
            message: body,
            iconUrl: 'images/icon_128.png',
            progress: progress
        };

        chrome.notifications.create(id, options, function (notificationId) { });

    };
};

module.exports = notify;