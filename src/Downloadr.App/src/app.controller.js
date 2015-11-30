'use strict';

var $ = require('jquery');
var WinJS = require('winjs');

// @ngInject
function AppController($scope, $rootScope, $window, $state, $timeout, logger, userToken, userSettings, flickr, fileManager, storage, state) {

    var log = logger.Create('AppController');

    //var browser = browserInfo();
    //console.log(browser);
    //console.log('Navigator:');
    //console.log(navigator.onLine);

    $scope.$state = $state;

    $scope.userSettings = userSettings;
    $scope.splitViewElement = document.getElementById("splitView");
    $scope.authenticated = false;
    $scope.buddyIcon = '';
    $scope.state = state;
    $scope.searchText = '';
    $scope.flickr = flickr;
    $scope.isMenuOpen = false;
    $scope.closedDisplayMode = 'inline';  // inline/none
    $scope.openedDisplayMode = 'inline'; // inline/overlay

    $rootScope.$on('authenticated', function () {
        log.debug('User is authenticated.');
        $scope.authenticated = true;
        $scope.downloadBuddyIcon();
    });

    $rootScope.$on('settings:changed', function () {
        $scope.openedDisplayMode = userSettings.keepOpen ? 'inline' : 'overlay';
    });

    $rootScope.$on('logout', function () {
        log.debug('User logged out.');
        $scope.authenticated = false;
        state.buddyIcon = null;
    });

    $scope.canSearch = function () {
        return $scope.searchText.length > 0;
    };

    $scope.search = function () {
        if (!$scope.canSearch()) {
            return;
        }

        $state.transitionTo('search', { text: $scope.searchText });
    };

    $scope.loadBuddyIcon = function () {
        storage.getLocal('buddyicon', function (data) {
            if (data.buddyicon !== undefined && data.buddyicon !== null && Object.keys(data.buddyicon).length !== 0) {

                console.log('getLocal: buddyicon received');

                var savedDate = new Date(data.buddyicon.date);
                var numberOfDaysSinceDownloaded = $rootScope.getDaysBetweenDates(savedDate, new Date());

                // Set the buddy icon.
                $scope.buddyIcon = 'data:image/png;base64,' + data.buddyicon.base64;

                state.buddyIcon = $scope.buddyIcon;

                // Download the buddy icon if older than 14 days.
                if (numberOfDaysSinceDownloaded > 14) {
                    console.log('Download new buddyicon!');
                    $scope.downloadBuddyIcon();
                }
            }
            else {
                $scope.downloadBuddyIcon();
            }
        });
    };

    $scope.downloadBuddyIcon = function () {
        // The username returned from service is url encoded, so we'll need to convert.
        var query = flickr.createMessage('flickr.people.getInfo', {
            user_id: flickr.state.userId
        });

        flickr.query(query, function (data) {

            if (data.ok) {
                var person = data.items;

                var buddyUrl = 'https://farm' + person.iconfarm + '.staticflickr.com/' + person.iconserver + '/buddyicons/' + person.nsid + '.jpg'

                // Make sure the logged on person object is always availble in the app state.
                state.user = person;
                state.userId = person.id;

                console.log(state);

                state.buddyIconUrl = buddyUrl;

                fileManager.downloadAsText(buddyUrl, $scope.downloadedBuddyIcon);
            }
            else {
                console.log('Failed: ', data.message);
            }

        }, function () { console.log('Failed to query userInfo.') });
    };

    function addCSSRule(sheet, selector, rules, index) {
        if ("insertRule" in sheet) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        }
        else if ("addRule" in sheet) {
            sheet.addRule(selector, rules, index);
        }
    }

    $scope.downloadedBuddyIcon = function (base64, url) {
        // Set the buddy icon to be displayed.
        $scope.buddyIcon = 'data:image/png;base64,' + base64;

        // Make sure we store the buddy icon in the state.
        state.buddyIcon = $scope.buddyIcon;

        $scope.$apply();

        // We need to do UI processing for WinJS to make sure buddy icon is rendered.
        WinJS.UI.processAll().done(function () {
            //var splitView = document.querySelector(".splitView").winControl;
            //new WinJS.UI._WinKeyboard(splitView.paneElement); // Temporary workaround: Draw keyboard focus visuals on NavBarCommands

            var profileButton = document.getElementById('profileButton');
            //profileButton.winControl.icon = 'url("' + state.buddyIcon + '")';

            //$(profileButton).hover(function () {
            //    $(this).attr('data-content', 'bar');
            //});

            //addCSSRule(document.styleSheets[0], "header", "float: left");

            //var str = '<img src"' + state.buddyIcon + '" style="width:48px; height: 48px;">';
            //document.styleSheets[0].addRule('#profileButton:before', 'content: "' + str + '";');

            document.styleSheets[0].addRule('#profileButton', 'background-image: url("' + state.buddyIcon + '");');

        });

        // Save the buddy icon for later use.
        storage.setLocal({ buddyicon: { base64: base64, date: new Date().toISOString() } }, function () {
            console.log('Buddy icon saved successfully.');
        });
    };

    $scope.$watch('isMenuOpen', function () {
        //console.log('isMenuOpen changed!');
    });

    $scope.$watch('splitViewElement.queryText', function () {
        console.log('searchText changed!');
    });

    $scope.openMenu = function () {
        console.log('Open the menu!');
        $scope.isMenuOpen = true;
    };

    $scope.onResize = function () {

        console.log('onResize was called.');

        var heightValue = 0;

        var elements = ['.win-pivot-header-area', '.toolbar', '.footer'];

        console.log(elements.length);

        elements.forEach(function (selector) {
            var element = $(selector);

            console.log(element);

            if (element !== null && element.is(":visible")) {

                var height = element.height();

                if (height === 0) {
                    height = 48; // Happens when there are multiple toolbars in the DOM but only one visible.
                }

                heightValue += height;
            }

            // The toolbars are returned as array of items.
            //if (element.length > 1) {

            //    var i = 0;

            //    for (; element[i];) {

            //        // Select the toolbar element.
            //        var childElement = $(element[i]);

            //        // Check if visible and calculate.
            //        if (childElement !== null && childElement.is(":visible")) {
            //            heightValue += childElement.height();
            //        }

            //        i++;
            //    }
            //}
            //else {
            //    if (element !== null && element.is(":visible")) {
            //        heightValue += element.height();
            //    }
            //}
        });

        console.log('heightValue: ' + heightValue);

        $timeout(function () {
            //do something to update current scope based on the new innerWidth and let angular update the view.
            $('.win-pivot-item-content').height((window.innerHeight - heightValue) + 'px');

            // This is a fix for IE/Edge
            $('.win-pivot-surface').height((window.innerHeight - heightValue) + 'px');
        });

        if (window.innerWidth < 500 && $scope.closedDisplayMode == 'inline') {
            $timeout(function () {
                //do something to update current scope based on the new innerWidth and let angular update the view.
                $scope.closedDisplayMode = 'none';
                $scope.openedDisplayMode = 'overlay';
            });
        }
        else if (window.innerWidth > 500 && $scope.closedDisplayMode == 'none') {
            $timeout(function () {
                //do something to update current scope based on the new innerWidth and let angular update the view.
                $scope.closedDisplayMode = 'inline';
                $scope.openedDisplayMode = userSettings.keepOpen ? 'inline' : 'overlay';
            });
        }

    };

    // Add handler to window resize.
    $(window).resize($scope.onResize);

    // Resize on state change start.
    //$rootScope.$on('$stateChangeStart', $scope.onResize);

    // Make sure we calculate heights upon loading.
    $scope.$on('$viewContentLoaded', function () {
        console.log('$viewContentLoaded within app.controller.js');
        $scope.onResize();
    });

    // Default tab change handler, can be overriden by individual pages, which
    // should then call onResizeTimer when done.
    $scope.tabChanged = function () {
        $scope.onResizeTimer();
    };

    // Called by onChange tab handlers on individual pages.
    $scope.onResizeTimer = function () {
        // Don't call resize until next digest, cause index change will hide/show different toolbars.
        $timeout(function () {
            // Call the AppController's onResize method on each tab change.
            $scope.onResize();
        }, 0);
    };

    // We'll simply set loaded to true at this time. Consider looking into doing this whenever settings or something is loaded.
    $scope.loaded = true;

    return $scope;
};

module.exports = AppController;