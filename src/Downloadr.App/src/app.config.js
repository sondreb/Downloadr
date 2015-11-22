'use strict';

// @ngInject
function Config($stateProvider, $locationProvider, $urlRouterProvider, localStorageServiceProvider) {

    localStorageServiceProvider
        .setPrefix('')
        .setStorageType('localStorage')
        .setNotify(true, true);

    //$locationProvider.html5Mode(true);

    $stateProvider
    .state('home', {
        url: '/home',
        controller: 'HomeController as home',
        templateUrl: 'views/home/home.html',
        title: 'Home'
    })
    .state('about', {
        url: '/about',
        controller: 'AboutController as about',
        templateUrl: 'views/about/about.html',
        title: 'About'
    })
    .state('search', {
        url: '/search/:text',
        controller: 'SearchController as search',
        templateUrl: 'views/search/search.html',
        title: 'Search'
    })
    .state('profile', {
        url: '/profile/:userId',
        controller: 'ProfileController as profile',
        templateUrl: 'views/profile/profile.html',
        title: 'Profile'
    })
    .state('login', {
        url: '/login',
        controller: 'LoginController as login',
        templateUrl: 'views/auth/login.html',
        title: 'Login'
    })
    .state('logout', {
        url: '/logout',
        controller: 'LogoutController as logout',
        templateUrl: 'views/auth/logout.html',
        title: 'Login'
    })
    .state('playground', {
        url: '/playground',
        controller: 'PlaygroundController as playground',
        templateUrl: 'views/playground/playground.html',
        title: 'Playground'
    })
    .state('favorites/apollo', {
        url: '/favorites/apollo',
        controller: 'ApolloController as apollo',
        templateUrl: 'views/favorites/apollo.html',
        title: 'Apollo Archive'
    })
    .state('folder', {
        url: '/folder',
        controller: 'FolderController as folder',
        templateUrl: 'views/folder/folder.html',
        title: 'Choose folder'
    })
    .state('download', {
        url: '/download',
        controller: 'DownloadController as download',
        templateUrl: 'views/download/download.html',
        title: 'Download'
    })
    .state('settings', {
        url: "/settings",
        templateUrl: "views/settings/settings.html",
        controller: 'SettingsController as settings'
    });

    $urlRouterProvider.otherwise('/home');

}

module.exports = Config;
