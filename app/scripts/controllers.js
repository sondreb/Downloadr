/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

    var controllers = angular.module('downloadr.controllers', []);

    controllers.run(['$log', function($log) {

        $log.log('downloadr.controllers.run: ');

        /*
        $rootScope.$on("$routeChangeStart", function(event, next, current) {
          $rootScope.onLoading();
        });

        $rootScope.onLoading = function() {
          $rootScope.$safeApply(function() {
            $rootScope.loading = true;
            $rootScope.status = 'loading';
          },this);
        };

        $rootScope.onReady = function() {
          $rootScope.$safeApply(function() {
            $rootScope.loading = false;
            $rootScope.status = 'ready';
          },this);
        };*/

    }]);


    controllers.controller('StatusController', ['$scope', '$rootScope', 'socket', function ($scope, $rootScope, socket) {

      console.log('STATUS CONTROLLER!');

        $scope.message = 'Loading...';

        $scope.$on('status', function(event, args) {

          console.log('Status: ', args.message);
          $scope.message = args.message;

        });

        socket.on('status', function(message) {
          console.log('Status: ', message);
          $scope.message = message.text;

        });

    }]);

    controllers.controller('HomeController', ['$scope', '$rootScope', 'hotkeys', function ($scope, $rootScope, hotkeys) {

        $rootScope.state.background = 'wallpaper';

        hotkeys.add({
            combo: 's',
            description: 'Move selection up',
            callback: function() {
                $scope.credits = null;
            }
        });

        //$scope.state = { isLoggedIn: false };

    }]);

    controllers.controller('ProfileController', ['$scope', '$rootScope', function($scope, $rootScope){

        $scope.user = { displayName: 'Sondre' };

    }]);


    controllers.controller('AboutController', ['$scope', '$rootScope', 'hotkeys', function ($scope, $rootScope, hotkeys) {



        $rootScope.state.background = 'wallpaper-3';

        hotkeys.add({
            combo: 'ctrl+up',
            description: 'Move selection up',
            callback: function() {
                $scope.credits = null;
            }
        });

        hotkeys.add({
            combo: 's',
            description: 'Move selection up',
            callback: function() {
                $scope.credits = null;
            }
        });


        hotkeys.add({
            combo: 'ctrl+j',
            callback: function() {
                //alert('Easter Egg!');
            }
        });

        $scope.state = { isLoggedIn: false };


        $scope.credits = [
            { type: 'Developed', text: 'Sondre Bjellås', url: 'http://sondreb.com/' },
            { type: 'Icon', text: 'HADezign', url: 'http://hadezign.com/' },
            { type: 'Symbols', text: 'Font Awesome', url: 'http://fontawesome.io/' },
            { type: 'Image', text: 'Ossi Petruska', url: 'http://www.flickr.com/photos/10134557@N08/2527630813' },
            { type: 'Library', text: 'AngularJS', url: 'https://angularjs.org/' },
            { type: 'Library', text: 'AngularHotkeys.js', url: 'http://chieffancypants.github.io/angular-hotkeys/' },
            { type: 'Library', text: 'Mousetrap', url: 'http://craig.is/killing/mice/' },
            { type: 'Library', text: 'jQuery', url: 'https://jquery.org/' }
        ];
    }]);


    controllers.controller('LoginController', ['$scope', '$rootScope', '$location', 'socket', function ($scope, $rootScope, $location, socket) {

        $scope.user = { username: '', password: '' };

        console.log('Login URL', $rootScope.state.loginUrl);

        // Was unable to bind to the src attribute, so have to use DOM.
        var webview = document.querySelector('webview');

        // Set the source to be login URL.
        webview.src = $rootScope.state.loginUrl;

        var getParameterByName = function(url, name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(url);
            return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

        // Add a listener, to navigate back to home page when user
        // have successfully authorized the app.
        webview.addEventListener("loadstop", function () {

            if (webview.src.indexOf('oauth_verifier') > -1) {

              console.log('navigating to home!');

              var oauth_token = getParameterByName(webview.src, 'oauth_token');
              var oauth_verifier = getParameterByName(webview.src, 'oauth_verifier');

              $scope.$apply(function () {

                // Notify the server so we can transform this token into
                // a proper access token the user can store permanently.
                socket.emit('accessGranted', { oauth_token: oauth_token, oauth_verifier: oauth_verifier })

                $rootScope.state.isAnonymous = false;

                $rootScope.$broadcast('status', { message: 'Authenticated.' });

                // Navigate to home.
                $location.path('/#');
              });

            }

            console.log("webview loaded: " + webview.src);

        });

    }]);


controllers.controller('LogoutController', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {


    $scope.logout = function ()
    {
        console.log('Logout Command');

        $rootScope.$broadcast('Event:Logout');

        // Navigate to home.
        $location.path('/#');

        //flickr.DeleteToken();
        //$scope.authenticatingEvent(null);
    };

    $scope.back = function()
    {
      console.log('Go back!');

      // Navigate to home.
      $location.path('/#');

    }

    //$rootScope.state.background = 'wallpaper';
    //$scope.search = { text: '' };

}]);


    controllers.controller('SearchController', ['$scope', '$rootScope', '$location', '$http', '$timeout', 'socket', 'flickr', function ($scope, $rootScope, $location, $http, $timeout, socket, flickr) {

        //$scope.PLACEHOLDER_IMAGE = '/img/loading.gif';

        $rootScope.state.background = 'wallpaper-gray';
        $rootScope.state.showActions = true;
        $rootScope.state.actionTarget = 'folder';

        $rootScope.$on('Event:Search', function (event, data) {

          console.log('User did a new search...');
          $rootScope.state.searchText = data.value;
          $scope.performSearch($rootScope.state.searchText);

        });

        $scope.loadImage = function(item, callback) {
          var xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = function() {
            callback(window.webkitURL.createObjectURL(xhr.response), item);
          }
          xhr.open('GET', item.uri, true);
          xhr.send();
        };

        $scope.selectPhoto = function(photo)
        {
          if (photo.selected === true)
          {
            photo.selected = false;
          }
          else
          {
            photo.selected = true;
            $rootScope.state.selectedPhotos.push(photo);
          }

          $rootScope.$broadcast('Event:SelectedPhotosChanged', { photos: $rootScope.state.selectedPhotos });

          console.log('Select photo: ', photo);
        }

        //$scope.selectedPhotos = [];

        // for each image with no imageUrl, start a new loader
        $scope.loadImages = function() {

          var photos = $scope.photos;

          for (var i=0; i<photos.length; i++) {

            var item = photos[i];

            item.uri = item.getUrl('m');

            $scope.loadImage(item, function(blob_uri, originalItem) {

              $timeout(function() {

                console.log('BLOB: ', blob_uri);
                originalItem.url = blob_uri;

              }, 0);

/*
              $scope.$apply(function(scope) {

                  item.url = blob_uri;
                  console.log('BLOB: ', blob_uri);


                for (var k=0; k<scope.todos.length; k++) {
                  if (scope.todos[k].uri==requested_uri) {
                    scope.todos[k].imageUrl = blob_uri;
                  }
                }
              });*/

            });

            /*
            if (photo.imageUrl === PLACEHOLDER_IMAGE) {

              $scope.loadImage(todo.uri, function(blob_uri, requested_uri) {

                $scope.$apply(function(scope) {

                  for (var k=0; k<scope.todos.length; k++) {

                    if (scope.todos[k].uri==requested_uri) {

                      scope.todos[k].imageUrl = blob_uri;

                    }
                  }
                });

              });
            }
            */
          }
        };

        $scope.photos = [];

        // Register handler for callbacks of signing URLs.
        socket.on('urlSigned', function(message) {
          console.log('Signed URL callback: ', message);

          var url = 'https://' + message.hostname + message.path;
          console.log('FULL URL:', url);

          $http.post(url).success(function(data, status, headers, config) {
              // this callback will be called asynchronously
              // when the response is available
              console.log(data);
              console.log('HTTP Status: ', status);

              var list = data.photos.photo;

              // Could we perhaps use prototype instead of this silly loop?
              for (var i=0; i<list.length; i++) {
                  var item = list[i];
                  item.url = 'img/loading.gif';
                  item.selected = false;
                  item.getUrl = function(size)
                  {
                    return 'https://farm' + this.farm + '.staticflickr.com/' + this.server + '/' + this.id + '_' + this.secret + '_' + size + '.jpg';
                  };

                  item.getFileName = function(size)
                  {
                    return this.id + '_' + this.secret + '_' + size + '.jpg';
                  };
              }

              // Bind to the UI.
              $scope.photos = list;

              $scope.loadImages();

              // URL format: https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
              // Specification: https://www.flickr.com/services/api/misc.urls.html

            }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              console.log(data);
              console.log('HTTP Status: ', status);
            });

        });

        $scope.performSearch = function(searchTerm)
        {
            console.log('Performing search on: ', searchTerm);

            // Get a prepared message that includes token.
            //var message = flickr.createMessage('flickr.cameras.getBrandModels', {brand: 'Nikon'});
            var message = flickr.createMessage('flickr.photos.search', {text: searchTerm});
            console.log(message);
            socket.emit('signUrl', message);
        };


        $scope.init = function() {

          // This is first run, meaning user have probably performed search from
          // home view. Read the state and perform search now.
          $scope.performSearch($rootScope.state.searchText);

        };


        $scope.init();

    }]);



    controllers.controller('SettingsController', ['$scope', '$rootScope', 'storage', function ($scope, $rootScope, storage) {

        $rootScope.state.background = 'wallpaper-2';

       $scope.getAcceptLanguages = function() {
          chrome.i18n.getAcceptLanguages(function(languageList) {
            var languages = languageList.join(",");
            document.getElementById("languageSpan").innerHTML = languages;
          })
        };

        $scope.languages = [
            { key: 'en-US', value: 'English' },
            { key: 'nb-NO', value: 'Norwegian' },
        ];

        /* These will make properties available on the scope and auto-persist to local storage. */
        storage.bind($scope, 'language', 'en-US');
        storage.bind($scope, 'theme', 'dark');

    }]);


    controllers.controller('ActionsController', ['$scope', '$rootScope', function ($scope, $rootScope) {

      $scope.$on('Event:SelectedPhotosChanged', function(event, data) {

        console.log('Event:SelectedPhotosChanged: ', data);

        $scope.count = data.photos.length;

      });

      $scope.count = 0;

    }]);

    controllers.controller('DownloadController', ['$scope', '$rootScope', function ($scope, $rootScope) {

      $scope.$on('Event:SelectedPhotosChanged', function(event, data) {

        console.log('Event:SelectedPhotosChanged: ', data);

        $scope.count = data.photos.length;

      });

      $scope.count = 0;

    }]);

    controllers.controller('FolderController', ['$scope', '$rootScope', function ($scope, $rootScope) {

      $rootScope.state.actionTarget = 'download';
      $rootScope.state.showActions = true;

      /**
       * @param {string} File name.
       * @return {string} Sanitized File name.
       * Returns a sanitized version of a File Name.
       */
      $scope.sanitizeFileName = function(fileName) {
        return fileName.replace(/[^a-z0-9\-]/gi, ' ').substr(0, 50).trim();
      }


      /*
      var folder = document.getElementById('folderDialog');

      folder.addEventListener("change", function(event) {
        console.log('ON CHANGED!!!', event);
      });
      */

      //$scope.folderDialog = folder;
      $scope.count = 0;
      $scope.path = '';


      $scope.lastError = function()
      {
        console.log(chrome.runtime.lastError);

        var filePath = '~\\Pictures\\Flickr\\downloadr.jpg';

        chrome.fileSystem.getWritableEntry(filePath, function(writableFileEntry) {

          console.log('WRITEABLE!');

        });

        console.log('Last error completed');
      }

      function errorHandler(err)
      {
        console.log('ERROR!! : ', err);
        console.log('chrome.runtime.lastError: ', chrome.runtime.lastError);
      }

      $scope.loadImage = function(item, callback) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function() {
          //callback(window.webkitURL.createObjectURL(xhr.response), item);
          callback(xhr.response, item);
        }
        xhr.open('GET', item.getUrl('b'), true);
        xhr.send();
      };

      $scope.chooseFolder = function()
      {
          chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(entry) {

            // Small validation, perhaps not needed?
            if (entry.isDirectory !== true)
            {
                console.log('Selected path is not a directory. Aborts.');
                return;
            }

            var photo = $rootScope.state.selectedPhotos[0];

            $scope.loadImage(photo, function(blob_uri, originalItem) {

              console.log('blob_uri: ', blob_uri);

              entry.getFile(photo.getFileName('b'), {create: true, exclusive: true}, function(writableFileEntry) {

                console.log('FILE: ', writableFileEntry);

                writableFileEntry.createWriter(function(writer) {
                writer.onerror = errorHandler;
                writer.onwriteend = function(e) {
                  console.log('write complete');
                };

                writer.write(new Blob([blob_uri], {type: 'image/jpeg'}));
                //writer.write(new Blob(['1234567890'], {type: 'text/plain'}));

              }, errorHandler);


              }, function(err){ console.log(err);});


            });






          /*
            chrome.fileSystem.getWritableEntry(entry, function(writableFileEntry) {


              console.log('WRITEABLE: ', writableFileEntry);

            });*/

/*
            console.log(entry.createReader);
*/

            chrome.fileSystem.getDisplayPath(entry, function(path) {


                $scope.$apply(function () {

                    console.log("FULL PATH: ", path);
                    $rootScope.state.targetPath = path;
                    $scope.path = path;
                });


/*
              var filePath = path + "\\downloadr.jpg";

              console.log("filePath: ", filePath);

              function errorHandler()
              {
                console.log('ERROR!!!');

              }

              chrome.fileSystem.getWritableEntry(filePath, function(writableFileEntry) {

              console.log('YES!!!!');

                  writableFileEntry.createWriter(function(writer) {
                    writer.onerror = errorHandler;
                    writer.onwriteend = callback;

                  chosenFileEntry.file(function(file) {
                    writer.write(file);
                  });

                }, errorHandler);
              });
*/

/*
              chrome.fileSystem.getWritableEntry(filePath, function(entry) {

                console.log('WRITABLE: ', entry);
                console.log(chrome.runtime.lastError);

              });*/



            });

            console.log('DIALOG: ', entry);
            //console.log(chrome.runtime.lastError);

            /*
            chrome.fileSystem.getWritableEntry(chosenFileEntry, function(writableFileEntry) {
                writableFileEntry.createWriter(function(writer) {
                  writer.onerror = errorHandler;
                  writer.onwriteend = callback;

                chosenFileEntry.file(function(file) {
                  writer.write(file);
                });
              }, errorHandler);
            });*/

          });

      };

    }]);


    controllers.controller('DebugController', ['$scope', '$rootScope', 'hotkeys', function ($scope, $rootScope, hotkeys) {

        $rootScope.state.background = 'wallpaper-3';
        $scope.enableLogConsole = false;
        $scope.enableAllLicenses = false;

        hotkeys.add({
            combo: 's',
            description: 'Move selection up',
            callback: function() {
                $scope.credits = null;
            }
        });

    }]);


    controllers.controller('TestController', ['$scope', '$rootScope', 'hotkeys', function ($scope, $rootScope, hotkeys) {

        $scope.enableLogConsole = false;
        $scope.enableAllLicenses = false;

    }]);


    controllers.controller('ScreenController', ['$rootScope', '$scope', '$http', 'flickr', 'util', 'hotkeys', '$log', '$location', 'socket', function ($rootScope, $scope, $http, flickr, util, hotkeys, $log, $location, socket) {


/*
        $scope.activeLink = function(viewLocation)
        {
            return viewLocation == $location.path();
        };

        $rootScope.$on("$locationChangeStart", function(event, next, current) {

        });
*/



        /* Add a hotkey to display the debug menu option. */
        /*
        hotkeys.add({
            combo: 'ctrl+up',
            description: 'Move selection up',
            callback: function() {
                $scope.credits = null;
            }
        });*/

        $scope.$on('Event:NavigateBack', function () {
            $scope.goBack();
        });

        //$scope.$on('Event:Search', function (event, args) {
            //$scope.searchValue = args;
            //$scope.search();
        //});

        // Change the UI when user has authenticated.
        //$scope.$on('authenticating', function (event, token) {
        //    $scope.authenticatingEvent(token);
        //});

        //$scope.authenticatingEvent = function (token)
        //{
          //  $scope.isProfileLoading = false;

            //if (token === null)
            //{
              //  $scope.goHome();
                //return;
            //}

            //var apiUrl = 'http://api.flickr.com/services/rest/?method=';
            //var method = 'flickr.test.echo';
            //var apiKey = '519594a5d8ab2bb0e42d75d54d2bca87';
            //var query = '&user_id=32954227@N00&format=json&api_key=' + apiKey;

            //method = 'flickr.photos.search';

            //var url = "http://api.flickr.com/services/rest/?method=flickr.photos.search&user_id={user_id}&format=json&api_key=519594a5d8ab2bb0e42d75d54d2bca87";

            //url = util.format(url, { user_id: token.UserId });

            //console.log(url);

            // This happens from an event and therefore we need to run $apply to make the UI update.
            //$scope.$apply();

            //console.log('GO HOME!!!');

            // After user authenticates, we'll go back to the home screen.
            //$scope.goHome();

            //console.log(url);
            //console.log(flickr);
            //// Generate a signed URL.
            //flickr.GenerateUrl(url, function (signedUrl) {

            //    console.log("YES:" + signedUrl);

            //});


            // Retrieve the user profile.
            //var id = decodeURI(token.UserId);
            //console.log("WHEE!!!" + id);

            //$http.get(apiUrl + method + query).success(function (data) {

            //    // Remove the wrapper.
            //    data = data.replace('jsonFlickrApi(', '');
            //    data = data.replace(')', '');
            //    data = JSON.parse(data);

            //    console.log(data);
            //    $scope.parseProfile(data);

            //});
        //};

        // Change the UI when user has authenticated.
        /*
        $scope.$on('authenticated', function (event, token) {

            $log.info('User is authenticated.');

            $scope.isLoggedIn = true;

            // Retrieve the user profile.
            var id = decodeURI(token.UserId);

            flickr.people.getInfo(id, function(data)
            {
                $scope.parseProfile(data);

            });

        });*/

        $scope.parseProfile = function (data) {

            // Validate successfull results.
            if (data.stat !== 'ok')
            {
                console.log('Results not OK. Aborting parsing.');
                return;
            }

            console.log('Parsing...');

            var server = data.person.iconserver;
            var farm = data.person.iconfarm;
            var nsid = data.person.nsid;

            var buddyIconUrl = 'http://farm{icon-farm}.staticflickr.com/{icon-server}/buddyicons/{nsid}.jpg';

            var url = util.format(buddyIconUrl, { 'icon-farm': farm, 'icon-server': server, nsid: nsid});
            console.log(url);

            $scope.profileIconUrl = url;

            // Show the home screen when authentcation completed.
            $scope.goHome();

            if ($rootScope.state.packaged)
            {
                // This is done to support both FireFox and Chrome.
                //window.URL = window.URL || window.webkitURL;

                $http.get(url, { responseType: 'blob' }).success(function (blob) {

                    console.log('WHAT?!?!?!');

                    var img = document.getElementById('buddyIconImg');
                    img.src = window.URL.createObjectURL(blob);

                    // Write the blob to disk.
                    navigator.webkitPersistentStorage.requestQuota(
                      2048, //bytes of storage requested
                      function (availableBytes) {
                            console.log(availableBytes);
                        }
                    );

                    console.log('ONLINE: ' + navigator.onLine);

/*
                    var cs = new Chromestore([{ path: 'thumbs/users' },{ path: 'audio/wav', callback: function () { console.log('finished creating audio/wav folder tree') } }]);

                    cs.usedAndRemaining(function (used, remaining) {
                        console.log('Used bytes: ' + used);
                        console.log('Remaining bytes: ' + remaining);
                    });

                    cs.getFile('fileCreate.txt', { create: true, exclusive: true }, function (fileEntry) {
                        console.log('File created');
                    });*/

                    //Create Directory
                    /*cs.getDir('genres/action', { create: true }, function () {*/
                        //Create and write to file
                        /*cs.write('genres/action/media.mp4', 'video/mp4', 'aaa', { create: true });
                    });*/

                    //var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
                    //var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
                    /*
                    console.log('Retrieving data from ' + url);
                    cs.getAndWrite(url, 'user.jpg', 'image/jpeg', { create: true }, function () {
                        console.log('Write user thumb complete');
                    });*/

                    //webkitStorageInfo.requestQuota(
                    //  webkitStorageInfo.PERSISTENT,

                    //  1000, // amount of bytes you need

                    //  function (availableBytes) {
                    //      alert("Quota is available. Quota size: " + availableBytes);
                    //      // you can use the filesystem now
                    //  }
                    //);

                });


            }
            else
            {


                //var xhr = new XMLHttpRequest();
                //xhr.open('GET', url, true);
                //xhr.responseType = 'blob';

                //xhr.onload = function (e) {

                //    var img = document.getElementById('buddyIconImg');
                //    img.src = window.URL.createObjectURL(this.response);

                //};

                //xhr.send();


                //$http.get(url, { responseType: 'blob' }).success(function (blob) {

                //    console.log("WHAT?!?!?!");

                //    // Write the blob to disk.
                //    navigator.webkitPersistentStorage.requestQuota(
                //      2048, //bytes of storage requested
                //      function (availableBytes) {
                //          console.log(availableBytes);
                //      }
                //    );

                //    console.log("ONLINE: " + navigator.onLine);

                //    var cs = new Chromestore([{ path: 'thumbs/users' }, { path: 'audio/wav', callback: function () { console.log('finished creating audio/wav folder tree') } }]);

                //    cs.usedAndRemaining(function (used, remaining) {
                //        console.log("Used bytes: " + used);
                //        console.log("Remaining bytes: " + remaining);
                //    });

                //    cs.getFile('fileCreate.txt', { create: true, exclusive: true }, function (fileEntry) {
                //        console.log('File created');
                //    });

                //    //Create Directory
                //    cs.getDir('genres/action', { create: true }, function () {
                //        //Create and write to file
                //        cs.write('genres/action/media.mp4', 'video/mp4', 'aaa', { create: true });
                //    });

                //    //var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
                //    //var url = 'https://s3.amazonaws.com/lr-chaos/videos/encoded_files/000/000/548/original/Hands-Elegant-Road-04-22-13.mp4';
                //    console.log('Retrieving data from ' + url);
                //    cs.getAndWrite(url, 'user.jpg', 'image/jpeg', { create: true }, function () {
                //        console.log('Write user thumb complete');
                //    });

                //    //webkitStorageInfo.requestQuota(
                //    //  webkitStorageInfo.PERSISTENT,

                //    //  1000, // amount of bytes you need

                //    //  function (availableBytes) {
                //    //      alert("Quota is available. Quota size: " + availableBytes);
                //    //      // you can use the filesystem now
                //    //  }
                //    //);


                //    var img = document.getElementById('buddyIconImg');
                //    img.src = window.URL.createObjectURL(blob);

                //});



                //$('#buddyIconImg').attr('src', url);
            }
        };

        $scope.isProfileLoading = true;

        $scope.profileIconUrl = 'img/buddyicon.gif';

        //$rootScope.$on('event:login', function (event, data) {
        //    console.log("EVENT:LOGIN!");
        //    console.log(data);
        //});

        if ($rootScope.state.packaged)
        {
          // Make sure we read the initial state as well, since the app might startup as maximized.
            $scope.isMaximized = chrome.app.window.current().isMaximized();
        }
        else
        {
            $scope.isMaximized = false;
        }

        $scope.handleWindowEvents = function () {

            if ($rootScope.state.packaged)
            {
                // Happens when user uses the window bar or shortcuts to maximize.
                $scope.isMaximized = chrome.app.window.current().isMaximized();

                // This happens from an event and therefore we need to run $apply to make the UI update.
                $scope.$apply();
            }

        };

        if ($rootScope.state.packaged)
        {
            chrome.app.window.current().onMaximized.addListener($scope.handleWindowEvents);
            chrome.app.window.current().onMinimized.addListener($scope.handleWindowEvents);
            chrome.app.window.current().onRestored.addListener($scope.handleWindowEvents);
        }

        $scope.testView = function()
        {
            var url = chrome.extension.getURL('test.html');
            var webview = document.getElementById('debugView');
            webview.src = url;
            //webview.src = "./test.html";
        };

        $scope.debugView = function()
        {
            var webview = document.getElementById('debugView');
            webview.src = './debug.html';
        };

        $scope.minimize = function ()
        {
            chrome.app.window.current().minimize();
        };

        $scope.maximize = function () {
            chrome.app.window.current().maximize();
        };

        $scope.restore = function () {
            chrome.app.window.current().restore();
        };

        $scope.close = function () {
            window.close();
        };

        $scope.logout = function ()
        {

        };

        $scope.goBack = function ()
        {
            console.log('Going Back to: ' + $scope.previousScreen);
            $scope.changeScreen($scope.previousScreen);
        };

        $scope.goHome = function ()
        {
            //$scope.changeScreen('start');
        };

        $scope.search = function ()
        {
            console.log('Searching for: ' + $scope.searchValue);

            // This should probably be escaped/cleaned before applying to the URL?
            var searchValue = $scope.searchValue;

            var url = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&text=' + searchValue + '&format=json&api_key=519594a5d8ab2bb0e42d75d54d2bca87';

            console.log('Unsigned URL: ' + url);

            flickr.GenerateUrl(url, function (signedUrl) {

                console.log('Signed URL: ' + signedUrl);

            });

            $scope.changeScreen('search');
        };

        $scope.isDebug = false;

        $scope.searchValue = '';
        $scope.LoginTitle = 'LOGIN';

        $scope.DisplayName = 'sondreb';

        $scope.isLoggedIn = false;
        $scope.previousScreen = null;
        $scope.selectedScreen = '';

        $scope.isInitializing = true;

    }]);
})();

