'use strict';
// @ngInject
function HomeController($scope, state, $state, userSettings, $timeout, $q) {
    $scope.state = state;
    $scope.searchText = '';

    $scope.progress = null;
    //$scope.progress = $scope.defer.promise;

    //$timeout(function () {
    //    defer.resolve();
    //}, 5000);


    $scope.clickButton = function () {

        var defer = $q.defer();

        $scope.progress = defer.promise;

        $timeout(function () {
            defer.resolve();
        }, 5000);

        //$scope.progress = $scope.defer.promise;
    };

    $scope.canSearch = function () {
        return $scope.searchText.length > 0;
    };

    $scope.search = function () {
        if (!$scope.canSearch()) {
            return;
        }

        $state.transitionTo('search', { text: $scope.searchText });
    };

    return $scope;
};

module.exports = HomeController;
