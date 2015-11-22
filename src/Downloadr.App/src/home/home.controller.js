'use strict';
// @ngInject
function HomeController($scope, state, $state, userSettings) {
    $scope.state = state;
    $scope.searchText = '';

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