/*

function TodoCtrl($scope) {
    $scope.todos = [
      { text: 'learn angular', done: true },
      { text: 'build an angular Chrome packaged app', done: false }];

    $scope.addTodo = function () {
        $scope.todos.push({ text: $scope.todoText, done: false });
        $scope.todoText = '';
    };

    $scope.remaining = function () {
        var count = 0;
        angular.forEach($scope.todos, function (todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };

    $scope.archive = function () {
        var oldTodos = $scope.todos;
        $scope.todos = [];
        angular.forEach(oldTodos, function (todo) {
            if (!todo.done) $scope.todos.push(todo);
        });
    };
}

*/




/*

// Create the settings controller.
angular.module('downloadr').controller('SettingsController', function ($scope) {

    var resources = {
        connectionError: "Connection is in an invalid state, there is no transport active.",
        invalidState: "Invalid state."
    };

    $scope.defaultPath = '';
    $scope.backgroundImage = true;

    $scope.save = function () {

        if (!$rootScope.state.packaged) {
            localStorage['path'] = $scope.defaultPath;
            localStorage['background'] = $scope.backgroundImage;
        }
        else {
            chrome.storage.sync.set({ 'path': $scope.defaultPath }, function () {
                console.log('Path saved.');
            });

            chrome.storage.sync.set({ 'background': $scope.backgroundImage }, function () {
                console.log('backgroundImage saved.');
            });
        }

        console.log("Saving settings...");
    };

    $scope.initialize = function () {

        //console.log(sharedProperties.getString());

        var path = '';

        if (!$rootScope.state.packaged) {

            $scope.defaultPath = localStorage['path'];
        }
        else {

            // Is this async? Then the return value will probably be null.
            chrome.storage.sync.get('path', function (data) {
                $scope.defaultPath = data;
            });

        }
    }(); // Execute initialize
});

angular.module('downloadr').controller('SearchController', function ($scope) {

});

angular.module('downloadr').controller('LogoutController', function ($rootScope, $scope) {

    $scope.logout = function ()
    {
        console.log('Logout Command');
        $rootScope.$broadcast('Event:Logout');
    }

    $scope.back = function ()
    {
        console.log('Back Command');
        $rootScope.$broadcast('Event:NavigateBack');
    }
});

angular.module('downloadr').controller('HomeController', function ($rootScope, $scope) {

    $scope.isDropdownVisible = false;
    $scope.searchValue = "";

    $scope.search = function ()
    {
        $rootScope.$broadcast('Event:Search', $scope.searchValue);
    }

    $scope.dropDown = function ()
    {
        console.log("DROPDOWN!!");

        //$('.dropdown-options').css('opacity', 1);

        if ($scope.isDropdownVisible)
        {
            $scope.isDropdownVisible = false;
        }
        else
        {
            $scope.isDropdownVisible = true;
        }
    }

});

*/
