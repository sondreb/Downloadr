'use strict';

//var WinJS = require('winjs');

//WinJS.UI.processAll().done(function () {
//    //var splitView = document.querySelector(".splitView").winControl;
//    //new WinJS.UI._WinKeyboard(splitView.paneElement); // Temporary workaround: Draw keyboard focus visuals on NavBarCommands
//});

// @ngInject
function Run($rootScope, $state, appSettings, settings, userToken, storage, flickr, state) {

    // Load the user settings.
    settings.load();

    // Configure shortcut keys.
    Mousetrap.bind('ctrl+a', function (e) {
        console.log('command:select');
        $rootScope.$broadcast('command:select');
    });

    Mousetrap.bind('?', function (e) {
        console.log('command:shortcuts');
        $rootScope.$broadcast('command:shortcuts');
        $state.go('about');
    });

    Mousetrap.bind('ctrl+h', function (e) {
        console.log('command:home');
        $rootScope.$broadcast('command:home');
        $state.go('home');
    });

    Mousetrap.bind('ctrl+s', function (e) {
        console.log('command:search');
        $rootScope.$broadcast('command:search');
    });

    Mousetrap.bind('ctrl+i', function (e) {
        console.log('command:settings');
        $rootScope.$broadcast('command:settings');
        $state.go('settings');
    });

    Mousetrap.bind('f1', function (e) {
        console.log('command:help');
        $rootScope.$broadcast('command:help');
        $state.go('about');
    });

    Mousetrap.bind('alt+enter', function (e) {
        console.log('command:fullscreen');
        $rootScope.$broadcast('command:fullscreen');
    });

    // change page title based on state
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        state.previousState = fromState;

        // On each page navigation, we'll reset the noflow.
        $rootScope.noflow = false;

        //$rootScope.pageTitle = '';

        //if (toState.title) {
        //    $rootScope.pageTitle += toState.title;
        //    $rootScope.pageTitle += ' \u2014 ';
        //}

        //$rootScope.pageTitle += appSettings.appTitle;
    });

    storage.get('token', function (result) {

        if (result === undefined || result === null || result.token === undefined || result.token === null || Object.keys(result.token).length === 0) // Checks null and undefined
        {
            // User is not authenticated.
        }
        else {
            console.log('Token found:');
            console.log(result);

            userToken = result;

            // Parse the token
            flickr.parseToken(userToken.token);

            state.authenticated = true;

            $rootScope.$broadcast('authenticated');
        }
    });
}

module.exports = Run;
