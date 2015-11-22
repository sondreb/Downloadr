'use strict';
// @ngInject
function FolderController($scope, $rootScope, downloadManager, $state, $timeout, state, logger, userSettings) {
    var log = logger.Create('FolderController');

    $scope.userSettings = userSettings;
    $scope.count = downloadManager.state.count;
    $scope.path = '';

    $rootScope.$broadcast('status', {
        message: 'Choose folder to save ' + $scope.count + ' photos.'
    });

    $scope.sizes = [{
        size: 'o',
        title: 'Original'
    },
    {
        size: 'l',
        title: 'Large (1024x768)'
    },
    {
        size: 'z',
        title: 'Medium (640x480)'
    },
    {
        size: 'n',
        title: 'Small (320x240)'
    },
    {
        size: 'q',
        title: 'Square (150x150)'
    }];

    $scope.beginDownload = function () {
        log.debug('beginDownload');
        $state.transitionTo('download');
    };

    /**
     * @param {string} File name.
     * @return {string} Sanitized File name.
     * Returns a sanitized version of a File Name.
     */
    $scope.sanitizeFileName = function (fileName) {
        return fileName.replace(/[^a-z0-9\-]/gi, ' ').substr(0, 50).trim();
    };

    $scope.lastError = function () {
        console.log(chrome.runtime.lastError);

        var filePath = '~\\Pictures\\Flickr\\downloadr.jpg';

        chrome.fileSystem.getWritableEntry(filePath, function (writableFileEntry) {

            console.log('WRITEABLE!');

        });

        console.log('Last error completed');
    };

    function errorHandler(err) {
        console.log('ERROR!! : ', err);
        console.log('chrome.runtime.lastError: ', chrome.runtime.lastError);
    }

    /*
    $scope.loadImage = function (item, callback) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            callback(xhr.response, item);
        };
        xhr.open('GET', item.getUrl('b'), true);
        xhr.send();
    };*/

    $scope.chooseFolder = function () {
        chrome.fileSystem.chooseEntry({
            type: 'openDirectory'
        }, function (entry) {

            // Small validation, perhaps not needed?
            if (entry.isDirectory !== true) {
                log.error('Selected path is not a directory. Aborting.');
                return;
            }

            state.targetEntry = entry;

            chrome.fileSystem.getDisplayPath(entry, function (path) {

                $timeout(function () {

                    log.debug('FULL PATH: ', path);
                    state.targetPath = path;
                    $scope.path = path;
                });
            });

            log.debug('DIALOG: ', entry);
        });
    };

    return $scope;
};

module.exports = FolderController;