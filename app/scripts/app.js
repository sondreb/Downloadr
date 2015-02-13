/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

// Remove logging for production use.
var console = {};
console.log = function(){};
window.console = console;


(function () {

	angular.module('lumx.search-filter').run(['$templateCache', function(a) { a.put('search-filter.html', '<div class="search-filter search-filter--{{ theme }}-theme"\n' +
    '     ng-class="{ \'search-filter--is-focused\': model,\n' +
    '                 \'search-filter--is-closed\': closed }">\n' +
    '    <div class="search-filter__container">\n' +
    '        <label class="search-filter__label" ng-click="$root.performSearch()"><i class="mdi mdi-magnify"></i></label>\n' +
    '        <input type="text" class="search-filter__input" placeholder="{{ placeholder }}" ng-enter="/search" ng-model="model">\n' +
    '        <span class="search-filter__cancel" ng-click="clear()"><i class="mdi mdi-close-circle"></i></span>\n' +
    '    </div>\n' +
    '</div>');
	 }]);

	// Create the app module and dependencies.
	var downloadr = angular.module('downloadr', [
        'ngRoute',
        'mousetrap',
        'infinite-scroll',
		'ngMaterial',
        'downloadr.filters',
        'downloadr.services',
        'downloadr.directives',
        'downloadr.controllers',
		'lumx'
    ]);
	
	var manifest = chrome.runtime.getManifest();
	
	downloadr.value('version', manifest.version);
	downloadr.value('author', 'Sondre Bjellås');
	downloadr.value('HOST', 'http://flickr-downloadr.com');
	//downloadr.value('HOST', 'http://localhost:3000');
	
	downloadr.run(['$rootScope', '$location', 'flickr', 'settings', 'notify', '$mdSidenav', '$http', 'HOST',
		function ($rootScope, $location, flickr, settings, notify, $mdSidenav, $http, HOST) {
			
			console.log('downloadr.run: ', flickr);

			var loadingStatus = { settings: false, runtime: false };
			
			var updateLoadingStatus = function() {

				console.log('updateLoadingStatus');
				
				$('body').addClass('loaded');
				
				// This ensures any data loaded in the async loading handlers is
				// updated in the UI.
				$rootScope.$apply();
				
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
				
				userName: '',
				
				firstRun: true,
				
				statusMessage: ''

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
			
			$rootScope.navigate = function(path)
			{

			};

			$rootScope.$on('$routeChangeStart', function (event, next, current) {

				var path = $location.path();

				// Whenever the user navigate, we'll hide the actions bar.
				// It will manually be re-enabled by controllers that use it.
				$rootScope.state.showActions = false;

				if (path === '/' || path === '') {
					$rootScope.state.showSearchControls = false;
					
					// If the user navigates back home, we'll clear the existing search value.
					$rootScope.state.searchText = '';
					
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
				
				// If the user have not entered anything, we won't search.
				if ($rootScope.state.searchText === null || 
					$rootScope.state.searchText === undefined || 
					$rootScope.state.searchText === '') {
					return;
				}
				
				
				// This is a major hack to fix the search-filter from LumX and hacking
				// it so it work properly for this app. The buggy behavior happens if the
				// user have already searched, then clicks the top search icon to prepare
				// for entering another new search, at that time, search is ran, while it
				// should not. Code kepts here for later bugfix.
				
				//var searchElement = $('#top-search').find('.search-filter');
				//console.log('width: ', searchElement.width());
				// Only navigate if the user have already expanded the search input element.
				//if (searchElement.width() != 40)
				//{
				//	$rootScope.performSearch();
				//}

				console.log('PERFORM SEARCH: ', $rootScope.state.searchText);

				// Navigate and load SearchController.
				$location.path('/search');
				
				// Raise the search event which the SearchController listens to.
				$rootScope.$broadcast('Event:Search', {
					value: $rootScope.state.searchText,
					clear: true
				});

			};

			$rootScope.$broadcast('status', {
				message: 'Starting...'
			});
			
			
			$rootScope.authenticated = function(oauth_token, oauth_verifier)
			{
				var url = HOST + '/login/exchange';
				
				$http.post(url, {oauth_token: oauth_token, oauth_verifier: oauth_verifier}).success($rootScope.onAuthenticated).error($rootScope.onAuthenticatedError);
			};
			
			$rootScope.onAuthenticated = function(data, status, headers, config)
			{
				var message = data;
				
				// Save it using the Chrome extension storage API.
				// This will ensure the token is synced across devices.
				chrome.storage.sync.set({
					'token': message
				}, function () {
					// Notify that we saved.
					message('Token saved');
				});

				$rootScope.authenticationState(message);
				
				console.log('YES!! ', message);
				
			};
			
			$rootScope.onAuthenticatedError = function(data, status, headers, config)
			{
				console.log('Unable to connect with server: ', status);
				
				$rootScope.$broadcast('status', {
					message: 'Error: ' + status
				});
			};
			
			$rootScope.getLoginUrl = function(ok, fail) {
				
				var url = HOST + '/login/url';
				console.log('Calling HTTP Server... ', url);

				// When no token is found, we'll issue a command to get login url.
				$http.get(url).success(ok).error(fail);
				
			};
			
			$rootScope.onLoginUrl = function(data, status, headers, config)
			{
				console.log('Flickr auth URL: ', data.url);

				$rootScope.state.loginUrl = data.url;
				$rootScope.$broadcast('status', {
					message: 'Ready.'
				});
			};
			
			$rootScope.onLoginUrlError = function(data, status, headers, config) {
				console.log('Unable to connect with server: ', status);
				
				$rootScope.$broadcast('status', {
					message: 'Error: ' + status
				});
			};

			$rootScope.$on('Event:Logout', function () {

				console.log('Logout Initialized...');
				
				chrome.storage.sync.set({
					'token': null
				}, function () {
					// Notify that we saved.
					console.log('Token removed');
				});
				
				$rootScope.authenticationState(null);
				
				$rootScope.$broadcast('status', {
					message: ''
				});
				
				// Make sure we get a new login url.
				//socket.emit('getUrl');
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

				if (result === undefined || result === null || result.token === undefined || result.token === null) {
					
					console.log('No existing token found.');
					
					// Retreive the login URL.
					//$rootScope.getLoginUrl($rootScope.onLoginUrl, $rootScope.onLoginUrlError);
					
					//socket.emit('getUrl');
					
				} else {
					
					$rootScope.authenticationState(result.token);
					
				}
			});

			// Whenever login URL is received, we will update the UI and enable
			// the login button.
			/*socket.on('url', function (message) {

				console.log('Flickr auth URL: ', message.url);

				$rootScope.state.loginUrl = message.url;
				$rootScope.state.isConnecting = false;
				$rootScope.$broadcast('status', {
					message: 'Connected.'
				});

			});*/

			// When we receive access token, make sure we store it permanently.
			/*
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

			});*/
			
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

					$rootScope.state.statusMessage = 'Authorized. Hi ' + flickr.userName + '!';
					
					$rootScope.$broadcast('status', {
						message: 'Authorized. Hi ' + flickr.userName + '!'
					});
				}
			};
    }]);

	downloadr.config(['$routeProvider', '$mdThemingProvider',
		function ($routeProvider, $mdThemingProvider)
		{
			 $mdThemingProvider.theme('cyan');
			
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