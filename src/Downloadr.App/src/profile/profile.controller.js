'use strict';
// @ngInject
function ProfileController($scope, $rootScope, flickr, $state, state, $stateParams, $timeout, licenses, userSettings, logger, downloadManager) {
    
    var log = logger.Create('ProfileController');

    var userId = $stateParams.userId;

    $scope.licenses = licenses;
    $scope.flickr = flickr;
    $scope.state = state;
    $scope.profile = [];
    $scope.selections = {};
    $scope.downloadManager = downloadManager;
    $scope.userId = userId;
    $scope.isCurrentUser = false;
    $scope.winMenuControl = null;
    $scope.selectedItem = null;
    $scope.selectedIndex = 0;
    $scope.winTabControl = null;

    $scope.showSortMenu = function (source) {
        $scope.winMenuControl.show(source, 'top');
    };

    $scope.tabChanged = function () {
        $scope.selectedIndex = $scope.winTabControl.selectedIndex;
        $scope.selectedItem = $scope.winTabControl.selectedItem;

        $scope.onResizeTimer();
    };

    $scope.clearSelection = function () {
        log.debug('Clear selection');
        // Clear any selected items from the manager.
        downloadManager.clear();
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

    $scope.selectAllFavorites = function () {
        $rootScope.$broadcast('Event:SelectAll:Favorites');
    };

    $scope.selectAllGalleries = function () {
        $rootScope.$broadcast('Event:SelectAll:Galleries');
    };

    // When the view is loaded, we'll start getting the data.
    $scope.$on('$viewContentLoaded', function () {
        log.debug('state:', state);

        //var photostreamElement = document.getElementById('photostreamGallery');
        //log.debug(photostreamElement);

        if (state.user && state.user.id === userId) {
            console.log('Display user profile.');
            $scope.isCurrentUser = true;
            $scope.populateProfile(state.user);
        }
        else {
            console.log('Load user: ' + userId);
            $scope.findProfile();
        }
    });

    if (state.authenticated) {
        $scope.queryPhotos = {
            method: 'flickr.people.getPhotos',
            arguments: {
                user_id: $scope.userId,
                safe_search: userSettings.safe,
                license: userSettings.license,
                per_page: state.pageSize,
                extras: 'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
            }
        };
    } else {
        $scope.queryPhotos = {
            method: 'flickr.people.getPublicPhotos',
            arguments: {
                user_id: $scope.userId,
                safe_search: userSettings.safe,
                license: userSettings.license,
                per_page: state.pageSize,
                extras: 'usage, description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
            }
        };
    }

    $scope.queryAlbums = {
        method: 'flickr.photosets.getList',
        arguments: {
            user_id: $scope.userId,
            safe_search: userSettings.safe,
            per_page: state.pageSize,
            primary_photo_extras: 'license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        }
    };

    $scope.queryFavorites = {
        method: 'flickr.favorites.getList',
        arguments: {
            user_id: $scope.userId,
            per_page: state.pageSize,
            extras: 'description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        }
    };

    $scope.queryGalleries = {
        method: 'flickr.galleries.getList',
        arguments: {
            user_id: $scope.userId,
            per_page: state.pageSizeGalleries,
            page: '' + $scope.galleriesPage + '',
            primary_photo_extras: 'date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o'
        }
    };

    $scope.findProfile = function () {
        // Receives 401 error from this call, look into later: https://www.flickr.com/services/api/flickr.stats.getTotalViews.html	
        //var query = flickr.createMessage('flickr.stats.getTotalViews', {});
        //console.log('Sign URL message: ', query);
        //flickr.query(query, $scope.findProfileSuccess, $scope.requestError);

        // The username returned from service is url encoded, so we'll need to convert.
        var query = flickr.createMessage('flickr.people.getInfo', {
            user_id: $scope.userId
        });

        flickr.query(query, $scope.findUserInfoSuccess, $scope.error);
    };

    $scope.error = function (err) {
        log.error('Failure to query...', err);
        debugger;
    };

    $scope.findUserInfoSuccess = function (data) {
        if (data.ok) {
            console.log('findUserInfoSuccess: ', data);

            // When person, the items is not a list but singular.
            var person = data.items;

            // TODO: Keep a copy of the total count for this user. This is needed to download all the user's photos
            // when this functionality is added in a future release.
            var photoCount = person.photos.count._content;

            $scope.populateProfile(person);
        }
        else {
            // Something bad happened, inform user.
        }
    };

    $scope.populateProfile = function (person) {
        // Reset the profile.
        $scope.profile = [];

        // Make a reference to the profile which we populate.
        var list = $scope.profile;

        console.log(person);

        $scope.buddyIcon = 'https://farm' + person.iconfarm + '.staticflickr.com/' + person.iconserver + '/buddyicons/' + person.nsid + '.jpg';
        $scope.buddyIconLarge = 'https://farm' + person.iconfarm + '.staticflickr.com/' + person.iconserver + '/buddyicons/' + person.nsid + '_r.jpg'

        // If user ID is Apollo Archive, the generated buddy icon URL is wrong.
        if (person.nsid == '136485307@N06') {
            $scope.buddyIcon = 'http://c1.staticflickr.com/1/685/buddyicons/136485307@N06.jpg';
            $scope.buddyIconLarge = 'http://c1.staticflickr.com/1/685/buddyicons/136485307@N06_l.jpg';
        }

        $scope.name = (person.realname._content !== '') ? person.realname._content : person.username._content;
        $scope.username = person.username._content;

        //list.push({ key: 'Name', value: person.realname._content });
        list.push({ key: 'Username', value: person.username._content });
        //list.push({ key: 'User Id', value: person.nsid });
        list.push({ key: 'Location', value: person.location ? person.location._content : '' });
        list.push({ key: 'Photos', value: person.photos.count._content });

        if (person.photos.views !== undefined) {
            list.push({ key: 'Views', value: person.photos.views._content });
        }

        var joinedDate = new Date(person.photos.firstdate._content * 1000).toDateString();

        list.push({ key: 'Joined', value: joinedDate });
        list.push({ key: 'Oldest Photo', value: person.photos.firstdatetaken._content });
        list.push({ key: 'Profile', value: person.profileurl._content, isLink: true });
        list.push({ key: 'Photos', value: person.photosurl._content, isLink: true });

        var proAccount = (person.ispro === 1) ? 'true' : 'false';
        list.push({ key: 'Pro Account', value: proAccount });

        if (person.timezone !== undefined) {
            list.push({ key: 'Timezone', value: person.timezone.label });
        }

        list.push({ key: 'Description', value: person.description._content });
    };

    return $scope;
};

module.exports = ProfileController;