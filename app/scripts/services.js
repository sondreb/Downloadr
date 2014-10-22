/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function() {

    var downloadr = angular.module('downloadr.services', []);

    downloadr.factory('settings', ['$rootScope', '$timeout', function($rootScope, $timeout) {

      var load = function()
      {
        chrome.storage.sync.get('settings', function(result){

          if (result.settings == null || Object.keys(result.settings).length === 0) // Checks null and undefined
          {
            return;
          }

          var settings = result.settings;

          // When we load, we can't replace the whole "values" object, as that
          // will remove link between controllers and this service.
          values.safe = settings.safe;
          values.size = settings.size;
          values.sort = settings.sort;
          values.license = settings.license;
          values.view = settings.view;
          values.background = settings.background;

          console.log('Settings loaded: ', values);
          $scope.apply();

        });
      };

      var save = function()
      {
        chrome.storage.sync.set({'settings': values}, function() {
          console.log('Settings saved: ', values);
        });
      };

      var values = {
        safe: '1',
        size: 'o',
        sort: 'relevance',
        license: '1,2,3,4,5,6,7,8',
        view: 'large',
        background: true
      };

      // Before we return the service, we'll load the settings if they exists.
      load();

      return {
          values : values,
          load : load,
          save: save
      };

    }]);

    downloadr.factory('notify', function() {

/*
      var onNotifyShow = function() {
          console.log('notification was shown!');
      }
*/
      return function(id, type, title, body, callback, progress) {

          chrome.notifications.onClicked.addListener(function(id) {
            // Launch the local file browser at the target destination.
            callback(id);
          });

          var options = {
            type: type,
            title: title,
            message: body,
            iconUrl: 'img/icon_128.png',
            progress: progress
          };

          chrome.notifications.create(id, options, function(notificationId) {});

        /*
        var opt = {
          type: "progress",
          title: "Primary Title",
          message: "Primary message to display",
          progress: 42
        }

        chrome.notifications.create('status', opt, function(notificationId) {

          console.log('notification was shown!');

        });*/


/*
        var notification = new Notification(title, {
          body: body,
          notifyShow: onNotifyShow
        });
*/
        //notification.show();

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
