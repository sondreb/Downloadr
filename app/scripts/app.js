/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

	// Create the app module and dependencies.
	var downloadr = angular.module('downloadr', [
        'ngRoute',
        'mousetrap',
        'infinite-scroll',
		'ngMaterial',
        'downloadr.filters',
        'downloadr.services',
        'downloadr.directives',
        'downloadr.controllers'
    ]);

	downloadr.value('version', '3.0.0');
	downloadr.value('author', 'Sondre Bjellås');
	downloadr.value('config_socket_server', 'http://flickr-downloadr.com');
	//downloadr.value('config_socket_server', 'http://localhost:3000');
	
	downloadr.run(['$rootScope', '$location', 'searchProvider', 'socket', 'flickr', 'settings', 'notify', '$mdSidenav',
		function ($rootScope, $location, searchProvider, socket, flickr, settings, notify, $mdSidenav) {
			console.log('downloadr.run: ', flickr);

			var loadingStatus = { settings: false, runtime: false };
			
			var updateLoadingStatus = function() {

				console.log('updateLoadingStatus');
				
				$('body').addClass('loaded');
				
				// This ensures any data loaded in the async loading handlers is
				// updated in the UI.
				$rootScope.$apply();
				
				/*
				if (loadingStatus.settings === true && loadingStatus.runtime === true)
				{
					$('body').addClass('loaded');
				}*/
				
				if (loadingStatus.runtime === true)
				{
					$('body').addClass('loaded');
				}
			
			};
			
			$rootScope.$on('Settings:Loaded', function (settings) {
				
				loadingStatus.settings = true;
				
				updateLoadingStatus();
			});
			
			// First we need to get some platform info that we will use to
			// render different window icons.
			chrome.runtime.getPlatformInfo(function(platform) {
				
				switch(platform.os)
				{
						case 'mac':
							$rootScope.state.OS = 'mac';
						break;
						case 'win':
							$rootScope.state.OS = 'win';
						
							// Only for Windows will we show minimize/maximize/close on the right
							// Default in latest Ubuntu is on the left, same applies for OS X.
							$rootScope.state.showControlsLeft = false;
						break;
						default: // 'linux', 'android', 'cros', 'openbsd'
							$rootScope.state.OS = 'linux';
						break;
				}
				
				//$rootScope.state.OS = 'mac'
				//$rootScope.state.showControlsLeft = true;
				
				loadingStatus.runtime = true;
				
				updateLoadingStatus();
			});
			
			// Used to override the async preloading tasks, if one of them fails,
			// we'll still show the UI after the specified seconds.
			setTimeout(function(){
				$('body').addClass('loaded');
			}, 3000);
			
			// Licenses: https://www.flickr.com/services/api/flickr.photos.licenses.getInfo.html
			$rootScope.licenses = [
				{
					id: '0',
					title: 'All Rights Reserved',
					extension: 'ARR',
					font: ''
				},
				{
					id: '1',
					title: 'Attribution-NonCommercial-ShareAlike License',
					extension: 'CC-BY-NC',
					font: 'c b n'
				},
				{
					id: '2',
					title: 'Attribution-NonCommercial License',
					extension: 'CC-BY-NC-SA',
					font: 'c b n a'
				},
				{
					id: '3',
					title: 'Attribution-NonCommercial-NoDerivs License',
					extension: 'CC-BY-NC-ND',
					font: 'c b n d'
				},
				{
					id: '4',
					title: 'Attribution License',
					extension: 'CC-BY',
					font: 'c b'
				},
				{
					id: '5',
					title: 'Attribution-ShareAlike License',
					extension: 'CC-BY-SA',
					font: 'c b a'
				},
				{
					id: '6',
					title: 'Attribution-NoDerivs License',
					extension: 'CC-BY-ND',
					font: 'c b d'
				},
				{
					id: '7',
					title: 'No known copyright restrictions',
					extension: '',
					font: ''
				},
				{
					id: '8',
					title: 'United States Government Work',
					extension: 'GOV',
					font: ''
				}
        ];

			// i18n example:
			var resourceText = chrome.i18n.getMessage('settings_title');

			console.log('Resource Text: ', resourceText);

			$rootScope.state = {

				isAnonymous: true,

				isConnecting: true,

				// Used to see if we're running inside Chrome Packaged App.
				packaged: chrome.runtime !== undefined,

				background: 'wallpaper',

				showActions: false,

				actionTarget: 'folder',

				targetPath: '',

				targetEntry: null,

				searchText: '',

				loginUrl: '',

				selectedPhotos: [],
				
				OS: '',
				
				debug: false,
				
				showControlsLeft: true,
				
				focused: true,
				
				showSearchControls: false,
				
				currentPath: '',
				
				previouspath: '',
				
				userId: '',
				
				userName: ''

			};
			
			$(window).focus(function() {
				$rootScope.state.focused = true;
				
				// Do we need apply here?
				$rootScope.$apply();
				
			}).blur(function() {
				$rootScope.state.focused = false;
				
				// Do we need apply here?
				$rootScope.$apply();
			});

			$rootScope.$on('$routeChangeStart', function (event, next, current) {

				var path = $location.path();

				// Whenever the user navigate, we'll hide the actions bar.
				// It will manually be re-enabled by controllers that use it.
				$rootScope.state.showActions = false;

				if (path === '/' || path === '') {
					$rootScope.state.showSearchControls = false;
				} else {
					$rootScope.state.showSearchControls = true;
				}
				
				// Whenever the user navigates somewhere, we'll make sure that the sidemenu
				// is being closed as a result.
				$mdSidenav('left').close();
				
				$rootScope.state.previouspath = $rootScope.state.currentPath;
				$rootScope.state.currentPath = path;

			});

			$rootScope.performSearch = function () {

				if ($rootScope.state.searchText === null || $rootScope.state.searchText === '') {
					$rootScope.state.searchText = 'Kittens';
				}

				console.log('CLICK PERFORM SEARCH: ', $rootScope.state.searchText);

				$rootScope.$broadcast('Event:Search', {
					value: $rootScope.state.searchText
				});

			};


			$rootScope.$broadcast('status', {
				message: 'Starting...'
			});

			// Whenever the search directive raises the search event,
			// we'll update the rootScope.state.
			/*$rootScope.$on('Event:Search', function (event, data) {

          $rootScope.state.searchText = data.value;

        });*/


			//$rootScope.$broadcast('Event:Search', { value: 'Sweeet' });

			$rootScope.$on('Event:Logout', function () {

				console.log('Logout Initialized...');
				
				chrome.storage.sync.set({
					'token': null
				}, function () {
					// Notify that we saved.
					console.log('Token removed');
				});
				
				$rootScope.authenticationState(null);
				
				// Make sure we get a new login url.
				socket.emit('getUrl');
			});

			// Make sure we listen to whenever the local storage value have changed.
			chrome.storage.onChanged.addListener(function (changes, namespace) {
				for (var key in changes) {
					var storageChange = changes[key];
					console.log('Storage key "%s" in namespace "%s" changed. ' +
						'Old value was "%s", new value is "%s".',
						key,
						namespace,
						storageChange.oldValue,
						storageChange.newValue);

					if (key === 'token') {
						//flickr.parseToken(storageChange.newValue);
					}
				}
			});

			// Try to find existing token.
			chrome.storage.sync.get('token', function (result) {

				if (result === undefined || result === null) {
					console.log('No existing token found.');

					// When no token is found, we'll issue a command to get login url.
					socket.emit('getUrl');
				} else if (result.token === undefined || result.token === null) {
					console.log('No existing token found.');

					// When no token is found, we'll issue a command to get login url.
					socket.emit('getUrl');
				} else {
					
					$rootScope.authenticationState(result.token);
					
				}
			});

			// Whenever login URL is received, we will update the UI and enable
			// the login button.
			socket.on('url', function (message) {

				console.log('Flickr auth URL: ', message.url);

				$rootScope.state.loginUrl = message.url;
				$rootScope.state.isConnecting = false;
				$rootScope.$broadcast('status', {
					message: 'Connected.'
				});

			});

			// When we receive access token, make sure we store it permanently.
			socket.on('token', function (message) {

				// Save it using the Chrome extension storage API.
				// This will ensure the token is synced across devices.
				chrome.storage.sync.set({
					'token': message
				}, function () {
					// Notify that we saved.
					message('Token saved');
				});

				$rootScope.authenticationState(message);

			});
			
			$rootScope.authenticationState = function(token)
			{
				if (token === null)
				{
					flickr.removeToken();
					$rootScope.state.isAnonymous = true;
				}
				else
				{
					flickr.parseToken(token);

					$rootScope.state.userId = flickr.userId;
					$rootScope.state.userName = flickr.userName;

					console.log('$rootScope.state.userName: ', flickr.userId);
					
					$rootScope.state.isAnonymous = false;
					$rootScope.state.isConnecting = false;

					$rootScope.$broadcast('status', {
						message: 'Authenticated. Hi ' + flickr.userName + '!'
					});
				}
			};

			// This will read oauth_token from local storage if it exists, if not, it will
			// connect to the WebSocket service and notify a request for authentication URL.
			// After the URL is generated, we'll show it to the user. When returned, it will
			// return to the WebSocket service, which in return will return the answers.
			//Flickr.Authenticate();
    }]);

	downloadr.config(['$routeProvider',
		function ($routeProvider)
		{
			$routeProvider.when('/', {
				templateUrl: '/views/home.html',
				controller: 'HomeController'
			});
			$routeProvider.when('/about', {
				templateUrl: '/views/about.html',
				controller: 'AboutController'
			});
			$routeProvider.when('/login', {
				templateUrl: '/views/login.html',
				controller: 'LoginController'
			});
			$routeProvider.when('/logout', {
				templateUrl: '/views/logout.html',
				controller: 'LogoutController'
			});
			$routeProvider.when('/search', {
				templateUrl: '/views/search.html',
				controller: 'SearchController'
			});
			$routeProvider.when('/settings', {
				templateUrl: '/views/settings.html',
				controller: 'SettingsController'
			});
			$routeProvider.when('/profile', {
				templateUrl: '/views/profile.html',
				controller: 'ProfileController'
			});
			$routeProvider.when('/folder', {
				templateUrl: '/views/folder.html',
				controller: 'FolderController'
			});
			$routeProvider.when('/download', {
				templateUrl: '/views/download.html',
				controller: 'DownloadController'
			});
			$routeProvider.when('/debug', {
				templateUrl: '/views/debug.html',
				controller: 'DebugController'
			});
			$routeProvider.when('/tests', {
				templateUrl: '/views/tests.html',
				controller: 'TestController'
			});

			$routeProvider.otherwise({
				redirectTo: '/'
			});

    }]);

	downloadr.config(['$compileProvider',
		function ($compileProvider)
		{
			// This has to be done or else Angular will append "unsafe:" to URLs.
			//$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension|blob:chrome-extension):\//);
			$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|chrome-extension):/);

			//var oldWhiteList = $compileProvider.imgSrcSanitizationWhitelist();
			$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|chrome-extension):|data:image\//);

    }]);

})();



// Check whether new version is installed
/* Keeping for future use.
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});
*/