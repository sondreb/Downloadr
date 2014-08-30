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

    downloadr.run(['$rootScope', function($rootScope)
    {
        console.log('downloadr.run: ');

        $rootScope.state = {

            isLoggedIn: false,

            // Used to see if we're running inside Chrome Packaged App.
            packaged: chrome.runtime !== undefined,

            background: 'wallpaper'

        };

        // This will read oauth_token from local storage if it exists, if not, it will
        // connect to the WebSocket service and notify a request for authentication URL.
        // After the URL is generated, we'll show it to the user. When returned, it will
        // return to the WebSocket service, which in return will return the answers.
        Flickr.Authenticate();
    }]);

    downloadr.config(['$routeProvider', function($routeProvider)
    {
        $routeProvider.when('/', { templateUrl: '/views/home.html', controller: 'HomeController' });
        $routeProvider.when('/about', { templateUrl: '/views/about.html', controller: 'AboutController' });
        $routeProvider.when('/login', { templateUrl: '/views/login.html', controller: 'LoginController' });
        $routeProvider.when('/logout', { templateUrl: '/views/logout.html', controller: 'LoginController' });
        $routeProvider.when('/search', { templateUrl: '/views/search.html', controller: 'SearchController' });
        $routeProvider.when('/settings', { templateUrl: '/views/settings.html', controller: 'SettingsController' });
        $routeProvider.when('/profile', { templateUrl: '/views/profile.html', controller: 'ProfileController' });
        $routeProvider.when('/debug', { templateUrl: '/views/debug.html', controller: 'DebugController' });
        $routeProvider.when('/tests', { templateUrl: '/views/tests.html', controller: 'TestController' });

        $routeProvider.otherwise({ redirectTo: '/' });

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
