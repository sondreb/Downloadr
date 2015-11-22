'use strict';
// @ngInject
function LogoutController($scope, $timeout, $state, $rootScope, $location, appSettings, userToken, $http, flickr, storage, state) {
 
    $scope.signout = function () {

        console.log('Signout Command');

        storage.remove('token', function () {
            // Notify that we saved.
            console.log('Token removed, navigate to home...');

            flickr.removeToken();

            $rootScope.$broadcast('logout');

            $state.transitionTo('home');
        });
        
    };

    $scope.back = function () {
        console.log('Go back!');
        // Navigate to home.

        $state.transitionTo(state.previousState);
    };

    return $scope;
};

module.exports = LogoutController;