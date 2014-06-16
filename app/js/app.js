/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */
 
// Used to see if we're running inside Chrome Packaged App.
var _packaged = (window.chrome && chrome.runtime && chrome.runtime.id);


(function () {

    // Create the app module and dependencies.
    var downloadr = angular.module('downloadr', [
        'ngRoute',
        'cfp.hotkeys',
        'downloadr.filters',
        'downloadr.services',
        'downloadr.directives',
        'downloadr.controllers']);

    downloadr.value('version', '3.0');
    downloadr.value('author', 'Sondre Bjellås');
    
    downloadr.run(['$rootScope', function($rootScope)
    {
        console.log("downloadr.run: ");

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
        $routeProvider.when('/search', { templateUrl: '/views/search.html', controller: 'SearchController' });
        $routeProvider.when('/settings', { templateUrl: '/views/settings.html', controller: 'SettingsController' });
        $routeProvider.when('/debug', { templateUrl: '/views/debug.html', controller: 'DebugController' });

        $routeProvider.otherwise({ redirectTo: '/' });

    }]);

})();
