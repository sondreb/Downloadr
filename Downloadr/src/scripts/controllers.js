/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

	var app = angular.module('downloadr');

	app.controller('StatusController', ['$scope', '$rootScope', 
		function ($scope, $rootScope) {
			
			console.log('STATUS CONTROLLER!');
			
			$rootScope.state.statusMessage = 'Welcome! Login to enable additional features.';
			
			$scope.message = $rootScope.state.statusMessage;
			
			$scope.$on('status', function (event, args) {

				console.log('Status: ', args.message);
				
				if (args.message === null || args.message === '')
				{
					// Setting status to empty string or nothing, will make the UI fail.
					$scope.message = $rootScope.state.statusMessage;
				}
				else
				{
					$scope.message = args.message;
				}

			});

    }]);

	app.controller('HomeController', ['$scope', '$rootScope', 'settings', '$document',
		function ($scope, $rootScope, settings, $document) {

			
			$rootScope.$broadcast('status', {
				message: ''
			});
			
			$scope.buddyIcon = 'https://farm3.staticflickr.com/2881/buddyicons/32954227@N00.jpg?1369136221#32954227@N00';
			
			$scope.searchType = function(type){
				// Check for undefined, to support older app versions.
				if (settings.values.type === undefined || settings.values.type === type) {
					return 'btn--light-blue';
				} else {
					return 'btn--white';
				}
			};
			
			$scope.selectType = function(type){
				settings.values.type = type;
			};
			
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

	
	app.controller('ProfileController', ['$scope', '$rootScope', 'settings', 'flickr', 'HOST', '$http', 'fileManager', '$routeParams', 
		function ($scope, $rootScope, settings, flickr, HOST, $http, fileManager, $routeParams) {
		
			// Cleanup of resources is now handled by the image directive itself.
			$scope.$on('$destroy', function() {
				console.log("ProfileController: destroy");
				//console.log($scope.uri);
				//URL.revokeObjectURL($scope.uri);
				
				// Remove the $on handler.
				$scope.onFilterEvent();
				
			});	
			
			$rootScope.state.background = 'wallpaper-3';
			
			$rootScope.state.showActions = true;
			$rootScope.state.showLicenses = true;
			$rootScope.state.showSorting = true;
			$rootScope.state.showSizes = false;
			$rootScope.state.showCounter = true;
			$rootScope.state.actionTarget = 'folder';
			
			$scope.status = {
				photos: '',
				albums: '',
				favorites: '',
				galleries: ''
			};
			
			$scope.userId = ($routeParams.userId !== undefined) ? $routeParams.userId : flickr.state.userId;
			
			$rootScope.$broadcast('status', {
					message: 'Showing profile for ' + $scope.userId + '.'
			});
			
			//$scope.searchTerm = '';
			
			$scope.activeTab = 0;
			
			$scope.$watch('activeTab', function(current, old){
				$scope.selectTab($scope.activeTab);
			});
			
			$scope.selectTab = function(index){
			
				switch(index)
				{
					case 0:
						
						//if ($scope.photos.length === 0)
						//{
							
							//$scope.findPhotos();
						//}
						
						$rootScope.state.showLicenses = true;
						$rootScope.state.showSorting = true;
						
						break;
					case 1:
						
						$rootScope.state.showLicenses = false;
						$rootScope.state.showSorting = false;
						
						break
					case 2:
					
						$rootScope.state.showLicenses = false;
						$rootScope.state.showSorting = false;
						
						break;
					case 3:
						
						$rootScope.state.showLicenses = false;
						$rootScope.state.showSorting = false;
						
						break;
					case 4:
						break;
				}
			};
			
			$scope.queryPhotos = {
				method: 'flickr.photos.search',
				arguments: {
						text: '',
						user_id: $scope.userId,
						safe_search: settings.values.safe,
						sort: settings.values.sort,
						license: settings.values.license,
						per_page: '20',
						extras: 'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
				}
			};
			
			$scope.queryAlbums = {
				method: 'flickr.photosets.getList',
				arguments: {
					user_id: $scope.userId,
					safe_search: settings.values.safe,
					sort: settings.values.sort,
					per_page: '20',
					primary_photo_extras: 'license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
				}
			};
			
			$scope.queryFavorites = {
				method: 'flickr.favorites.getList',
				arguments: {
						user_id: $scope.userId,
						per_page: '20',
						extras: 'description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
				}
			};
			
			$scope.queryGalleries = {
				method: 'flickr.galleries.getList',
				arguments: {
					user_id: $scope.userId,
					per_page: '50',
					page: '' + $scope.galleriesPage + '',
					primary_photo_extras: 'date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
				}
			};
			
			$scope.onFilterEvent = $rootScope.$on('Event:Filter', function (event) {

				//$scope.clearPhotos();

				console.log('User changed filter...');
				
				//console.log($scope.photos);
				//$scope.clearObjectURLs($scope.photos);
				
				//$scope.photos = [];
				
				//$scope.findPhotos();
				
				//$scope.performSearch($rootScope.state.searchText);

			});
			
			/*
			$scope.downloadAlbumArt = function()
			{
				var currentAlbum = $scope.albums[$scope.albumDownloadIndex];

				fileManager.download(currentAlbum.url, function(uri, url, response) {

					currentAlbum.uri = uri;

					$scope.albumDownloadIndex = $scope.albumDownloadIndex + 1;

					if ($scope.albumDownloadIndex < $scope.albums.length)
					{
						$scope.downloadAlbumArt();
					}
					
				});
			};*/
			
			/*
			$scope.showAlbumMenu = function (album) {
				//var url = 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id;
				var url = album.link;
				console.log('Open: ', url);
				window.open(url);
			};*/
			
			//$scope.albumDownloadIndex = 0;
			
			$scope.findError = function() {
			
				console.log('Find Albums Error!');
			};
			
			$scope.findProfile = function() {
			
				// Receives 401 error from this call, look into later: https://www.flickr.com/services/api/flickr.stats.getTotalViews.html	
				//var query = flickr.createMessage('flickr.stats.getTotalViews', {});
				//console.log('Sign URL message: ', query);
				//flickr.query(query, $scope.findProfileSuccess, $scope.requestError);
				
				// The username returned from service is url encoded, so we'll need to convert.
				var query = flickr.createMessage('flickr.people.getInfo', {
					user_id: $scope.userId
				});
				
				flickr.query(query, $scope.findUserInfoSuccess, $scope.error);
				
			};
			
			$scope.profile = [];
			
			$scope.name = '';
			$scope.username = '';
			
			$scope.buddyIcon = null;
			$scope.buddyIconLarge = null;
			
			//$scope.buddyIcon = 'https://farm3.staticflickr.com/2881/buddyicons/32954227@N00.jpg?1369136221#32954227@N00';
			
			$scope.findUserInfoSuccess = function(data) {
				
				if (data.ok)
				{
					console.log('findUserInfoSuccess: ', data);
				
					// Reset the list.
					$scope.profile = [];

					var list = $scope.profile;

					// When person, the items is not a list but singular.
					var person = data.items;

					console.log(person);
					
					$scope.buddyIcon = 'http://farm' + person.iconfarm + '.staticflickr.com/' + person.iconserver + '/buddyicons/' + person.nsid + '.jpg';
					$scope.buddyIconLarge = 'http://farm' + person.iconfarm + '.staticflickr.com/' + person.iconserver + '/buddyicons/' + person.nsid + '_r.jpg'

					$scope.name = (person.realname._content !== '') ? person.realname._content : person.username._content;
					$scope.username = person.username._content;
					
					//list.push({ key: 'Name', value: person.realname._content });
					list.push({ key: 'Username', value: person.username._content });
					//list.push({ key: 'User Id', value: person.nsid });
					list.push({ key: 'Location', value: person.location._content });
					list.push({ key: 'Photos', value: person.photos.count._content });
					
					if (person.photos.views !== undefined)
					{
						list.push({ key: 'Views', value: person.photos.views._content });
					}
					
					var joinedDate = new Date(person.photos.firstdate._content*1000).toDateString();

					list.push({ key: 'Joined', value: joinedDate });
					list.push({ key: 'Oldest Photo', value: person.photos.firstdatetaken._content });


					list.push({ key: 'Profile', value: person.profileurl._content, isLink: true });
					list.push({ key: 'Photos', value: person.photosurl._content, isLink: true });

					var proAccount = (person.ispro === 1) ? 'true' : 'false';
					list.push({ key: 'Pro Account', value: proAccount });

                    if (person.timezone !== undefined)
                    {
                        list.push({ key: 'Timezone', value: person.timezone.label });
                    }
					
					list.push({ key: 'Description', value: person.description._content });
				}
				else
				{
					// Something bad happened, inform user.
				}
				
			};
			
			$scope.findProfileSuccess = function(data) {
				
				console.log('findProfileSuccess: ', data);
				
			};
			
			$scope.error = function() {
			
				console.log('Failed to perform signing request.');
				
			};
			
			// Upon loading, we'll make sure we load the user profile.
			$scope.findProfile();
			
	}]);
	
	
	app.controller('AboutController', ['$scope', '$rootScope', 'settings',
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

	app.controller('LoginController', ['$scope', '$rootScope', '$location', 'HOST', '$http', '$timeout',
		function ($scope, $rootScope, $location, HOST, $http, $timeout) {

			// Was unable to bind to the src attribute, so have to use DOM.
			var webview = document.querySelector('webview');
			
			$rootScope.state.background = 'wallpaper-3';
			
			$scope.loginUrl = '';

			$scope.getLoginUrl = function(ok, fail) {
				
				var url = HOST + '/login/url';
				console.log('Calling HTTP Server... ', url);

				// When no token is found, we'll issue a command to get login url.
				$http.get(url).success(ok).error(fail);
				
			};
			
			$scope.onLoginUrl = function(data, status, headers, config)
			{
				console.log('Flickr auth URL: ', data.url);
				$scope.loginUrl = data.url;
				
				// Set the source to be login URL.
				webview.src = $scope.loginUrl;
				
				$rootScope.$broadcast('status', {
					message: 'Loading Flickr.com for authorization...'
				});
			};
			
			$scope.onLoginUrlError = function(data, status, headers, config) {
				console.log('Unable to connect with server: ', status);
				
				$rootScope.$broadcast('status', {
					message: 'Service is unavailable. Please try again later. Code: ' + status
				});
			};
			
			// Call the login URL on root.
			$scope.getLoginUrl($scope.onLoginUrl, $scope.onLoginUrlError);
			
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
                    
                    $timeout(function() {
                    
                        $rootScope.authenticated(oauth_token, oauth_verifier);
						
						// Notify the server so we can transform this token into
						// a proper access token the user can store permanently.
						//socket.emit('accessGranted', {
						//	oauth_token: oauth_token,
						//	oauth_verifier: oauth_verifier
						//})
						
						$rootScope.state.isAnonymous = false;

						// Navigate to home.
						$location.path('/#');
                        
                    }, 0);
                   
				}

				console.log('webview loaded: ' + webview.src);
				
				$rootScope.$broadcast('status', {
					message: 'Login to complete the authorization.'
				});

			});

    }]);

	app.controller('LogoutController', ['$scope', '$rootScope', '$location',
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


	app.controller('SearchController', ['$scope', '$rootScope',
    '$location', '$http',
    '$timeout', 
    'flickr', 'settings', 'HOST',
		function ($scope, $rootScope, $location, $http, $timeout, flickr, settings, HOST) {

			//$rootScope.state.background = 'wallpaper-dark';
			$rootScope.state.background = 'wallpaper-3';
			
			$rootScope.state.showActions = true;
			$rootScope.state.actionTarget = 'folder';
			$rootScope.state.showLicenses = true;
			$rootScope.state.showSorting = true;
            $rootScope.state.showSizes = false;
            $rootScope.state.showCounter = true;
			
			$scope.searchStatus = '';
            $scope.currentUserId = '';
			
			$scope.$on('$destroy', function (event) {

				console.log('Destroy: SearchController... Cleaning up Resources...');

				//$scope.showLoadMore = true;
				$scope.searchStatus = '';
				
				// Whenever the user navigates away from SearchController, make sure
				// we cleanup resources in use.
				//$scope.clearPhotos();

				// Remove global event listeners.
				//$scope.onSearchEvent();
				//$scope.onFilterEvent();
				//$scope.onPagingEvent();

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

			$scope.queryPhotos = {
				method: 'flickr.photos.search',
				arguments: {
						text: $rootScope.state.searchText,
						safe_search: settings.values.safe,
						sort: settings.values.sort,
						license: settings.values.license,
						per_page: '25',
						extras: 'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
				}
			};
			
			$scope.showMenu = function (photo) {
				var url = 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id;
				console.log('Open: ', url);
				window.open(url);
			};

			$scope.performSearchByUserId = function()
			{
				console.log('performSearchByUserId!!!!!!!!!!!');
				var url = '/profile/' + $scope.currentUserId;
				console.log('URL: ', url);
				$location.path(url);
			}
			
			$scope.onUserSearch = function(message)
			{
				console.log('Message Received: ', message);
				var url = 'https://' + message.hostname + message.path;
				
				$http.post(url).success(function (data, status, headers, config) {
					// this callback will be called asynchronously
					// when the response is available
					console.log('Service results: ', data);
					console.log('Service HTTP status: ', status);

					if (data.stat === 'ok')
					{
						$rootScope.$broadcast('status', {
							message: 'Found user ' + data.user.username._content + ', listing photos...'
						});
						
						$scope.showLoadMore = true;
						$scope.searchStatus = '';

						$scope.currentUserId = data.user.nsid;
						$scope.performSearchByUserId();
						
					}
					else
					{
						$rootScope.$broadcast('status', {
							message: 'User not found.'
						});
						
						$scope.showLoadMore = false;
						$scope.searchStatus = data.message + '.';
					}
				}).
				error(function (data, status, headers, config) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
					console.log(data);
					console.log('HTTP Status: ', status);
				});
				
			}

			$scope.performSearch = function (searchTerm) {
				
				var message;
				
				if (settings.values.type === 'user')
				{
					// If the user is asking for more, we already know the user's name and we'll perform another search with same userID.
					if ($scope.page > 1)
					{
						$scope.performSearchByUserId();
					}
					else
					{
						if (searchTerm.indexOf('@') > -1)
						{
							message = flickr.createMessage('flickr.people.findByEmail', {
								find_email: searchTerm
							});
						}
						else
						{
							message = flickr.createMessage('flickr.people.findByUsername', {
								username: searchTerm
							});
						}

						console.log('Sign URL message: ', message);
						var url = HOST + '/search';
						$http.post(url, message).success($scope.onUserSearch).error($scope.onUrlSignedError);
					}
				}
				else
				{
					// Get a prepared message that includes token.
					// Until we know exactly what metadata we need, we'll ask for all extras.
					
					/*
					message = flickr.createMessage('flickr.photos.search', {
						text: searchTerm,
						safe_search: settings.values.safe,
						sort: settings.values.sort,
						license: settings.values.license,
						per_page: '25',
						page: '' + $scope.page + '',
						extras: 'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
					});
					
					console.log('Sign URL message: ', message);
					var url = HOST + '/search';
					$http.post(url, message).success($scope.onUrlSigned).error($scope.onUrlSignedError);
					*/
				}
			};
			
			$scope.onUrlSignedError = function(data, status, headers, config)
			{
				console.log('Unable to sign search request: ', status);
				console.log('Error Data: ', data);
				console.log('Error Data: ', headers);

				$rootScope.$broadcast('status', {
					message: 'Service is unavailable. Please try again later. Code: ' + status
				});
			};
			
			$scope.init = function () {

				// This is first run, meaning user have probably performed search from
				// home view. Read the state and perform search now.
				$scope.performSearch($rootScope.state.searchText);

			};
			
			$scope.init();
    }]);


	app.controller('SettingsController', ['$scope', '$rootScope', 'settings',
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
				
				$rootScope.$broadcast('status', {
					message: 'Settings saved.'
				});
				
			}, true);

    }]);


	app.controller('ActionsController', ['$scope', '$rootScope', 'settings', '$location', 'downloadManager',
		function ($scope, $rootScope, settings, $location, downloadManager) {

			$scope.sorting = {
				'relevance': 'Relevant',
				'date-posted-desc': 'Recent',
				'interestingness-desc': 'Interesting'
			};

			//$scope.count = 0;
			$scope.total = 0;
			
			$scope.settings = settings;
			$scope.managerState = downloadManager.state;
			//$scope.count = downloadManager.state.count;
			
			
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

			/*
			$scope.$on('Event:SelectedPhotosChanged', function (event, data) {
				
				console.log('Event:SelectedPhotosChanged: ', data);
				
				var selectedCount = 0;
				
				data.photos.forEach(function (item) {
					
					if (item.count !== undefined)
					{
						selectedCount += item.count;
					}
					else
					{
						selectedCount += 1;
					}
					
					console.log(item);
				});
				
				// The count should be of both albums and individual selected photos.
				$scope.count = selectedCount;

				if (data.total) {
					$scope.total = data.total;
				}

			});*/

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
			
			/*
			$scope.showSorting = function() {
			
				//console.log('showSorting...', settings.values.type);
				
				if (settings.values.type === 'user')
				{
					return false;
				}
				else
				{
					return $scope.state.actionTarget == 'folder';
				}
			};*/

			$scope.navigateBack = function () {

				console.log('Navigate back');
				$location.path($rootScope.state.previouspath);

			};

			$scope.clearSelection = function () {
				
				// Clear any selected items from the manager.
				downloadManager.clear();
				
				//$rootScope.state.selectedPhotos.forEach(function (photo) {
				//	photo.selected = false;
				//});

				//$rootScope.state.selectedPhotos = [];
				
				//$rootScope.$broadcast('Event:SelectedPhotosChanged', {
				//	photos: $rootScope.state.selectedPhotos
				//});
			};
    }]);


	// The download controller is responsible for handling the downloading of photos, albums and galleries.
	// This controller supports proper paging and downloads are processed one page at a time, to support downloading
	// of unlimted number of photos without any memory issues.
	
	app.controller('DownloadController', [
		'$scope', 
		'$rootScope', 
		'notify', 
		'settings', 
		'$mdDialog', 
		'flickr', 
		'downloadManager', 
		'fileManager',
		'$timeout',
		function ($scope, $rootScope, notify, settings, $mdDialog, flickr, downloadManager, fileManager, $timeout) {
			
			$rootScope.state.background = 'wallpaper-light';
			
			// This is the continue method that is executed whenever a page is completely downloaded.
			$scope.continue = null;
			$scope.queue = [];
			
			console.log('SETTING $SCOPE.ITEMS FROM DOWNLOADMANAGER.ITEMS!, ', downloadManager.items);
			
			//$scope.items = downloadManager.items;
			
			$scope.count = 0; // The total count user selected.
			$scope.current = 0; // The current photo.
			$scope.skipped = 0; // Number of skipped photos due to invalid license/permission.
			
			//$scope.photoIndex = 0;
			//$scope.photoNumber = 1;
			$scope.completed = false;
			$scope.paused = false;
			$scope.pauseResumeText = 'Pause';
			
			$scope.photosetPage = 1;
			$scope.photosetId = null;
			
			$scope.galleryPage = 1;
			$scope.galleryId = null;
			
			$scope.queueIndex = 0;
			
			//$scope.sizes = ['o', 'b', 'c', 'z', '-', 'n', 'm', 't', 'q', 's'];
			//$scope.sizes = ['o', 'l', 'z', 'n', 'sq'];
			$scope.sizes = ['o', 'l', 'z', 'n', 'q'];
			
			$rootScope.$broadcast('status', {
					message: 'Downloading...'
			});
			
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
				for (var i = (startIndex + 1); i < $scope.sizes.length; i++) {

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
				
				//var url = $scope.getUrl(photo, photoSize);
				var fileName = url.replace(/^.*[\\\/]/, '');

				var newFileName = fileName.substring(0, fileName.lastIndexOf('.'));
				var newFileNameExt = fileName.substring(fileName.lastIndexOf('.'));
				var newFullName = newFileName + '_' + $scope.getLicenseName(license).toLowerCase() + newFileNameExt;
				
				return newFullName;
			};
			
			$scope.getLicenseName = function(license) {
						
				for(var i = 0; i < $rootScope.licenses.length; i++)
				{
				  if($rootScope.licenses[i].id == license)
				  {
					return $rootScope.licenses[i].extension;
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
			
			$scope.pause = function() {
			
				$scope.paused = !$scope.paused;
				
				if ($scope.paused)
				{
					$scope.pauseResumeText = 'Resume';
				}
				else
				{
					$scope.pauseResumeText = 'Pause';
					
					// Continue processing.
					$scope.processQueue();
					
					//$scope.photoIndex = $scope.photoIndex + 1;
					//$scope.processPhoto();
				}
			};
			
			$scope.cancel = function() {
				$scope.paused = true;
				
				// Set the count, so we'll only display the number that was downloaded before canceling.
				$scope.count = $scope.current;
				
				$scope.downloadCompleted('Download canceled.');
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
							if (percentage > 100)
							{
								percentage = 100;
							}
							
							if (settings.values.progress) {
								// Should we do Pause/Cancel buttons for this notification?
								notify('progress', 'progress', 'Downloaded ' + $scope.current + ' of ' + $scope.count,
									'You will be notified when download is completed.',
									function (id) {}, Math.round(percentage));
							}

							// Process the next photo
							if (!$scope.paused)
							{
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
			
			// Get a reference to the user selected photo size.
			$scope.photoSize = settings.values.size;
			
			// Get a reference to the folder object.
			$scope.entry = $rootScope.state.targetEntry;

			$scope.processPhoto = function (photo) {
				
				console.log('PHOTO SIZE: ', $scope.photoSize);
				console.log('Process Photo: ', photo);
				
				if (photo.can_download === 0) // Photo cannot be downloaded.
				{
					console.log('User cannot download this photo.');
					$scope.skipped++;
					$scope.processQueue();
				}
				else
				{
					var url = $scope.getUrl(photo, $scope.photoSize);

					// Download the photo
					fileManager.download(url, $scope.downloaded, $scope.error, photo);
				}
			};
			
			$scope.downloaded = function(uri, url, response, photo) {
				
				console.log('blob_uri: ', uri);
				
				var fileName = $scope.getFileName(url, photo.license);
				
				$scope.writeFile(fileName, $scope.entry, response);
			
			};
			
			$scope.queryPhotoset = function() {
			
				var query = flickr.createMessage('flickr.photosets.getPhotos', {
					photoset_id: $scope.photosetId,
					media: 'photos',
					per_page: '20',
					page: '' + $scope.photosetPage + '',
					extras: 'license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
				});

				// license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_m, url_o
				//'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'

				flickr.query(query, $scope.listPhotoset, $scope.error);

			};
			
			$scope.queryGallery = function() {
			
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
			
			$scope.processQueue = function() {
			
				// Pop an item.
				var photo = $scope.queue.pop();
				
				console.log('processQueue: ', photo);
				
				if (photo === undefined)
				{
					console.log($scope.continue);
					
					if ($scope.continue != null)
					{
						// We are all done, call the continue handler.
						$scope.continue();
					}
					else
					{
						// Process the next item when we are done with the current one.
						$scope.processItems();
					}
				}
				else
				{
					// Process this photo.
					$scope.processPhoto(photo);
				}
			};
			
			$scope.processItems = function() {
			
				var item = downloadManager.items.pop();
				
				if (item === undefined)
				{
					console.log('NO MORE ITEMS, COMPLETED!!');
					
					// We are all done, notify about success!
					$scope.downloadCompleted('Downloading completed.');
				}
				else
				{
					$scope.processItem(item);
				}
			};
			
			$scope.processItem = function(item) {
			
				if (item.type === 'photo')
				{
					// Process this photo right away, don't bother adding to batch queue.
					$scope.processPhoto(item);
				}
				else if (item.type === 'photoset')
				{
					$scope.photosetId = item.id;
					$scope.queryPhotoset();
				}
				else if (item.type === 'gallery')
				{
					$scope.galleryId = item.id;
					$scope.queryGallery();
				}
				else
				{
					console.log('Unhandled file type to download...', item);
				}
			
			};
			
			$scope.listPhotoset = function(data) {
				
				console.log(data);
				
				data.items.forEach(function (item) {
					// Populate the queue with a batch of photos to process.
					$scope.queue.push(item);
				});
				
				if (data.page === data.pages)
				{
					// Process the next item in the full list in DownloadManager.
					$scope.continue = null;
					
					// Remember to reset the photoset page for next photoset in the processing queue.
					$scope.photosetPage = 1;
					
					// Process the queue to complete this album/gallery.
					$scope.processQueue();
				}
				else
				{
					// Register the callback for continue operation when queue is processed.
					$scope.continue = function(){
						$scope.photosetPage++;
						$scope.queryPhotoset();
					};
					
					// Process the queue of all the photos we just added.
					$scope.processQueue();
				}
			};
			
			$scope.listGallery = function(data) {
				
				console.log(data);
				
				data.items.forEach(function (item) {
					// Populate the queue with a batch of photos to process.
					$scope.queue.push(item);
				});
				
				if (data.page === data.pages)
				{
					// Process the next item in the full list in DownloadManager.
					$scope.continue = null;
					
					// Remember to reset the photoset page for next photoset in the processing queue.
					$scope.galleryPage = 1;
					
					// Process the queue to complete this album/gallery.
					$scope.processQueue();
				}
				else
				{
					// Register the callback for continue operation when queue is processed.
					$scope.continue = function(){
						$scope.galleryPage++;
						$scope.queryGallery();
					};
					
					// Process the queue of all the photos we just added.
					$scope.processQueue();
				}
			};
			
			$scope.error = function(err) {
			
				console.log('Failed in download process...', err);
				
			};
			
			$scope.downloadCompleted = function(message) {

				console.log('Running clear...');

				// Clean up the download manager.
				downloadManager.clear();
				
				$scope.completed = true;
				
				$timeout(function() {

					// Reset everything to empty state.
					$rootScope.state.searchText = '';
					$scope.completed = true;
					
				}, 0);

				console.log('Completed set to true...');

				$rootScope.$broadcast('status', {
					message: message
				});

				// Notify if the user have selected to get the Chrome notification.
				if (settings.values.completed) {

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
    }]);

	app.controller('FolderController', ['$scope', '$rootScope', 'downloadManager',
		function ($scope, $rootScope, downloadManager) {

			$rootScope.state.background = 'wallpaper-light';
			$rootScope.state.actionTarget = 'download';
			
			$rootScope.state.showActions = true;
			$rootScope.state.showLicenses = false;
			$rootScope.state.showSorting = false;
			$rootScope.state.showSizes = true;
			$rootScope.state.showCounter = false;
			
			$scope.count = downloadManager.state.count;
			$scope.path = '';
			
			$rootScope.$broadcast('status', {
					message: 'Choose folder to save ' + $scope.count + ' photos.'
			});
			
			
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


	app.controller('DebugController', ['$scope', '$rootScope', 'settings',
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


	app.controller('TestController', ['$scope', '$rootScope',
		function ($scope, $rootScope) {

			$scope.enableLogConsole = false;
			$scope.enableAllLicenses = false;

    }]);

	app.controller('MenuController', ['$rootScope', '$scope', '$http', '$timeout', 'flickr', 'util', '$log', '$location', 'settings', '$mdSidenav',
		function ($rootScope, $scope, $http, $timeout, flickr, util, $log, $location, settings, $mdSidenav) {

			$scope.closeMenu = function () {
				console.log('closeMenu');
				$mdSidenav('left').close();
			};

		}]);


	app.controller('ScreenController', ['$rootScope', '$scope', '$http', '$timeout', 'flickr', 'util', '$log', '$location', 'settings', '$mdSidenav', 'storage',
		function ($rootScope, $scope, $http, $timeout, flickr, util, $log, $location, settings, $mdSidenav, storage) {

			$scope.$on('Event:NavigateBack', function () {
				$scope.goBack();
			});

			$scope.expandMenu = function () {
				$mdSidenav('left').toggle();
			};
            
			$scope.searchType = function(type){
				// Check for undefined, to support older app versions.
				if (settings.values.type === undefined || settings.values.type === type) {
					return 'btn--light-blue';
				} else {
					return 'btn--white';
				}
			};
			
			$scope.selectType = function(type){
				settings.values.type = type;
			};
			
			$scope.tabSelected = function (url) {
				console.log('tabSELECTED: ', url);
				$location.path(url);
			};

			$scope.showSearchControls = function () {
				$rootScope.state.showSearchControls = true;
			};

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