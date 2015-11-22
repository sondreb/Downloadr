'use strict';
// @ngInject
function LoginController($scope, $timeout, $state, $rootScope, $location, appSettings, userToken, $http, flickr, storage) {
    // Disable the overflow on the login page.
    $rootScope.noflow = true;
    //$scope.webViewSupported = true;
    $scope.title = 'Hello World';
    //console.log(window.navigator.standalone);
    $scope.loginView = document.getElementById("login_view");
    $scope.showView = true;

    $scope.getLoginUrl = function (ok, fail) {
        var url = appSettings.appHost + '/login/url';
        console.log('Calling HTTP Server... ', url);

        // When no token is found, we'll issue a command to get login url.
        $http.get(url).success(ok).error(fail);
    };

    $scope.onLoginUrl = function (data, status, headers, config) {
        console.log('Flickr auth URL: ', data.url);
        $scope.loginUrl = data.url;

        // Due to the following error when loading login URL inside the iframe:
        //Refused to display [url] in a frame because it set 'X-Frame-Options' to 'SAMEORIGIN'.
        // We will have to open the login URL in full screen on those devices that does not
        // support webview.
        //window.location.href = $scope.loginUrl;

        //console.log('opening login window...');
        //window.open($scope.loginUrl, "downloadr_login_window", "menubar=0,toolbar=0,resizable=1,width=860,height=550");
        
        // Set the source to be login URL.
        //console.log($scope.loginFrame.src);
        //console.log($scope.loginView.src);

        //$scope.loginFrame.src = $scope.loginUrl;
        $scope.loginView.src = $scope.loginUrl;

        $rootScope.$broadcast('status', {
            message: 'Loading Flickr.com for authorization...'
        });
    };

    $scope.onLoginUrlError = function (data, status, headers, config) {
        console.log('Unable to connect with server: ', status);

        $rootScope.$broadcast('status', {
            message: 'Service is unavailable. Please try again later. Code: ' + status
        });
    };

    // Call the login URL on root.
    $scope.getLoginUrl($scope.onLoginUrl, $scope.onLoginUrlError);

    var getParameterByName = function (url, name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(url);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    $scope.authenticated = function (oauth_token, oauth_verifier) {
        var url = appSettings.appHost + '/login/exchange';
        $http.post(url, { oauth_token: oauth_token, oauth_verifier: oauth_verifier }).success($scope.onAuthenticated).error($scope.onAuthenticatedError);
    };

    $scope.onAuthenticated = function (data, status, headers, config) {
        var message = data;

        // Save it using the Chrome extension storage API.
        // This will ensure the token is synced across devices.
        //storage.set('token', message, function () {
        //    // Notify that we saved.
        //    //message('Token saved');
        //    console.log('Token saved: ', message);
        //});

        $scope.authenticationState(message);
    };

    $scope.authenticationState = function (token) {
        if (token === null) {
            //flickr.removeToken();
            //$rootScope.state.isAnonymous = true;

            // Ensure we delete the buddy icon.
            //storage.removeLocal('buddyicon', function () { console.log('Buddy icon removed'); });
            //$rootScope.state.buddyIcon = 'images/buddyicon.gif';

        }
        else {
            console.log('Token: ', token);

            // Save the token in persistent storage. We won't store the pre-parsed token
            // since that was not done in v3.0, so to keep backwards compatability we
            // store the raw token from the auth handshake.
            storage.set('token', token);

            // Parse the token
            flickr.parseToken(token);

            $rootScope.$broadcast('authenticated');

            $state.transitionTo('home');

            //$rootScope.state.userId = flickr.state.userId;
            //$rootScope.state.userName = flickr.state.userName;

            //console.log('$rootScope.state.userName: ', flickr.state.userId);

            // Load or download the users buddy icon.
           // $rootScope.loadBuddyIcon();

            //$rootScope.state.isAnonymous = false;

            //$rootScope.state.statusMessage = 'Authorized. Hi ' + flickr.state.userName + '!';

            //$rootScope.$broadcast('status', {
            //    message: 'Authorized. Hi ' + flickr.state.userName + '!'
            //});
        }
    };

    $scope.onAuthenticatedError = function (data, status, headers, config) {
        console.log('Unable to connect with server: ', status);

        $rootScope.$broadcast('status', {
            message: 'Error: ' + status
        });
    };

    // Add a listener, to navigate back to home page when user
    // have successfully authorized the app.
    $scope.loginView.addEventListener('loadstop', function () {
        if ($scope.loginView.src.indexOf('oauth_verifier') > -1) {

            $scope.showView = false;

            console.log('navigating to home!');

            var oauth_token = getParameterByName($scope.loginView.src, 'oauth_token');
            var oauth_verifier = getParameterByName($scope.loginView.src, 'oauth_verifier');

            console.log('oauth_token: ', oauth_token);
            console.log('oauth_verifier: ', oauth_verifier);

            $timeout(function () {

                $scope.authenticated(oauth_token, oauth_verifier);

                // Notify the server so we can transform this token into
                // a proper access token the user can store permanently.
                //socket.emit('accessGranted', {
                //	oauth_token: oauth_token,
                //	oauth_verifier: oauth_verifier
                //})

                //$rootScope.state.isAnonymous = false;

                // Navigate to home.
                //$location.path('/#');
                // $state.transitionTo('home');

            }, 0);
        }

        console.log('webview loaded: ' + $scope.loginView.src);

        $rootScope.$broadcast('status', {
            message: 'Login to complete the authorization.'
        });
    });

    return $scope;
};

module.exports = LoginController;