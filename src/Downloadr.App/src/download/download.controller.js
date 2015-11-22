'use strict';
// @ngInject
function DownloadController($scope, $rootScope, notify, appSettings, userSettings, licenses, flickr, $state, state, downloadManager, fileManager, $timeout) {
    // This is the continue method that is executed whenever a page is completely downloaded.
    $scope.continue = null;
    $scope.queue = [];
    console.log('SETTING $SCOPE.ITEMS FROM DOWNLOADMANAGER.ITEMS!, ', downloadManager.items);
    $scope.title = 'Downloading...';
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

    //$scope.sizes = ['o', 'b', 'c', 'z', '-', 'n', 'm', 't', 'q', 's'];
    //$scope.sizes = ['o', 'l', 'z', 'n', 'sq'];
    
    $rootScope.$broadcast('status', {
        message: 'Downloading...'
    });

    $scope.goHome = function () {
        $state.transitionTo('home');
    };

    function errorHandler(err) {
        console.log('ERROR!! : ', err);
        console.log('chrome.runtime.lastError: ', chrome.runtime.lastError);
    }

    // Returns the highest available image URL for the selected
    // size. Depending on the original photo, not all sizes are
    // available so this function will search for the largest.
    $scope.getUrl = function (photo, photoSize) {
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

    /*
    $scope.getFileName = function (photo, photoSize) {
                    
        var url = $scope.getUrl(photo, photoSize);
        var fileName = url.replace(/^.*[\\\/]/, '');

        var newFileName = fileName.substring(0, fileName.lastIndexOf('.'));
        var newFileNameExt = fileName.substring(fileName.lastIndexOf('.'));
        var newFullName = newFileName + '_' + $scope.getLicenseName(photo.license).toLowerCase() + newFileNameExt;
        
        return newFullName;
    };*/

    $scope.getFileName = function (url, license) {
        var fileName = url.replace(/^.*[\\\/]/, '');
        var newFileName = fileName.substring(0, fileName.lastIndexOf('.'));
        var newFileNameExt = fileName.substring(fileName.lastIndexOf('.'));

        // Sometimes the URL ends with ?zz=1 (perhaps when original is smaller than z size?)
        if (newFileNameExt.lastIndexOf('?') > -1) {
            // Filename cannot contain "?zz=1" so remove that part of the extension name.
            newFileNameExt = newFileNameExt.substring(0, newFileNameExt.lastIndexOf('?'));
        }
        
        var newFullName = newFileName + '_' + $scope.getLicenseName(license).toLowerCase() + newFileNameExt;

        return newFullName;
    };

    $scope.getLicenseName = function (license) {
        for (var i = 0; i < licenses.length; i++) {
            if (licenses[i].id == license) {
                return licenses[i].extension;
            }
        }

        return '';
    };

    /*
    $scope.loadImage = function (item, size, callback) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            //callback(window.webkitURL.createObjectURL(xhr.response), item);
            callback(xhr.response, item);
        };
        xhr.open('GET', $scope.getUrl(item, size), true);
        xhr.send();
    };*/

    $scope.pause = function () {
        $scope.paused = !$scope.paused;

        if ($scope.paused) {
            $scope.pauseResumeText = 'Resume';
            $scope.title = 'Download paused';

        }
        else {
            $scope.pauseResumeText = 'Pause';
            $scope.title = 'Downloading...';

            // Continue processing.
            $scope.processQueue();

            //$scope.photoIndex = $scope.photoIndex + 1;
            //$scope.processPhoto();
        }
    };

    $scope.cancel = function () {
        $scope.paused = true;

        // Set the count, so we'll only display the number that was downloaded before canceling.
        $scope.count = $scope.current;

        $scope.downloadCompleted('Download cancelled');
    }

    $scope.showConfirm = function (accept, cancel) {
        var confirm = $mdDialog.confirm()
            .title('One more more files already exists!')
            .content('Would you like to skip those photos or overwrite existing ones?')
            .ariaLabel('Already exists')
            .ok('Overwrite existing')
            .cancel('Skip existing');

        $mdDialog.show(confirm).then(function () {
            accept();
        }, function () {
            cancel();
        });
    };

    $scope.writeFile = function (fileName, entry, blob, retry) {
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

                    // We need to run apply here, cause in the loop it's called
                    // from outside the angular scope.
                    $scope.$apply(function () {
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

                    if (appSettings.progress) {
                        // Should we do Pause/Cancel buttons for this notification?
                        notify('progress', 'progress', 'Downloaded ' + $scope.current + ' of ' + $scope.count,
                            'You will be notified when download is completed.',
                            function (id) { }, Math.round(percentage));
                    }

                    // Process the next photo
                    if (!$scope.paused) {
                        // Send message to process queue, which will call processItems if empty.
                        $scope.processQueue();
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
                var newFullName = newFileName + '_' + $scope.uniqueName() + newFileNameExt;

                console.log('Unable to write file to disk... Retry with new filename: ', newFullName);

                // Retry with new filename.
                $scope.writeFile(newFullName, entry, blob, true);
            } else {
                console.log(photo);

                //$scope.showConfirm(function() { console.log('accept'); }, function() { console.log('cancel'); });

                console.log('Unable to write file to disk...');
                console.log(err);
            }
        });
    };

    $scope.uniqueName = function () {
        return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
    };

    $scope.processPhoto = function (photo) {
        console.log('PHOTO SIZE: ', $scope.photoSize);
        console.log('Process Photo: ', photo);

        if (photo.can_download === 0) // Photo cannot be downloaded.
        {
            console.log('User cannot download this photo.');
            $scope.skipped++;
            $scope.processQueue();
        }
        else {
            var url = $scope.getUrl(photo, $scope.photoSize);

            // Download the photo
            fileManager.download(url, $scope.downloaded, $scope.error, photo);
        }
    };

    $scope.downloaded = function (uri, url, response, photo) {
        console.log('blob_uri: ', uri);

        var fileName = $scope.getFileName(url, photo.license);

        $scope.writeFile(fileName, $scope.entry, response);
    };

    $scope.queryPhotoset = function () {
        var query = flickr.createMessage('flickr.photosets.getPhotos', {
            photoset_id: $scope.photosetId,
            media: 'photos',
            per_page: '100', // TODO: Figure out a good value for performance and API trotteling with Flickr.
            page: '' + $scope.photosetPage + '',
            extras: 'license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        });

        // license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
        //'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

        flickr.query(query, $scope.listPhotoset, $scope.error);
    };

    $scope.queryGallery = function () {
        var query = flickr.createMessage('flickr.galleries.getPhotos', {
            gallery_id: $scope.galleryId,
            per_page: '50', // 50 is the current Flickr limit for galleries, default value is 100 if not supplied.
            page: '' + $scope.galleryPage + '',
            extras: 'description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        });

        // license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
        //'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

        flickr.query(query, $scope.listGallery, $scope.error);
    };

    $scope.queryGroup = function () {
        var query = flickr.createMessage('flickr.groups.pools.getPhotos', {
            group_id: $scope.groupId,
            per_page: '50', // 50 is the current Flickr limit for galleries, default value is 100 if not supplied.
            page: '' + $scope.groupPage + '',
            extras: 'description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        });

        // license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
        //'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

        flickr.query(query, $scope.listGroup, $scope.error);
    };

    $scope.queryUser = function () {
        var query = flickr.createMessage('flickr.people.getPhotos', {
            user_id: $scope.userId,
            per_page: '500', // TODO: Do performance testing to see what page sizes makes sense. For now we set high as this is used for apollo and to avoid too many queries to Flickr API (which is limited).
            page: '' + $scope.userPage + '',
            extras: 'license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        });

        // license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
        //'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

        flickr.query(query, $scope.listUser, $scope.error);
    };

    $scope.processQueue = function () {
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
                $scope.processItems();
            }
        }
        else {
            // Process this photo.
            $scope.processPhoto(photo);
        }
    };

    $scope.processItems = function () {
        var item = downloadManager.items.pop();

        if (item === undefined) {
            console.log('NO MORE ITEMS, COMPLETED!!');

            // We are all done, notify about success!
            $scope.downloadCompleted('Download completed');
        }
        else {
            $scope.processItem(item);
        }
    };

    $scope.processItem = function (item) {
        if (item.type === 'photo') {
            // Process this photo right away, don't bother adding to batch queue.
            $scope.processPhoto(item);
        }
        else if (item.type === 'photoset') {
            $scope.photosetId = item.id;
            $scope.queryPhotoset();
        }
        else if (item.type === 'gallery') {
            $scope.galleryId = item.id;
            $scope.queryGallery();
        }
        else if (item.type === 'user') {
            $scope.userId = item.id;
            $scope.queryUser();
        }
        else if (item.type === 'group') {
            $scope.groupId = item.nsid;
            $scope.queryGroup();
        }
        else {
            console.log('Unhandled file type to download...', item);
        }
    };

    $scope.listPhotoset = function (data) {
        console.log(data);

        data.items.forEach(function (item) {
            // Populate the queue with a batch of photos to process.
            $scope.queue.push(item);
        });

        if (data.page === data.pages) {
            // Process the next item in the full list in DownloadManager.
            $scope.continue = null;

            // Remember to reset the photoset page for next photoset in the processing queue.
            $scope.photosetPage = 1;

            // Process the queue to complete this album/gallery.
            $scope.processQueue();
        }
        else {
            // Register the callback for continue operation when queue is processed.
            $scope.continue = function () {
                $scope.photosetPage++;
                $scope.queryPhotoset();
            };

            // Process the queue of all the photos we just added.
            $scope.processQueue();
        }
    };

    $scope.listGallery = function (data) {
        console.log(data);

        data.items.forEach(function (item) {
            // Populate the queue with a batch of photos to process.
            $scope.queue.push(item);
        });

        if (data.page === data.pages) {
            // Process the next item in the full list in DownloadManager.
            $scope.continue = null;

            // Remember to reset the photoset page for next photoset in the processing queue.
            $scope.galleryPage = 1;

            // Process the queue to complete this album/gallery.
            $scope.processQueue();
        }
        else {
            // Register the callback for continue operation when queue is processed.
            $scope.continue = function () {
                $scope.galleryPage++;
                $scope.queryGallery();
            };

            // Process the queue of all the photos we just added.
            $scope.processQueue();
        }
    };

    $scope.listGroup = function (data) {
        console.log(data);

        data.items.forEach(function (item) {
            // Populate the queue with a batch of photos to process.
            $scope.queue.push(item);
        });

        if (data.page === data.pages) {
            // Process the next item in the full list in DownloadManager.
            $scope.continue = null;

            // Remember to reset the photoset page for next photoset in the processing queue.
            $scope.groupPage = 1;

            // Process the queue to complete this album/gallery.
            $scope.processQueue();
        }
        else {
            // Register the callback for continue operation when queue is processed.
            $scope.continue = function () {
                $scope.groupPage++;
                $scope.queryGroup();
            };

            // Process the queue of all the photos we just added.
            $scope.processQueue();
        }
    };

    $scope.listUser = function (data) {
        console.log(data);

        data.items.forEach(function (item) {
            // Populate the queue with a batch of photos to process.
            $scope.queue.push(item);
        });

        if (data.page === data.pages) {
            // Process the next item in the full list in DownloadManager.
            $scope.continue = null;

            // Remember to reset the photoset page for next photoset in the processing queue.
            $scope.userPage = 1;

            // Process the queue to complete this album/gallery.
            $scope.processQueue();
        }
        else {
            // Register the callback for continue operation when queue is processed.
            $scope.continue = function () {
                $scope.userPage++;
                $scope.queryUser();
            };

            // Process the queue of all the photos we just added.
            $scope.processQueue();
        }
    };

    $scope.error = function (err) {
        console.log('Failed in download process...', err);
    };

    $scope.downloadCompleted = function (message) {
        console.log('Running clear...');

        // Clean up the download manager.
        downloadManager.clear();

        $scope.title = message;

        $scope.completed = true;

        $timeout(function () {

            // Reset everything to empty state.
            state.searchText = '';
            $scope.completed = true;

        }, 0);

        console.log('Completed set to true...');

        $rootScope.$broadcast('status', {
            message: message
        });

        // Notify if the user have selected to get the Chrome notification.
        if (appSettings.completed) {

            notify('success', 'basic', message,
                '' + $scope.count - $scope.skipped + ' photos of ' + $scope.count + ' have been saved successfully. ' + $scope.skipped + ' photos was skipped due to invalid license or access.',
                function (id) {
                    // Launch the local file browser at the target destination.
                });
        }
    };

    // Start the download immediately when the view is loaded.
    $scope.$on('$viewContentLoaded', function () {
        console.log('$scope.$on($viewContentLoaded)');

        // Set the total count generated by the download manager.
        $scope.count = downloadManager.state.count;

        // Start processing of items.
        $scope.processItems();
    });

    return $scope;
};

module.exports = DownloadController;