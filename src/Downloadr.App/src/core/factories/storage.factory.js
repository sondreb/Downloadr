'use strict';
// @ngInject
function storage(runtime, localStorageService) {

    var set = function (key, data, callback) {

        if (runtime.chrome) {
            var json = {};
            json[key] = data;
            chrome.storage.sync.set(json, callback);
        }
        else {
            localStorageService.set(key, data);
            callback();
        }

    };

    var setLocal = function (data, callback) {

        if (runtime.chrome) {
            chrome.storage.local.set(data, callback);
        }
        else {
            localStorageService.set(key, data);
            callback();
        }

    };

    var get = function (key, callback) {

        if (runtime.chrome) {
            // Try to find existing token.
            chrome.storage.sync.get(key, callback);
        }
        else {
            var result = localStorageService.get(key);
            callback(result);
        }

    };

    var getLocal = function (key, callback) {
        if (runtime.chrome) {
            // Try to find existing token.
            chrome.storage.local.get(key, callback);
        }
        else {
            var result = localStorageService.get(key);
            callback(result);
        }

    };

    var remove = function (key, callback) {

        if (runtime.chrome) {
            chrome.storage.sync.remove(key, callback);
        }
        else {
            localStorageService.remove(key);
            callback();
        }

    };

    var removeLocal = function (key, callback) {

        if (runtime.chrome) {
            chrome.storage.local.remove(key, callback);
        }
        else {
            // Add storage strategy for other browser.
        }

    };

    return {
        set: set,
        setLocal: setLocal,
        get: get,
        getLocal: getLocal,
        remove: remove,
        removeLocal: removeLocal
    };

};

module.exports = storage;