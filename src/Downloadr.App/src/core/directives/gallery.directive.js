'use strict';
// @ngInject
function Gallery($location, flickr, $timeout, userSettings, logger) {

    var log = logger.Create('Gallery');

    return {
        restrict: 'E',
        scope: {
            class: '@',
            value: '=',
            target: '@',
            eventHandler: '&ngSearch',
            loadMore: '&',
            status: '@',
            query: '&',
            selectAllEvent: '@', 
            id: '@'
        },
        /**
         * @ngInject
         */
        controller: function ($scope, $rootScope) {

            var log = logger.Create('Gallery');

            if ($scope.selectAllEvent !== null) {
                $rootScope.$on($scope.selectAllEvent, function () {
                    $scope.items.forEach(function (item) {
                        $scope.select(item);
                    });
                });
            }

            $scope.onFilterEvent = $rootScope.$on('Event:Filter', function () {

                log.debug('Event:Filter');
                log.debug('User changed filter... calling loadItems...');

                //$scope.clearPhotos();
                //console.log('User changed filter...');
                //$scope.performSearch($rootScope.state.searchText);

                $scope.items = [];
                $scope.page = 1;

                // This event handler is triggered before the settings are saved,
                // that means the filter value won't be available yet. Therefore it
                // must be executed in a $timeout.
                $timeout(function () {
                    loadItems();
                }, 1);

            });

            // Do we need to initialize items here?
            $scope.items = [];
            $scope.page = 1;

            var onError = function (err) {
                log.error('Something bad happened...', err);
            };

            var onData = function (data) {

                $scope.showStatus = false;
                $scope.status = '';

                log.info('DATA RECEIVED:', data);

                if (!data.ok) {
                    console.log('ERROR OCCURRED: ', data); // Consider showing the error to users.
                    $scope.status = 'Failed to retreive items.';
                }
                else if (data.total === 0) {
                    $scope.status = 'Nothing to see here.';
                }

                data.items.forEach(function (item) {
                    $scope.items.push(item);
                });

                if (data.page === data.pages || data.total === 0) {
                    $scope.showLoadMore = false;
                }
                else {
                    $scope.showLoadMore = true;
                }

                if ($scope.status !== null && $scope.status !== '') {
                    $scope.showStatus = true;
                }

            };

            var loadItems = function () {

                var input = $scope.query();

                if (input === undefined) {
                    return;
                }

                console.log(input);

                // Set the page to query for.
                input.arguments.page = '' + $scope.page + '';
                input.arguments.sort = userSettings.sort;
                input.arguments.license = userSettings.license;

                var query = flickr.createMessage(input.method, input.arguments);
                flickr.query(query, onData, onError);
            };

            // Load the first page of items.
            loadItems();

            $scope.menu = function (item) {
                var url = item.link;
                window.open(url);
            };

            $scope.loadMore = function () {

                log.debug('Load more...');
                $scope.page++;

                loadItems();

            };

            // Event handler when user selects a photo. Same event for click on existing selected or new photo.
            $scope.select = function (item) {

                log.info('Image selected:', item);

                if (item.can_download !== 1) {
                    return;
                }

                if (item.selected === true) {
                    item.selected = false;

                    //$rootScope.state.selectedPhotos = _.without($rootScope.state.selectedPhotos, item);

                } else {
                    item.selected = true;
                    //$rootScope.state.selectedPhotos.push(item);
                }

                $rootScope.$broadcast('Event:SelectedItemChanged', {
                    item: item,
                    selected: item.selected
                });

                //console.log('Select item: ', item);
            };
        },
        templateUrl: 'views/core/templates/gallery.html',
        /**
         * @ngInject
         */
        link: function ($scope, element, attrs) {

            // Cleanup of resources is now handled by the image directive itself.
            $scope.$on('$destroy', function () {
                console.log("gallery-link: destroy");
                //console.log($scope.uri);
                //URL.revokeObjectURL($scope.uri);
            });

            /*
            attrs.$observe('status', function (value) {
                                 
                if (value === '' || value === null) {
                    $scope.showStatus = false;
                }
                else
                {
                    $scope.showStatus = true;
                }
            });*/

            // Click Handler handles when user clicks the
            // search button, then we will navigate and perform search.
            $scope.clickHandler = function () {
                //console.log('CLICK HANDLER FOR DIRECTIVE!!');

                if ($scope.target !== null) {
                    $location.path($scope.target);
                }

                if ($scope.eventHandler !== null) {
                    // If there is any event handler defined on the directive
                    // call the function.
                    $scope.eventHandler();
                }
            };
        }
    };
};

module.exports = Gallery;