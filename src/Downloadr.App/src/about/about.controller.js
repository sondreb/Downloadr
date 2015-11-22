'use strict';
// @ngInject
function AboutController($scope, licenses, $timeout) {

    $scope.licenses = licenses;

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
        //{
        //    type: 'Symbols',
        //    text: 'Font Awesome',
        //    url: 'http://fontawesome.io/'
        //},
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
            text: 'WinJS',
            url: 'http://www.buildwinjs.com/'
        },
        {
            type: 'Library',
            text: 'angular-local-storage',
            url: 'https://github.com/grevory/angular-local-storage'
        },
        {
            type: 'Library',
            text: 'angular-busy',
            url: 'https://github.com/cgross/angular-busy'
        },
        {
            type: 'Library',
            text: 'mousetrap',
            url: 'https://craig.is/killing/mice'
        },
        {
            type: 'Library',
            text: 'browser-info',
            url: 'https://github.com/stevelacy/browser-info'
        },
        {
            type: 'Library',
            text: 'base64-js',
            url: 'https://github.com/beatgammit/base64-js'
        }

    ];

    return $scope;
};

module.exports = AboutController;