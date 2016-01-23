'use strict';
// @ngInject
function SearchController($scope, $rootScope, flickr, $state, state, $stateParams, userSettings, logger, selectionManager) {

    var log = logger.Create('SearchController');

    console.log(userSettings);

    $scope.flickr = flickr;
    $scope.state = state;
    $scope.profile = [];
    $scope.selectionManager = selectionManager;
    $scope.userSearchUrl = 'https://www.flickr.com/search/people/?username=' + $scope.text;
    $scope.text = $stateParams.text;
    $scope.selectedItem = null;
    $scope.selectedIndex = 0;
    $scope.winTabControl = null;
    $scope.userNotFound = '';
    $scope.foundUser = false;
    $scope.groupsNotFound = '';
    $scope.foundGroups = false;
    $scope.user = null;
    $scope.groups = [];
    $scope.license = '';

    $scope.licenseChanged = function () {
        console.log('LICENSE CHANGED');
        $rootScope.$broadcast('Event:Filter');
    };

    $scope.sortChanged = function () {
        console.log('LICENSE CHANGED');
        $rootScope.$broadcast('Event:Filter');
    };

    $scope.tabChanged = function () {
        $scope.selectedIndex = $scope.winTabControl.selectedIndex;
        $scope.selectedItem = $scope.winTabControl.selectedItem;

        if ($scope.selectedIndex == 1) {
            log.debug('Search for people:', $scope.text);
            $scope.searchPeople($scope.text);
        }

        if ($scope.selectedIndex == 2) {
            log.debug('Search for groups:', $scope.text);
            //$scope.searchGroups($scope.text);
        }

        $scope.onResizeTimer();
    };

    $scope.clearSelection = function () {
        log.debug('Clear selection');
        // Clear any selected items from the manager.
        selectionManager.clear();
    };

    $scope.searchPeople = function (text) {
        // The username returned from service is url encoded, so we'll need to convert.
        var query = flickr.createMessage('flickr.people.findByUsername', {
            username: text
        });

        flickr.query(query, findUserInfoSuccess, error);
    };

    $scope.moveNext = function () {
        log.debug('moveNext');
        $state.transitionTo('folder');
    };

    $scope.selectAll = function () {
        $rootScope.$broadcast('Event:SelectAll:Photostream');
    };

    $scope.selectAllAlbums = function () {
        $rootScope.$broadcast('Event:SelectAll:Albums');
    };

    $scope.searchGroups = function (text) {
        var query = flickr.createMessage('flickr.groups.search', {
            text: text
        });

        flickr.query(query, findGroupsSuccess, error);
    };

    $scope.queryPhotos = {
        method: 'flickr.photos.search',
        arguments: {
            text: $scope.text,
            safe_search: userSettings.safe,
            sort: userSettings.sort,
            license: userSettings.license,
            per_page: state.pageSize,
            extras: 'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        }
    };

    $scope.queryGroups = {
        method: 'flickr.groups.search',
        arguments: {
            text: $scope.text,
            //user_id: $scope.userId,
            //safe_search: userSettings.safe,
            //sort: userSettings.sort,
            //license: userSettings.license,
            per_page: state.pageSize
            //extras: 'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        }
    };

    function error(err) {
        log.error(err);
    };

    function findUserInfoSuccess(data) {
        if (data.ok) {
            console.log('findUserInfoSuccess: ', data);

            // Reset the list.
            //var list = $scope.profile;

            // When person, the items is not a list but singular.
            var person = data.items;
            $scope.user = person;
            $scope.foundUser = true;
        }
        else {
            log.info('Data from service:', data);
            $scope.userNotFound = data.message;
            $scope.foundUser = false;
            // Something bad happened, inform user.
        }
    };

     function findGroupsSuccess(data) {
        if (data.ok) {
            console.log('findGroupsSuccess: ', data);

            var groups = data.items;
            $scope.groups = groups;
        }
        else {
            log.info('Data from service:', data);
            $scope.groupsNotFound = data.message;
            //$scope.userNotFound = data.message;
            //$scope.foundUser = false;
            // Something bad happened, inform user.
        }
    };

    return $scope;
};

module.exports = SearchController;