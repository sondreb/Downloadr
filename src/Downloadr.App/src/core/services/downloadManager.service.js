'use strict';
// @ngInject
function downloadManager($rootScope, $q, notify, appSettings, userSettings, licenses, flickr, $state, state, selectionManager, fileManager, $timeout, logger) {

    var $scope = this;

    var log = logger.Create('DownloadManager');

    // This is the continue method that is executed whenever a page is completely downloaded.
    $scope.continue = null;
    $scope.queue = [];
    $scope.count = 0; // The total count user selected.
    $scope.current = 0; // The current photo.
    $scope.skipped = 0; // Number of skipped photos due to invalid license/permission.
    $scope.completed = false;
    $scope.paused = false;
    $scope.pauseResumeText = 'Pause';
    $scope.photosetPage = 1;
    $scope.photosetId = null;
    $scope.galleryPage = 1;
    $scope.galleryId = null;
    $scope.groupPage = 1;
    $scope.groupId = null;
    $scope.userPage = 1;
    $scope.userId = null;
    $scope.queueIndex = 0;
    $scope.sizes = ['o', 'l', 'z', 'n', 'q'];

    // Get a reference to the user selected photo size.
    $scope.photoSize = userSettings.size;

    // Get a reference to the folder object.
    $scope.entry = state.targetEntry;

    function errorHandler(err) {
        console.log('ERROR!! : ', err);
        console.log('chrome.runtime.lastError: ', chrome.runtime.lastError);
    };

    // Returns the highest available image URL for the selected
    // size. Depending on the original photo, not all sizes are
    // available so this function will search for the largest.
    function getUrl(photo, photoSize) {
        // If the specified size exists, return that.
        if (photo['url_' + photoSize] !== undefined) {
            return photo['url_' + photoSize];
        }

        console.log('Find index of ' + photoSize + ' in sizes: ', $scope.sizes);

        var startIndex = $scope.sizes.indexOf(photoSize);

        console.log('Start Index: ', startIndex);

        // Search for the nearest correct size.
        for (var i = (startIndex + 1) ; i < $scope.sizes.length; i++) {

            console.log('SEARCHING SIZE: ', $scope.sizes[i]);

            if (photo['url_' + $scope.sizes[i]] !== undefined) {
                return photo['url_' + $scope.sizes[i]];
            }
        }

        throw new Error('Unable to find photo URL for the specified size');
    };

    function getFileName(url, license) {
        var fileName = url.replace(/^.*[\\\/]/, '');
        var newFileName = fileName.substring(0, fileName.lastIndexOf('.'));
        var newFileNameExt = fileName.substring(fileName.lastIndexOf('.'));

        // Sometimes the URL ends with ?zz=1 (perhaps when original is smaller than z size?)
        if (newFileNameExt.lastIndexOf('?') > -1) {
            // Filename cannot contain "?zz=1" so remove that part of the extension name.
            newFileNameExt = newFileNameExt.substring(0, newFileNameExt.lastIndexOf('?'));
        }

        var newFullName = newFileName + '_' + getLicenseName(license).toLowerCase() + newFileNameExt;

        return newFullName;
    };

    function getLicenseName(license) {
        for (var i = 0; i < licenses.length; i++) {
            if (licenses[i].id == license) {
                return licenses[i].extension;
            }
        }

        return '';
    };

    function writeFile(fileName, entry, blob, retry) {
        console.log('Write file: ', fileName);

        // Create the file on disk.
        entry.getFile(fileName, {
            create: true,
            exclusive: true
        }, function (writableFileEntry) {

            console.log('FILE: ', writableFileEntry);

            writableFileEntry.createWriter(function (writer) {
                writer.onerror = errorHandler;
                writer.onwriteend = function (e) {

                    console.log('write complete');

                    debugger;

                    // We need to run apply here, cause in the loop it's called
                    // from outside the angular scope.
                    $timeout(function () {
                        // Update the current photo ID that we just downloaded.
                        $scope.current++;
                    });

                    /*$scope.$apply(function () {
                        $scope.photoNumber = (index + 1);
                    });*/

                    var percentage = $scope.current * 100 / $scope.count;

                    // Happens sometimes when download is canceled and current is higher than count.
                    if (percentage > 100) {
                        percentage = 100;
                    }

                    // If user have canceled during current download, we will skip the notification.
                    if (!$scope.completed) {
                        // Notify on progress.
                        $scope.defer.notify({
                            current: $scope.current,
                            count: $scope.count,
                            percentage: percentage,
                            skipped: $scope.skipped
                        });
                    }

                    if (appSettings.progress) {
                        // Should we do Pause/Cancel buttons for this notification?
                        notify('progress', 'progress', 'Downloaded ' + $scope.current + ' of ' + $scope.count,
                            'You will be notified when download is completed.',
                            function (id) { }, Math.round(percentage));
                    }

                    log.debug('Paused:', $scope.paused);

                    // Process the next photo
                    if (!$scope.paused) {
                        // Send message to process queue, which will call processItems if empty.
                        processQueue();
                    }
                };

                writer.write(new Blob([blob], {
                    type: 'image/jpeg'
                }));

            }, errorHandler);
        }, function (err) {

            // If the error is caused by file existing, we'll generate random name and retry.
            if (err.name == 'InvalidModificationError' && !retry) {
                var newFileName = fileName.substring(0, fileName.lastIndexOf('.'));
                var newFileNameExt = fileName.substring(fileName.lastIndexOf('.'));
                var newFullName = newFileName + '_' + uniqueName() + newFileNameExt;

                console.log('Unable to write file to disk... Retry with new filename: ', newFullName);

                // Retry with new filename.
                writeFile(newFullName, $scope.entry, blob, true);
            } else {
                console.log(photo);

                //$scope.showConfirm(function() { console.log('accept'); }, function() { console.log('cancel'); });

                console.log('Unable to write file to disk...');
                console.log(err);
            }
        });
    };

    function uniqueName() {
        return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
    };

    function processPhoto(photo) {

        console.log('PHOTO SIZE: ', $scope.photoSize);
        console.log('Process Photo: ', photo);

        if (photo.can_download === 0) // Photo cannot be downloaded.
        {
            console.log('User cannot download this photo.');
            $scope.skipped++;
            processQueue();
        }
        else {
            var url = getUrl(photo, $scope.photoSize);

            // Download the photo
            fileManager.download(url, downloaded, error, photo);
        }
    };

    function downloaded(uri, url, response, photo) {
        console.log('blob_uri: ', uri);

        var fileName = getFileName(url, photo.license);

        writeFile(fileName, $scope.entry, response);
    };

    function queryPhotoset() {
        var query = flickr.createMessage('flickr.photosets.getPhotos', {
            photoset_id: $scope.photosetId,
            media: 'photos',
            per_page: '100', // TODO: Figure out a good value for performance and API trotteling with Flickr.
            page: '' + $scope.photosetPage + '',
            extras: 'license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        });

        // license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
        //'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

        flickr.query(query, listPhotoset, error);
    };

    function queryGallery() {
        var query = flickr.createMessage('flickr.galleries.getPhotos', {
            gallery_id: $scope.galleryId,
            per_page: '50', // 50 is the current Flickr limit for galleries, default value is 100 if not supplied.
            page: '' + $scope.galleryPage + '',
            extras: 'description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        });

        // license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
        //'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

        flickr.query(query, listGallery, error);
    };

    function queryGroup() {
        var query = flickr.createMessage('flickr.groups.pools.getPhotos', {
            group_id: $scope.groupId,
            per_page: '50', // 50 is the current Flickr limit for galleries, default value is 100 if not supplied.
            page: '' + $scope.groupPage + '',
            extras: 'description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        });

        // license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
        //'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

        flickr.query(query, listGroup, error);
    };

    function queryUser() {
        var query = flickr.createMessage('flickr.people.getPhotos', {
            user_id: $scope.userId,
            per_page: '500', // TODO: Do performance testing to see what page sizes makes sense. For now we set high as this is used for apollo and to avoid too many queries to Flickr API (which is limited).
            page: '' + $scope.userPage + '',
            extras: 'license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        });

        // license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
        //'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

        flickr.query(query, listUser, error);
    };

    function processQueue() {
        // Pop an item.
        var photo = $scope.queue.pop();

        console.log('processQueue: ', photo);

        if (photo === undefined) {
            console.log($scope.continue);

            if ($scope.continue != null) {
                // We are all done, call the continue handler.
                $scope.continue();
            }
            else {
                // Process the next item when we are done with the current one.
                processItems();
            }
        }
        else {
            // Process this photo.
            processPhoto(photo);
        }
    };

    function processItems() {
        var item = selectionManager.items.pop();

        if (item === undefined) {
            console.log('NO MORE ITEMS, COMPLETED!!');

            // We are all done, notify about success!
            downloadCompleted('Download completed');
        }
        else {
            processItem(item);
        }
    };

    function processItem(item) {
        if (item.type === 'photo') {
            // Process this photo right away, don't bother adding to batch queue.
            processPhoto(item);
        }
        else if (item.type === 'photoset') {
            $scope.photosetId = item.id;
            queryPhotoset();
        }
        else if (item.type === 'gallery') {
            $scope.galleryId = item.id;
            queryGallery();
        }
        else if (item.type === 'user') {
            $scope.userId = item.id;
            queryUser();
        }
        else if (item.type === 'group') {
            $scope.groupId = item.nsid;
            queryGroup();
        }
        else {
            console.log('Unhandled file type to download...', item);
        }
    };

    function listPhotoset(data) {
        console.log(data);

        data.items.forEach(function (item) {
            // Populate the queue with a batch of photos to process.
            $scope.queue.push(item);
        });

        if (data.page === data.pages) {
            // Process the next item in the full list in selectionManager.
            $scope.continue = null;

            // Remember to reset the photoset page for next photoset in the processing queue.
            $scope.photosetPage = 1;

            // Process the queue to complete this album/gallery.
            processQueue();
        }
        else {
            // Register the callback for continue operation when queue is processed.
            $scope.continue = function () {
                $scope.photosetPage++;
                queryPhotoset();
            };

            // Process the queue of all the photos we just added.
            processQueue();
        }
    };

    function listGallery(data) {

        log.debug(data);

        data.items.forEach(function (item) {
            // Populate the queue with a batch of photos to process.
            $scope.queue.push(item);
        });

        if (data.page === data.pages) {
            // Process the next item in the full list in selectionManager.
            $scope.continue = null;

            // Remember to reset the photoset page for next photoset in the processing queue.
            $scope.galleryPage = 1;

            // Process the queue to complete this album/gallery.
            processQueue();
        }
        else {
            // Register the callback for continue operation when queue is processed.
            $scope.continue = function () {
                $scope.galleryPage++;
                queryGallery();
            };

            // Process the queue of all the photos we just added.
            processQueue();
        }
    };

    function listGroup(data) {

        log.debug(data);

        data.items.forEach(function (item) {
            // Populate the queue with a batch of photos to process.
            $scope.queue.push(item);
        });

        if (data.page === data.pages) {
            // Process the next item in the full list in selectionManager.
            $scope.continue = null;

            // Remember to reset the photoset page for next photoset in the processing queue.
            $scope.groupPage = 1;

            // Process the queue to complete this album/gallery.
            processQueue();
        }
        else {
            // Register the callback for continue operation when queue is processed.
            $scope.continue = function () {
                $scope.groupPage++;
                queryGroup();
            };

            // Process the queue of all the photos we just added.
            processQueue();
        }
    };

    function listUser(data) {

        log.debug(data);

        data.items.forEach(function (item) {
            // Populate the queue with a batch of photos to process.
            $scope.queue.push(item);
        });

        if (data.page === data.pages) {
            // Process the next item in the full list in selectionManager.
            $scope.continue = null;

            // Remember to reset the photoset page for next photoset in the processing queue.
            $scope.userPage = 1;

            // Process the queue to complete this album/gallery.
            processQueue();
        }
        else {
            // Register the callback for continue operation when queue is processed.
            $scope.continue = function () {
                $scope.userPage++;
                queryUser();
            };

            // Process the queue of all the photos we just added.
            processQueue();
        }
    };

    function error (err) {
        console.log('Failed in download process...', err);

        $scope.reject(new Error('Failed to download.'));

    };

    function downloadCompleted(message) {

        log.info('Download Completed. Cleanup in progress...');

        //console.log('Running clear...');

        // Clean up the download manager.
        selectionManager.clear();

        $scope.title = message;
        $scope.completed = true;

        $timeout(function () {

            // Reset everything to empty state.
            state.searchText = '';
            $scope.completed = true;

        }, 0);

        $scope.defer.resolve({
            current: $scope.current,
            count: $scope.count,
            percentage: 100,
            skipped: $scope.skipped
        });

        //console.log('Completed set to true...');

        //$rootScope.$broadcast('status', {
        //    message: message
        //});

        // Notify if the user have selected to get the Chrome notification.
        if (appSettings.completed) {

            notify('success', 'basic', message,
                '' + $scope.count - $scope.skipped + ' photos of ' + $scope.count + ' have been saved successfully. ' + $scope.skipped + ' photos was skipped due to invalid license or access.',
                function (id) {
                    // Launch the local file browser at the target destination.
                });
        }
    };

    $scope.defer = null;

    function start() {

        log.info('Download Manager Starting...');

        $scope.defer = $q.defer();

        // Hack to ensure that notify is called for cached data,
        // unless we do this, calls to notify is not sent to consumer
        // unless that happens after the return promise is sent.
        //$scope.defer.promise.then(null, null, function () { });
        // Or we could do
        //$timeout(function () { $scope.defer.notify(); }, 0, false); // False to avoid triggering a digest.

        // Set the total count generated by the download manager.
        $scope.count = selectionManager.state.count;

        // Start processing the items in the queue.
        processItems();

        return $scope.defer.promise;
    };

    function pause() {
        $scope.paused = true;
    };

    function resume() {
        // Continue processing.
        processQueue();
    };

    function cancel() {
        $scope.paused = true;

        // Set the count, so we'll only display the number that was downloaded before canceling.
        $scope.count = $scope.current;

        downloadCompleted('Download cancelled');
    };

    function on() {


    };

    return {
        pause: pause,
        resume: resume,
        cancel: cancel,
        start: start,
        on: on
    };

};

module.exports = downloadManager;