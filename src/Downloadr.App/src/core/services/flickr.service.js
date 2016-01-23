'use strict';
// @ngInject
function FlickrApi($rootScope, $http, $q, appSettings, userToken, storage, logger) {

    var log = logger.Create('FlickrService');

    var state = {
        token: '',
        secret: '',
        userId: '',
        userName: '',
        fullName: ''
    };

    var removeToken = function () {
        state.token = '';
        state.secret = '';
        state.userId = '';
        state.userName = '';
        state.fullName = '';
    };

    var parseToken = function (token) {

        console.log('PARSING TOKEN: ', token);

        state.token = token.oauthToken;
        state.secret = token.oauthTokenSecret;
        state.userId = token.userNsId.replace('%40', '@');
        state.userName = token.userName;
        state.fullName = token.fullName;

    };

    var sortList = {
        'date-posted-desc': 'Date uploaded',
        'date-taken-desc': 'Date taken',
        'interestingness-desc': 'Interesting',
        'relevance': 'Relevant'
    };

    var createMessage = function (method, args) {
        var message = {
            method: method,
            args: args,
            token: state.token,
            secret: state.secret
        };

        return message;
    };

    var signUrl = function (path, query, ok, fail) {
        var url = appSettings.appHost + path;

        // We'll support a specified callback or broadcast.
        if (ok === undefined || ok === null) {
            ok = onUrlSigned
        }

        var request = {
            method: 'POST',
            url: url,
            data: query,
            cache: false
        };

        return $http(request).success(ok).error(fail);
    };

    var queryService = function (message, ok, fail) {
        var url = 'https://' + message.hostname + message.path;

        console.log('Query URL: ', url);
        console.log('Query Data: ', message);

        return $http.post(url).success(ok).error(fail);
    };

    // If the search contains user id in query, we'll store it in this property for links generation and more.
    var queryUserId = null;

    var signAndQuery = function (query, ok, fail) {

        console.log('flickr: signAndQuery');

        // Construct the URL to sign queries.
        var url = appSettings.appHost + '/sign';

        var request = {
            method: 'POST',
            url: url,
            data: query,
            cache: false
        };

        // Remember the user ID, if specified in the query.
        queryUserId = (request.data.user_id !== undefined) ? request.data.user_id : null;

        return $http(request).success(function (data, status, headers, config) {

            queryService(data, function (result) {

                console.log('queryService: ', result);

                if (result.stat !== "ok") {

                    log.info('Result from Flickr is not OK.', result);
                    //throw new Exception('Result from Flickr Service is not OK: ' + result.message);

                    // Return the failed results to caller.
                    ok(result);

                    return;
                }

                // This method processes the results to make them unified for binding and other operations.
                var items = [];
                var container = null;
                var itemType = '';
                var userId = null;

                if (result.photos !== undefined) {
                    container = result.photos;
                    items = result.photos.photo;
                    itemType = 'photo';
                }
                else if (result.photoset !== undefined) // When user have selected album for downloading, the query will return a single photoset.
                {
                    container = result.photoset;
                    items = result.photoset.photo;
                    userId = result.photoset.owner;
                    itemType = 'photo';
                }
                else if (result.groups !== undefined) {
                    container = result.groups;
                    items = result.groups.group;
                    itemType = 'group';
                }
                else if (result.galleries !== undefined) {
                    container = result.galleries;
                    items = result.galleries.gallery;
                    itemType = 'gallery';
                }
                else if (result.photosets !== undefined) {
                    container = result.photosets;
                    items = result.photosets.photoset;
                    itemType = 'photoset';
                }
                else if (result.person !== undefined) {
                    container = result.person;
                    items = result.person;
                    itemType = 'person';
                    userId = result.person.id;

                    container.page = 1;
                    container.pages = 1;
                    container.per_page = 1;
                    container.total = 1;

                }
                else if (result.user !== undefined) {
                    container = result.user;
                    items = result.user;
                    itemType = 'user';
                    userId = result.user.id;

                    container.page = 1;
                    container.pages = 1;
                    container.per_page = 1;
                    container.total = 1;
                }
                else {
                    throw new Exception('Unable to parse results.');
                }

                if (userId === null) {
                    userId = container.user_id;
                }

                debugger;

                if (itemType !== 'person' && itemType !== 'user') {
                    items.forEach(function (item) {

                        debugger;

                        // Groups have .name, others don't.
                        if (item.name == null) {
                            item.name = (item.title._content !== undefined) ? item.title._content : item.title;
                        }

                        if (itemType === 'photoset') {
                            item.link = getUrl(itemType, item.primary_photo_extras.pathalias, item.id);
                            item.count = parseInt(item.photos);
                            item.url = item.primary_photo_extras.url_m;
                            item.can_download = 1;
                        }
                        else if (itemType === 'gallery') {
                            var id = item.id.split('-')[1]; // For galleries, the format is "1484401-72157649041530344". We need last part for URL.
                            item.link = getUrl(itemType, item.owner, id);
                            item.count = parseInt(item.count_photos) + parseInt(item.count_videos);
                            item.url = item.primary_photo_extras.url_m;
                            item.can_download = 1;
                        }
                        else if (itemType === 'group') {
                            item.link = getUrl(itemType, null, item.nsid);
                            item.count = parseInt(item.pool_count);

                            if (item.iconfarm === 0 && item.iconserver === '0') {
                                item.url = 'https://s.yimg.com/pw/images/buddyicon02_r.png';
                            }
                            else {
                                item.url = getGroupPhotoUrl(item.iconfarm, item.iconserver, item.nsid);
                            }

                            // Other properties:
                            // eighteenplus, members, pool_count, privacy, topic_count

                            item.can_download = 1;
                        }
                        else if (queryUserId !== null) {
                            item.link = getUrl(itemType, queryUserId, item.id);
                            item.url = item.url_m;
                        }
                        else {
                            item.link = getUrl(itemType, item.owner, item.id);
                            item.url = item.url_m;

                            // Favorites does not have can_download like photostream, so check license.
                            if (item.can_download === undefined) {
                                item.can_download = item.license == '0' ? 0 : 1;
                            }

                            //console.log('state.userId: ', state.userId);
                            //console.log('userId: ', userId);

                            // If the owner is the same as logged on user, always allow download of self-owned photos.
                            if (userId !== null && state.userId === userId) {
                                item.can_download = 1;
                            }
                        }

                        item.type = itemType;

                    });
                }

                var queryResult = {

                    ok: (result.stat === "ok"),
                    type: itemType,
                    page: parseInt(container.page),
                    pages: parseInt(container.pages),
                    perpage: (container.per_page !== undefined) ? parseInt(container.per_page) : parseInt(container.perpage), /* perpage for photos, per_page for galleries */
                    total: parseInt(container.total),
                    user_id: userId,
                    items: items

                };

                ok(queryResult);

            }, function (data, status, headers, config) {

                console.log('Status: ', status);

                fail();
            });

        }).error(fail);
    };

    var getUrl = function (type, userId, id) {
        switch (type) {
            case 'photostream':
                return 'https://www.flickr.com/photos/' + userId + '/';
            case 'profile':
                return 'https://www.flickr.com/people/' + userId + '/';
            case 'photo':
                return 'https://www.flickr.com/photos/' + userId + '/' + id + '';
            case 'photosets':
                return 'https://www.flickr.com/photos/' + userId + '/sets/';
            case 'photoset':
                return 'https://www.flickr.com/photos/' + userId + '/sets/' + id + '';
            case 'gallery':
                return 'https://www.flickr.com/photos/' + userId + '/galleries/' + id + '/';
            case 'group':
                return 'https://www.flickr.com/groups/' + id + '/';
        }
    };

    // Generates URL for different photo sizes.
    // Size: [mstzbo]
    var getPhotoUrl = function (size, photo) {
        if (size === null) {
            return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
        }
        else if (size === 'o') {
            return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.originalsecret + '_o.' + photo.originalformat + '';
        }
        else {
            return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_' + size + '.jpg';
        }
    };

    var getGroupPhotoUrl = function (farm, server, id) {
        return 'https://farm' + farm + '.staticflickr.com/' + server + '/buddyicons/' + id + '.jpg';
    };

    return {
        parseToken: parseToken,
        removeToken: removeToken,
        createMessage: createMessage,
        state: state,
        signUrl: signUrl,
        getUrl: getUrl,
        getPhotoUrl: getPhotoUrl,
        query: signAndQuery,
        sortList: sortList
    };

};

module.exports = FlickrApi;
