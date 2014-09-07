/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function() {

    var downloadr = angular.module('downloadr.services', []);

    downloadr.factory('searchProvider', function($location, $timeout)
    {
      var service = {};

      service.performSearch = function()
      {
        console.log("PERFORM SEARCH!!!");


      }
      
      service.searchText = 'Hello World';

      return service;
    });

    downloadr.service('util', function ()
    {
        this.format = function (text, params) {
            var str = text.replace(/\{(.*?)\}/g, function (i, match) {
                return params[match];
            });

            return str;
        };
    });

    downloadr.service('flickr', function ($rootScope) {

    //$scope.format = function (text, params) {
    //    var str = text.replace(/\{(.*?)\}/g, function (i, match) {
    //        return params[match];
    //    });

    //    return str;
    //}

    //$scope.deleteToken = function ()
    //{
    //    Flickr.DeleteToken();
    //}

    // Event that is raised when authentication is fully complete and secure oauth calls
    // can be done against the Flickr API.
        Flickr.OnAuthenticated = function (token) {

            console.log('Flickr:OnAuthenticated');
            console.log(token);

            var webview = document.querySelector('webview');

            $(webview).hide();

            $rootScope.$broadcast('authenticated', token);
        };

        // Event that is raised which should load URL to get users permission.
        Flickr.OnAuthenticating = function (url) {
            console.log('Flickr:OnAuthenticating: ' + url);

            //$('#loginUrlView').html(url);

            if ($rootScope.state.packaged) {

                //var webview = document.querySelector('webview');
                var webview = document.getElementById('browserView');
                webview.src = url;
                webview.addEventListener('loadstop', function () {

                    console.log('LOADSTOP: ' + webview.src);

                });

                //$('#myModal').modal({ show: true })
            }
            else {
                window.open(url, '_blank');
            }

            $rootScope.$broadcast('authenticating', url);
        };

        return Flickr;

    });
})();



// Register the utility service.
//angular.module('downloadr').service('utility', function ($scope) {

//    $scope.format = function (text, params) {
//        var str = text.replace(/\{(.*?)\}/g, function (i, match) {
//            return params[match];
//        });

//        return str;
//    }
//});
