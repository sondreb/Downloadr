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
        'cfp.hotkeys',
        'downloadr.filters',
        'downloadr.services',
        'downloadr.directives',
        'downloadr.controllers'
    ]);

    downloadr.value('version', '3.0');
    downloadr.value('author', 'Sondre Bjellås');
    downloadr.value('config_socket_server', 'http://downloadr.azurewebsites.net:5000');

    downloadr.run(['$rootScope', '$location', 'searchProvider', 'socket', 'flickr', 'settings', function($rootScope, $location, searchProvider, socket, flickr, settings)
    {
        console.log('downloadr.run: ', flickr);

        // i18n example:
        var resourceText = chrome.i18n.getMessage("settings_title");

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

            debug: false,

            photoSize: 'o'

        };

        $rootScope.$on("$routeChangeStart", function (event, next, current) {

          var path = $location.path();

          // Whenever the user navigate, we'll hide the actions bar.
          // It will manually be re-enabled by controllers that use it.
          $rootScope.state.showActions = false;

          if (path == "/" || path == "")
          {
            $rootScope.state.isOnStartScreen = true;
          }
          else
          {
            $rootScope.state.isOnStartScreen = false;
          }

        });

        $rootScope.performSearch = function(){


          if ($rootScope.state.searchText === null || $rootScope.state.searchText === '')
          {
            $rootScope.state.searchText = 'Kittens';
          }

          console.log('CLICK PERFORM SEARCH: ', $rootScope.state.searchText);

          $rootScope.$broadcast('Event:Search', { value: $rootScope.state.searchText });

        };


        $rootScope.$broadcast('status', { message: 'Starting...' });

        // Whenever the search directive raises the search event,
        // we'll update the rootScope.state.
        /*$rootScope.$on('Event:Search', function (event, data) {

          $rootScope.state.searchText = data.value;

        });*/


        //$rootScope.$broadcast('Event:Search', { value: 'Sweeet' });

        $rootScope.$on('Event:Logout', function () {

            console.log('Logout Initialized...');

            chrome.storage.sync.set({'token': null}, function() {
              // Notify that we saved.
              message('Settings saved');
            });

            flickr.removeToken();

            $rootScope.state.isAnonymous = true;
            //$rootScope.state.isConnecting = true;

            // Make sure we get a new login url.
            socket.emit('getUrl');

            //$scope.authenticatingEvent(null);
        });

        // Make sure we listen to whenever the local storage value have changed.
        chrome.storage.onChanged.addListener(function(changes, namespace) {
              for (key in changes) {
                var storageChange = changes[key];
                console.log('Storage key "%s" in namespace "%s" changed. ' +
                            'Old value was "%s", new value is "%s".',
                            key,
                            namespace,
                            storageChange.oldValue,
                            storageChange.newValue);

                if (key == 'token')
                {
                  //flickr.parseToken(storageChange.newValue);
                }
              }
        });

        // Try to find existing token.
        chrome.storage.sync.get('token', function(result){

          if (result === undefined || result === null)
          {
            console.log('No existing token found.');

            // When no token is found, we'll issue a command to get login url.
            socket.emit('getUrl');
          }
          else if (result.token === undefined || result.token === null)
          {
            console.log('No existing token found.');

            // When no token is found, we'll issue a command to get login url.
            socket.emit('getUrl');
          }
          else
          {
            console.log('Found in local storage: ', result.token);
            flickr.parseToken(result.token);
            $rootScope.state.isAnonymous = false;
            $rootScope.state.isConnecting = false;
            $rootScope.$broadcast('status', { message: 'Authenticated. Hi ' + result.token.userName + '!' });
          }
        });

        // Whenever login URL is received, we will update the UI and enable
        // the login button.
        socket.on('url', function(message) {

          console.log('Flickr auth URL: ', message.url);

          $rootScope.state.loginUrl = message.url;
          $rootScope.state.isConnecting = false;
          $rootScope.$broadcast('status', { message: 'Connected.' });

        });

        // When we receive access token, make sure we store it permanently.
        socket.on('token', function(message) {

          // Save it using the Chrome extension storage API.
          // This will ensure the token is synced across devices.
          chrome.storage.sync.set({'token': message}, function() {
            // Notify that we saved.
            message('Settings saved');
          });

          console.log('Received Access Token: ', message);
          flickr.parseToken(message);

          $rootScope.state.isAnonymous = false;
          $rootScope.$broadcast('status', { message: 'Authenticated. Hi ' + message.userName + '!' });

        });

        // This will read oauth_token from local storage if it exists, if not, it will
        // connect to the WebSocket service and notify a request for authentication URL.
        // After the URL is generated, we'll show it to the user. When returned, it will
        // return to the WebSocket service, which in return will return the answers.
        //Flickr.Authenticate();
    }]);

    downloadr.config(['$routeProvider', function($routeProvider)
    {
        $routeProvider.when('/', { templateUrl: '/views/home.html', controller: 'HomeController' });
        $routeProvider.when('/about', { templateUrl: '/views/about.html', controller: 'AboutController' });
        $routeProvider.when('/login', { templateUrl: '/views/login.html', controller: 'LoginController' });
        $routeProvider.when('/logout', { templateUrl: '/views/logout.html', controller: 'LogoutController' });
        $routeProvider.when('/search', { templateUrl: '/views/search.html', controller: 'SearchController' });
        $routeProvider.when('/settings', { templateUrl: '/views/settings.html', controller: 'SettingsController' });
        $routeProvider.when('/profile', { templateUrl: '/views/profile.html', controller: 'ProfileController' });
        $routeProvider.when('/folder', { templateUrl: '/views/folder.html', controller: 'FolderController' });
        $routeProvider.when('/download', { templateUrl: '/views/download.html', controller: 'DownloadController' });
        $routeProvider.when('/debug', { templateUrl: '/views/debug.html', controller: 'DebugController' });
        $routeProvider.when('/tests', { templateUrl: '/views/tests.html', controller: 'TestController' });

        $routeProvider.otherwise({ redirectTo: '/' });

    }]);

    downloadr.config( ['$compileProvider', function($compileProvider)
    {
      // This has to be done or else Angular will append "unsafe:" to URLs.
      //$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome‌​-extension|blob:chrome-extension):\//);
      $compileProvider.aHrefSanitizationWhitelist (/^\s*(https?|ftp|mailto|file|tel|chrome-extension):/);

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
