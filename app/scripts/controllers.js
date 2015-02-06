/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

	var controllers = angular.module('downloadr.controllers', []);

	controllers.run(['$log',
		function ($log) {
			$log.log('downloadr.controllers.run: ');
    }]);

	controllers.controller('StatusController', ['$scope', '$rootScope', 'socket',
		function ($scope, $rootScope, socket) {

			console.log('STATUS CONTROLLER!');

			$scope.message = 'Loading...';

			$scope.$on('status', function (event, args) {

				console.log('Status: ', args.message);
				$scope.message = args.message;

			});

			socket.on('status', function (message) {
				console.log('Status: ', message);
				$scope.message = message.text;

			});

    }]);

	controllers.controller('HomeController', ['$scope', '$rootScope', 'settings', '$document',
		function ($scope, $rootScope, settings, $document) {


			$scope.refreshWallpaper = function () {

				console.log('Refresh Wallpaper');

				if (settings.values.background) {
					$rootScope.state.background = 'wallpaper';
				} else {
					$rootScope.state.background = 'wallpaper-4';
				}

			};

			$scope.refreshWallpaper();

			$scope.$watch(function () {
				return settings.values.background;
			}, function (newVal, oldVal) {

				// Happens on first run.
				if (newVal === oldVal) {
					return;
				}

				$scope.refreshWallpaper();

			}, false);

    }]);

	controllers.controller('ProfileController', ['$scope', '$rootScope',
		function ($scope, $rootScope) {

			$scope.user = {
				displayName: 'Sondre'
			};

    }]);

	controllers.controller('AboutController', ['$scope', '$rootScope', 'settings',
		function ($scope, $rootScope, settings) {

			$rootScope.state.background = 'wallpaper-3';

			$scope.settings = settings.values;

			$scope.state = {
				isLoggedIn: false
			};

			$scope.credits = [
				{
					type: 'Developed',
					text: 'Sondre Bjellås',
					url: 'http://sondreb.com/'
				},
				{
					type: 'Icon',
					text: 'HADezign',
					url: 'http://hadezign.com/'
				},
				{
					type: 'Icon',
					text: 'synetcon',
					url: 'http://synetcon.deviantart.com/art/OSX-Yosemite-window-buttons-459868391'
				},
				{
					type: 'Symbols',
					text: 'Font Awesome',
					url: 'http://fontawesome.io/'
				},
				{
					type: 'Wallpaper',
					text: 'Ossi Petruska',
					url: 'http://www.flickr.com/photos/10134557@N08/2527630813'
				}
        ];

			$scope.libraries = [
				{
					type: 'Library',
					text: 'AngularJS',
					url: 'https://angularjs.org/'
				},
				{
					type: 'Library',
					text: 'jQuery',
					url: 'https://jquery.org/'
				},
				{
					type: 'Library',
					text: 'Node.js',
					url: 'http://nodejs.org/'
				},
				{
					type: 'Library',
					text: 'socket.io',
					url: 'http://socket.io/'
				},
				{
					type: 'Library',
					text: 'express',
					url: 'http://expressjs.com/'
				},
				{
					type: 'Library',
					text: 'documentdb',
					url: 'https://github.com/Azure/azure-documentdb-node'
				},
				{
					type: 'Library',
					text: 'flickr-oauth-and-upload',
					url: 'https://github.com/mattiaserlo/flickr-oauth-and-upload'
				},
				{
					type: 'Library',
					text: 'nconf',
					url: 'https://github.com/flatiron/nconf'
				},
				{
					type: 'Library',
					text: 'pace',
					url: 'https://github.com/HubSpot/pace'
				},
				{
					type: 'Library',
					text: 'angular-mousetrap',
					url: 'https://github.com/khasinski/angular-mousetrap'
				},
				{
					type: 'Library',
					text: 'Grunt',
					url: 'http://gruntjs.com/'
				},
				{
					type: 'Library',
					text: 'LumX',
					url: 'http://ui.lumapps.com/'
				}

        ];

    }]);

	controllers.controller('LoginController', ['$scope', '$rootScope', '$location', 'socket',
		function ($scope, $rootScope, $location, socket) {

			$rootScope.state.background = 'wallpaper-3';

			$scope.user = {
				username: '',
				password: ''
			};

			console.log('Login URL', $rootScope.state.loginUrl);

			// Was unable to bind to the src attribute, so have to use DOM.
			var webview = document.querySelector('webview');

			// Set the source to be login URL.
			webview.src = $rootScope.state.loginUrl;

			var getParameterByName = function (url, name) {
				name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
				var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
					results = regex.exec(url);
				return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
			};

			// Add a listener, to navigate back to home page when user
			// have successfully authorized the app.
			webview.addEventListener('loadstop', function () {

				if (webview.src.indexOf('oauth_verifier') > -1) {

					console.log('navigating to home!');

					var oauth_token = getParameterByName(webview.src, 'oauth_token');
					var oauth_verifier = getParameterByName(webview.src, 'oauth_verifier');

					console.log('oauth_token: ', oauth_token);
					console.log('oauth_verifier: ', oauth_verifier);

					$scope.$apply(function () {

						// Notify the server so we can transform this token into
						// a proper access token the user can store permanently.
						socket.emit('accessGranted', {
							oauth_token: oauth_token,
							oauth_verifier: oauth_verifier
						})

						$rootScope.state.isAnonymous = false;

						$rootScope.$broadcast('status', {
							message: 'Authenticated.'
						});

						// Navigate to home.
						$location.path('/#');
					});

				}

				console.log('webview loaded: ' + webview.src);

			});

    }]);

	controllers.controller('LogoutController', ['$scope', '$rootScope', '$location',
		function ($scope, $rootScope, $location) {

			$rootScope.state.background = 'wallpaper-3';

			$scope.logout = function () {
				console.log('Logout Command');

				$rootScope.$broadcast('Event:Logout');

				// Navigate to home.
				$location.path('/#');
			};

			$scope.back = function () {
				console.log('Go back!');

				// Navigate to home.
				$location.path('/#');

			};
    }]);


	function isScrolledIntoView(elem) {

		if ($(elem).length == 0) {
			return false;
		}

		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();

		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();
		//  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop)); //try it, will only work for text
		return (docViewBottom >= elemTop && docViewTop <= elemBottom);
	}

	$('.text').each(function () {
		console.log(isScrolledIntoView(this), this);
	});
	$('.big').each(function () {
		console.log(isScrolledIntoView(this), this);
	});

	$(window).on('scroll', function () {
		$('.text').each(function () {
			console.log(isScrolledIntoView(this), this);
		});
		$('.big').each(function () {
			console.log(isScrolledIntoView(this), this);
		});
	});


	controllers.controller('SearchController', ['$scope', '$rootScope',
    '$location', '$http',
    '$timeout', 'socket',
    'flickr', 'settings',
		function ($scope, $rootScope, $location, $http, $timeout, socket, flickr, settings) {

			$rootScope.state.background = 'wallpaper-dark';
			$rootScope.state.showActions = true;
			$rootScope.state.actionTarget = 'folder';

			$scope.photos = [];
			$scope.sizes = ['o', 'b', 'c', 'z', '-', 'n', 'm', 't', 'q', 's'];
			$scope.total = 0;
			$scope.page = 1;

			$scope.$on('$destroy', function (event) {

				console.log('Destroy: SearchController... Cleaning up Resources...');

				socket.removeAllListeners('urlSigned');

				// Whenever the user navigates away from SearchController, make sure
				// we cleanup resources in use.
				$scope.clearPhotos();

				// Remove global event listeners.
				$scope.onSearchEvent();
				$scope.onFilterEvent();
				$scope.onPagingEvent();
			});

			// Hook up handler to the scroll event when DOM is ready.
			// This is kept for future feature addition, need to have automatic scrolling and search.
			//angular.element(document).ready(function () {
			//	$('#presenter').on('scroll', function() { console.log('scroll event'); });
			//});

			/*
			$('#presenter').scroll(function() {
			   if($(window).scrollTop() + $(window).height() == $(document).height()) {
				   console.log('BOTTOM!!!');
			   }
				
				console.log('$(window).scrollTop(): ', $(window).scrollTop());
				console.log('$(window).height(): ', $(window).height());
				console.log('$(document).height(): ', $(document).height());
				
			});*/

			$scope.onSearchEvent = $rootScope.$on('Event:Search', function (event, data) {

				console.log('User did a new search...');
				$rootScope.state.searchText = data.value;

				if (data.clear === true) {
					$scope.clearPhotos();
				}

				$scope.performSearch($rootScope.state.searchText);

			});

			$scope.onFilterEvent = $rootScope.$on('Event:Filter', function (event) {

				$scope.clearPhotos();

				console.log('User changed filter...');
				$scope.performSearch($rootScope.state.searchText);

			});

			$scope.onPagingEvent = $rootScope.$on('Event:Paging', function (event) {

				console.log('User changed paging...');
				$scope.performSearch($rootScope.state.searchText);

			});

			$scope.loadMore = function () {
				$rootScope.$broadcast('Event:Paging');
			}

			$scope.loadImage = function (item, callback) {

				var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';

				xhr.onload = function () {
					callback(window.webkitURL.createObjectURL(xhr.response), item);
				};

				xhr.open('GET', item.uri, true);
				xhr.send();

			};

			$scope.showMenu = function (photo) {
				var url = 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id;
				console.log('Open: ', url);
				window.open(url);
			};

			// Event handler when user selects a photo. Same event for click on existing selected or new photo.
			$scope.selectPhoto = function (photo) {

				if (photo.selected === true) {
					photo.selected = false;

					$rootScope.state.selectedPhotos = _.without($rootScope.state.selectedPhotos, photo);

				} else {
					photo.selected = true;
					$rootScope.state.selectedPhotos.push(photo);
				}

				$rootScope.$broadcast('Event:SelectedPhotosChanged', {
					photos: $rootScope.state.selectedPhotos
				});

				console.log('Select photo: ', photo);
			};

			// for each image with no imageUrl, start a new loader
			$scope.loadImages = function () {

				var photos = $scope.photos;

				console.log('PHOTOS!!!: ', photos);

				for (var i = 0; i < photos.length; i++) {

					var item = photos[i];

					// Skip all photos already downloaded.
					if (item.url !== undefined) {
						continue;
					}

					item.uri = item.getUrl('m');

					// We are about to download the last photo, we can prepare for next search (scrolling).
					if (i === (photos.length - 1)) {
						console.log('i == photos.length!');
						$scope.page = $scope.page + 1;
					}

					$scope.loadImage(item, function (blob_uri, originalItem) {

						$timeout(function () {

							console.log('BLOB: ', blob_uri);
							originalItem.url = blob_uri;

						}, 0);

					});

				}
			};

			$scope.onUrlSigned = function (message) {

				var url = 'https://' + message.hostname + message.path;

				$http.post(url).success(function (data, status, headers, config) {
					// this callback will be called asynchronously
					// when the response is available
					console.log('Service results: ', data);
					console.log('Service HTTP status: ', status);

					var list = data.photos.photo;
					$scope.total = data.photos.total;

					var paging = data.photos.page > 1;

					// If we are paging, we should not delete the existing photos.
					if (!paging) {
						$rootScope.$broadcast('Event:SelectedPhotosChanged', {
							total: $scope.total,
							photos: $rootScope.state.selectedPhotos
						});
					}

					// Could we perhaps use prototype instead of this silly loop?
					for (var i = 0; i < list.length; i++) {
						var item = list[i];
						//item.url = 'img/loading.gif';
						item.selected = false;

						// Returns the highest available image URL for the selected
						// size. Depending on the original photo, not all sizes are
						// available so this function will search for the largest.
						item.getUrl = function (photoSize) {

							// If the specified size exists, return that.
							if (this['url_' + photoSize] !== undefined) {
								return this['url_' + photoSize];
							}

							console.log('Find index of ' + photoSize + ' in sizes: ', $scope.sizes);

							var startIndex = $scope.sizes.indexOf(photoSize);

							console.log('Start Index: ', startIndex);

							// Search for the nearest correct size.
							for (var i = (startIndex + 1); i < $scope.sizes.length; i++) {

								console.log('SEARCHING SIZE: ', $scope.sizes[i]);

								if (this['url_' + $scope.sizes[i]] !== undefined) {
									return this['url_' + $scope.sizes[i]];
								}
							}

							throw new Error('Unable to find photo URL for the specified size');

						};

						item.getFileName = function (photoSize) {
							var url = this.getUrl(photoSize);
							var filename = url.replace(/^.*[\\\/]/, '');
							return filename;
						};
					}

					if (!paging) {
						$scope.clearPhotos();

						// Bind to the UI.
						$scope.photos = list;
					} else {
						// Append new photos to existing list.
						$scope.photos = $scope.photos.concat(list);
					}

					// Begin download the thumbnails.
					$scope.loadImages();
				}).
				error(function (data, status, headers, config) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
					console.log(data);
					console.log('HTTP Status: ', status);
				});

			};

			// Register handler for callbacks of signing URLs.
			socket.on('urlSigned', $scope.onUrlSigned);

			$scope.clearPhotos = function () {
				// Remove existing downloaded photos to avoid memory leak.
				$scope.clearObjectURLs();

				// Bind to the UI.
				$scope.photos = [];
			}

			// Clears up all the blob files that was previously downloaded. For future
			// informational reference, the blob-links under "Resources" in the Developer Tools
			// does still list the old blobs, but their binary content is actually deleted.
			//
			// This task is important to avoid memory leak.
			//
			// TODO: Create a cleanup method on this controller and make sure it's called when needed.
			$scope.clearObjectURLs = function () {
				if ($scope.photos) {

					$scope.photos.forEach(function (photo) {

						if (photo.url !== undefined) {
							console.log('Disposing: ', photo.url);
							URL.revokeObjectURL(photo.url);
						}
					});

					$scope.photos = [];
				}
			};

			$scope.performSearch = function (searchTerm) {

				// Get a prepared message that includes token.
				// Until we know exactly what metadata we need, we'll ask for all extras.
				var message = flickr.createMessage('flickr.photos.search', {
					text: searchTerm,
					safe_search: settings.values.safe,
					sort: settings.values.sort,
					per_page: '15',
					page: '' + $scope.page + '',
					extras: 'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
				});

				console.log('Sign URL message: ', message);
				socket.emit('signUrl', message);
			};

			$scope.init = function () {

				// This is first run, meaning user have probably performed search from
				// home view. Read the state and perform search now.
				$scope.performSearch($rootScope.state.searchText);

			};

			$scope.init();
    }]);


	controllers.controller('SettingsController', ['$scope', '$rootScope', 'settings',
		function ($scope, $rootScope, settings) {

			$rootScope.state.background = 'wallpaper-3';

			$scope.getAcceptLanguages = function () {
				chrome.i18n.getAcceptLanguages(function (languageList) {
					var languages = languageList.join(',');
					document.getElementById('languageSpan').innerHTML = languages;
				});
			};

			$scope.languages = [
				{
					key: 'en-US',
					value: 'English'
				},
				{
					key: 'nb-NO',
					value: 'Norwegian'
				},
        ];

			/* These will make properties available on the scope and auto-persist to local storage. */
			//storage.bind($scope, 'language', 'en-US');
			//storage.bind($scope, 'theme', 'dark');

			console.log('Current Settings.values.safe: ', settings.values.safe);
			console.log('Current Settings: ', settings);

			$scope.settings = settings;

			$scope.$watch(function () {
				return $scope.settings;
			}, function (newVal, oldVal) {

				console.log('newVal: ', newVal);
				console.log('oldVal: ', oldVal);

				// Happens on first run.
				if (newVal === oldVal) {
					return;
				}

				console.log('Saving settings from settings...');

				settings.save();
			}, true);

    }]);


	controllers.controller('ActionsController', ['$scope', '$rootScope', 'settings', '$location',
		function ($scope, $rootScope, settings, $location) {

			$scope.sorting = {
				'relevance': 'Relevant',
				'date-posted-desc': 'Recent',
				'interestingness-desc': 'Interesting'
			};

			$scope.settings = settings;

			$scope.$watch(function () {
				return settings.values;
			}, function (newVal, oldVal) {

				// Happens on first run.
				if (newVal === oldVal) {
					return;
				}

				// Settings will be saved here upon loading, because first the default
				// values will be loaded, and then after values is read from Chrome
				// settings, the newVal and oldVal will be different, so a save will be
				// triggered. Look for a solution in the future to skip this initial
				// saving that occurs.

				// Make sure we save settings when user changes dropdowns.
				// We do this, to remember the selections for next search.
				settings.save();

				// We should re-run the search with changed settings.
				$rootScope.$broadcast('Event:Filter');


			}, true);

			console.log($scope.settings);

			$scope.$on('Event:SelectedPhotosChanged', function (event, data) {
				console.log('Event:SelectedPhotosChanged: ', data);
				$scope.count = data.photos.length;

				if (data.total) {
					$scope.total = data.total;
				}

			});

			$scope.selectLicense = function (license) {
				settings.values.license = license;
			};

			$scope.licenseClass = function (license) {
				if (settings.values.license == license) {
					return 'btn--light-blue';
				} else {
					return 'btn--white';
				}
			};

			$scope.sortingClass = function (sort) {
				if (settings.values.sort == sort) {
					return 'btn--light-blue';
				} else {
					return 'btn--white';
				}
			};

			$scope.selectSort = function (sort) {
				settings.values.sort = sort;
			};

			$scope.sizeClass = function (size) {
				if (settings.values.size == size) {
					return 'btn--light-blue';
				} else {
					return 'btn--white';
				}
			};

			$scope.selectSize = function (size) {
				settings.values.size = size;
			};

			$scope.navigate = function (url) {

				$location.path(url);

			};

			$scope.navigateBack = function () {

				console.log('Navigate back');
				$location.path($rootScope.state.previouspath);

			};

			$scope.clearSelection = function () {

				$rootScope.state.selectedPhotos.forEach(function (photo) {
					photo.selected = false;
				});

				$rootScope.state.selectedPhotos = [];
				$rootScope.$broadcast('Event:SelectedPhotosChanged', {
					photos: $rootScope.state.selectedPhotos
				});
			};

			$scope.count = 0;

    }]);


	controllers.controller('DownloadController', ['$scope', '$rootScope', 'notify', 'settings', '$mdDialog',
		function ($scope, $rootScope, notify, settings, $mdDialog) {

			$rootScope.state.background = 'wallpaper-light';

			function errorHandler(err) {
				console.log('ERROR!! : ', err);
				console.log('chrome.runtime.lastError: ', chrome.runtime.lastError);
			}

			$scope.loadImage = function (item, size, callback) {
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onload = function () {
					//callback(window.webkitURL.createObjectURL(xhr.response), item);
					callback(xhr.response, item);
				};
				xhr.open('GET', item.getUrl(size), true);
				xhr.send();
			};

			$scope.count = 0;
			$scope.photoNumber = 1;
			$scope.completed = false;

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

			$scope.writeFile = function (index, fileName, entry, blob_uri, retry) {
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
								$scope.photoNumber = (index + 1);
							});

							var percentage = $scope.photoNumber * 100 / $scope.count;

							if (settings.values.progress) {
								// Should we do Pause/Cancel buttons for this notification?
								notify('progress', 'progress', 'Downloaded ' + $scope.photoNumber + ' of ' + $scope.count,
									'You will be notified when download is completed.',
									function (id) {}, Math.round(percentage));

							}

							// Process the next photo
							$scope.processPhoto(index + 1);
						};

						writer.write(new Blob([blob_uri], {
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
						$scope.writeFile(index, newFullName, entry, blob_uri, true);
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

			$scope.processPhoto = function (index) {
				// Get a reference to the photo object.
				var photo = $rootScope.state.selectedPhotos[index];

				// Get a reference to the folder object.
				var entry = $rootScope.state.targetEntry;

				// Get a reference to the user selected photo size.
				var size = settings.values.size;

				console.log('PHOTO SIZE: ', size);

				if (photo === null || photo === undefined) // checks null or undefined
				{
					$scope.$apply(function () {

						// Reset everything to empty state.
						$rootScope.state.searchText = '';
						$rootScope.state.selectedPhotos = [];
						$scope.completed = true;

						if (settings.values.completed) {

							notify('success', 'basic', 'Download Complete',
								'All ' + $scope.count + ' photos have been saved successfully.',
								function (id) {
									// Launch the local file browser at the target destination.
								});
						}
					});

					return;
				}

				console.log('INDEX: ', index);
				console.log('Process Photo: ', photo);

				// Download the photo
				$scope.loadImage(photo, size, function (blob_uri, originalItem) {

					console.log('blob_uri: ', blob_uri);

					var fileName = photo.getFileName(size);

					$scope.writeFile(index, fileName, entry, blob_uri);


				});
			};

			// Start the download immediately when the view is loaded.
			$scope.$on('$viewContentLoaded', function () {

				var photos = $rootScope.state.selectedPhotos;

				// Set the image count.
				$scope.count = photos.length;

				var index = 0;

				$scope.processPhoto(index);

			});
    }]);

	controllers.controller('FolderController', ['$scope', '$rootScope',
		function ($scope, $rootScope) {

			$rootScope.state.background = 'wallpaper-light';
			$rootScope.state.actionTarget = 'download';
			$rootScope.state.showActions = true;

			$scope.count = 0;
			$scope.path = '';

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

			$scope.loadImage = function (item, callback) {
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onload = function () {
					callback(xhr.response, item);
				};
				xhr.open('GET', item.getUrl('b'), true);
				xhr.send();
			};

			$scope.chooseFolder = function () {
				chrome.fileSystem.chooseEntry({
					type: 'openDirectory'
				}, function (entry) {

					// Small validation, perhaps not needed?
					if (entry.isDirectory !== true) {
						console.log('Selected path is not a directory. Aborting.');
						return;
					}

					$rootScope.state.targetEntry = entry;

					chrome.fileSystem.getDisplayPath(entry, function (path) {


						$scope.$apply(function () {

							console.log('FULL PATH: ', path);
							$rootScope.state.targetPath = path;
							$scope.path = path;
						});
					});

					console.log('DIALOG: ', entry);
				});
			};
    }]);


	controllers.controller('DebugController', ['$scope', '$rootScope', 'settings',
		function ($scope, $rootScope, settings) {

			$rootScope.state.background = 'wallpaper-3';
			$scope.enableLogConsole = false;
			$scope.enableAllLicenses = false;
			$scope.bytesInUseSync;
			$scope.bytesInUseLocal;

			$scope.userSettings = settings.values;

			// Start the download immediately when the view is loaded.
			$scope.$on('$viewContentLoaded', function () {

				console.log('viewContentLoaded: DebugController');

				chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {

					console.log('chrome.storage.sync.getBytesInUse callback: ', bytesInUse);
					$scope.bytesInUseSync = bytesInUse;
					$scope.$apply();

				});

				chrome.storage.local.getBytesInUse(null, function (bytesInUse) {

					console.log('chrome.storage.local.getBytesInUse callback: ', bytesInUse);
					$scope.bytesInUseLocal = bytesInUse;
					$scope.$apply();

				});

			});
    }]);


	controllers.controller('TestController', ['$scope', '$rootScope',
		function ($scope, $rootScope) {

			$scope.enableLogConsole = false;
			$scope.enableAllLicenses = false;

    }]);

	controllers.controller('MenuController', ['$rootScope', '$scope', '$http', '$timeout', 'flickr', 'util', '$log', '$location', 'socket', 'settings', '$mdSidenav',
		function ($rootScope, $scope, $http, $timeout, flickr, util, $log, $location, socket, settings, $mdSidenav) {

			$scope.closeMenu = function () {
				console.log('closeMenu');
				$mdSidenav('left').close();
			};

		}]);


	controllers.controller('ScreenController', ['$rootScope', '$scope', '$http', '$timeout', 'flickr', 'util', '$log', '$location', 'socket', 'settings', '$mdSidenav',
		function ($rootScope, $scope, $http, $timeout, flickr, util, $log, $location, socket, settings, $mdSidenav) {

			$scope.$on('Event:NavigateBack', function () {
				$scope.goBack();
			});

			$scope.expandMenu = function () {
				$mdSidenav('left').toggle();
			}

			$scope.tabSelected = function (url) {
				console.log('tabSELECTED: ', url);
				$location.path(url);
			}

			$scope.showSearchControls = function () {
				$rootScope.state.showSearchControls = true;
			}

			$scope.toggleFullscreen = function () {

				if (chrome.app.window.current().isFullscreen()) {
					chrome.app.window.current().restore();
				} else {
					chrome.app.window.current().fullscreen();
				}
			};

			$scope.keyboard = {
				'ctrl+t+d': function () {
					console.log('Open up [T]est & [D]ebug mode for developers.');
					$rootScope.state.debug = !$rootScope.state.debug;
					settings.values.debug = $rootScope.state.debug;
					settings.save();
				},
				'ctrl+s': function () {
					console.log('Begin search?');
				},
				'alt+enter': function () {
					$scope.toggleFullscreen();
				}
			};

			$scope.parseProfile = function (data) {

				// Validate successfull results.
				if (data.stat !== 'ok') {
					console.log('Results not OK. Aborting parsing.');
					return;
				}

				console.log('Parsing...');

				var server = data.person.iconserver;
				var farm = data.person.iconfarm;
				var nsid = data.person.nsid;

				var buddyIconUrl = 'https://farm{icon-farm}.staticflickr.com/{icon-server}/buddyicons/{nsid}.jpg';

				var url = util.format(buddyIconUrl, {
					'icon-farm': farm,
					'icon-server': server,
					nsid: nsid
				});
				console.log(url);

				$scope.profileIconUrl = url;

				// Show the home screen when authentcation completed.
				$scope.goHome();

				if ($rootScope.state.packaged) {
					// This is done to support both FireFox and Chrome.
					//window.URL = window.URL || window.webkitURL;

					$http.get(url, {
						responseType: 'blob'
					}).success(function (blob) {

						console.log('WHAT?!?!?!');

						var img = document.getElementById('buddyIconImg');
						img.src = window.URL.createObjectURL(blob);

						// Write the blob to disk.
						navigator.webkitPersistentStorage.requestQuota(
							2048, //bytes of storage requested
							function (availableBytes) {
								console.log(availableBytes);
							}
						);

						console.log('ONLINE: ' + navigator.onLine);

					});


				} else {

				}
			};

			$scope.handleWindowEvents = function () {

				if ($rootScope.state.packaged) {
					// Happens when user uses the window bar or shortcuts to maximize.
					$scope.isMaximized = chrome.app.window.current().isMaximized();

					// This happens from an event and therefore we need to run $apply to make the UI update.
					$scope.$apply();
				}

			};

			$scope.testView = function () {
				var url = chrome.extension.getURL('test.html');
				var webview = document.getElementById('debugView');
				webview.src = url;
			};

			$scope.debugView = function () {
				var webview = document.getElementById('debugView');
				webview.src = './debug.html';
			};

			$scope.minimize = function () {
				chrome.app.window.current().minimize();
			};

			$scope.maximize = function () {
				chrome.app.window.current().maximize();
			};

			$scope.restore = function () {
				chrome.app.window.current().restore();
			};

			$scope.close = function () {
				window.close();
			};

			$scope.logout = function () {

			};

			$scope.goBack = function () {
				console.log('Going Back to: ' + $scope.previousScreen);
				$scope.changeScreen($scope.previousScreen);
			};

			$scope.goHome = function () {
				//$scope.changeScreen('start');
			};

			$scope.isProfileLoading = true;
			$scope.profileIconUrl = 'images/buddyicon.gif';
			$scope.isLoggedIn = false;
			$scope.previousScreen = null;
			$scope.selectedScreen = '';
			$scope.isInitializing = true;

			// Run this after all code have run once, to ensure that chrome.app.window
			// is available fully.
			$timeout(function () {

				console.log('VIEW CONTENT LOADED!!');

				if ($rootScope.state.packaged) {
					var current = chrome.app.window.current();

					// Make sure we read the initial state as well, since the app might startup as maximized.
					$scope.isMaximized = current.isMaximized();

					current.onMaximized.addListener($scope.handleWindowEvents);
					current.onMinimized.addListener($scope.handleWindowEvents);
					current.onRestored.addListener($scope.handleWindowEvents);
				} else {
					$scope.isMaximized = false;
				}

			}, 0);
    }]);
})();