/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function() {

    var downloadr = angular.module('downloadr.services', []);

    downloadr.factory('settings', function() {

      var load = function()
      {
        chrome.storage.sync.get('settings', function(result){

          if (result.settings == null) // Checks null and undefined
          {
            return;
          }

          values = result;
          console.log('Settings loaded: ', values);
        });
      };

      var save = function()
      {
        chrome.storage.sync.set({'settings': values}, function() {
          console.log('Settings saved: ', values);
        });
      };

      var values = {
        photoSize: 'o',
        safe: '1',
        license: '',
        sort: 'relevance',
        view: 'large',
        background: true
      }

      // Before we return the service, we'll load the settings if they exists.
      load();

      return {
          values : values,
          load : load,
          save: save
      };

    });


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

    downloadr.factory('socket', function ($rootScope, config_socket_server) {

      console.log('connecting to socket server @ ', config_socket_server);
      var socket = io.connect(config_socket_server);

      socket.on('connect', function () {

        console.log('socket.io connected to service.');
        $rootScope.$broadcast('status', { message: 'Connected to service.' });
        socket.emit('message', { text : 'hello world from app!!!' });


      });

      return {
        on: function (eventName, callback) {
          socket.on(eventName, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          });
        },
        emit: function (eventName, data, callback) {
          socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          })
        }
      };
    });

    downloadr.service('flickr2', function ($rootScope) {

      var token = '';
      var secret = '';
      var userId = '';
      var userName = '';
      var fullName = '';

      var removeToken = function()
      {
        token = '';
        secret = '';
        userId = '';
        userName = '';
        fullName = '';
      }

      var parseToken = function(message)
      {
          token = message.oauthToken;
          secret = message.oauthTokenSecret;
          userId = message.userNsId;
          userName = message.userName;
          fullName = message.fullName;
      };

      var createMessage = function(method, args)
      {
          var message = {
            method: method,
            args: args,
            token: flickr.token,
            secret: flickr.secret
            };

          return message;
      };


    return {
        parseToken : parseToken,
        removeToken : removeToken,
        createMessage: createMessage
    };
  });

    downloadr.service('flickr', function ($rootScope) {

      var token = '';
      var secret = '';
      var userId = '';
      var userName = '';
      var fullName = '';

      var removeToken = function()
      {
        token = '';
        secret = '';
        userId = '';
        userName = '';
        fullName = '';
      }

      var parseToken = function(message)
      {
          token = message.oauthToken;
          secret = message.oauthTokenSecret;
          userId = message.userNsId;
          userName = message.userName;
          fullName = message.fullName;
      };

      var createMessage = function(method, args)
      {
          var message = {
            method: method,
            args: args,
            token: token,
            secret: secret
            };

        return message;
      };

    return {
        parseToken : parseToken,
        removeToken : removeToken,
        createMessage: createMessage
    };

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
    /*
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

        return Flickr;*/

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
