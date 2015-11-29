'use strict';
// @ngInject
function ApolloController($scope, $rootScope, $state, selectionManager, flickr) {
    $scope.userId = '136485307@N06';
    $scope.selectionManager = selectionManager;

    $scope.downloadArchive = function () {
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
        // Get the total count number, this is needed to show a proper download progress status.
        var count = data.items.photos.count._content;

        $rootScope.$broadcast('Event:SelectedItemChanged', {
            item: {
                type: 'user',
                id: $scope.userId,
                can_download: 1,
                count: count
            },
            selected: true
        });

        $state.transitionTo('folder');
    };

    return $scope;
};

module.exports = ApolloController;