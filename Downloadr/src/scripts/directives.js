/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

    var app = angular.module('downloadr');

	app.directive('appVersion', ['version',
		function (version) {
			return function (scope, elm, attrs) {
				elm.text(version);
			};
  }]);

	/*
  This directive allows us to pass a function in on an enter key to do what we want.
   */
	app.directive('ngEnter', ['$rootScope', '$location', '$timeout', function ($rootScope, $location, $timeout) {
		return function (scope, element, attrs) {
			element.bind('keydown keypress', function (event) {
				if (event.which === 13) {

					$timeout(function () {

						//if (attrs.ngEnter != null && $location.path() != attrs.ngEnter) {
						// First make sure we navigate to the page.
						//	$location.path(attrs.ngEnter);
						//}

						$rootScope.performSearch();

						// This should check for both undefined and null.
						//if (scope.eventHandler != null) {
						// If there is any event handler defined on the directive
						// call the function.
						//	scope.eventHandler();
						//}

					}, 0);

					event.preventDefault();
				}
			});
		};
	}]);

	// This directive is used to show the search input with options dropdown
	// and the search icon/button.
	app.directive('search', ['$location', function ($location) {

		return {
			restrict: 'E',
			scope: {
				class: '@',
				value: '=',
				target: '@',
				eventHandler: '&ngSearch'
			},
			templateUrl: 'views/template_search.html',
			link: function ($scope, element, attrs) {

				// Click Handler handles when user clicks the
				// search button, then we will navigate and perform search.
				$scope.clickHandler = function () {
					console.log('CLICK HANDLER FOR DIRECTIVE!!');

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
	}]);

	app.directive('justified', ['$timeout',
		function ($timeout) {
			return {
				restrict: 'AE',
				link: function (scope, el, attrs) {
					scope.$watch('$last', function (n, o) {
						if (n) {
							//$timeout(function () { $(el[0]).justifiedGallery(); });
						}
					});
				}
			};
  }]);

	app.directive('repeatDone', [
		function () {
			return {
				restrict: 'A',
				link: function (scope, element, iAttrs) {
					var parentScope = element.parent().scope();
					if (scope.$last) {
						parentScope.$last = true;
					}
				}
			};
    }]);

	app.directive('navMenu', ['$location', function ($location) {
		return function (scope, element, attrs) {
			var links = element.find('a'),
				onClass = attrs.navMenu || 'on',
				routePattern,
				link,
				url,
				currentLink,
				urlMap = {},
				i;

			if (!$location.$$html5) {
				routePattern = /^#[^/]*/;
			}

			for (i = 0; i < links.length; i++) {
				link = angular.element(links[i]);
				url = link.attr('href');

				if (url === null || url === undefined) {
					continue;
				}

				if ($location.$$html5) {
					urlMap[url] = link;
				} else {
					urlMap[url.replace(routePattern, '')] = link;
				}
			}

			scope.$on('$routeChangeStart', function () {
				var pathLink = urlMap[$location.path()];

				if (pathLink) {
					if (currentLink) {
						currentLink.removeClass(onClass);
					}
					currentLink = pathLink;
					currentLink.addClass(onClass);
				} else // If user clicks logo or search, etc.
				{
					if (currentLink) {
						currentLink.removeClass(onClass);
					}
				}
			});
		};
	}]);

	app.directive('thumb', function () {

		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			require: '',
			scope: {
				ngModel: '=',
				onSend: '&',
				fromName: '@',
				url: '@',
				view: '='
			},
			template: '<div><div ng-transclude></div>Result: {{view.name}} {{view.value}} {{ngModel}}</div>',
			link: function (scope, iElement, iAttrs) {

				console.dir(scope);
				console.dir(iElement);
				console.dir(iAttrs);

			}
		};

	});


	app.directive('image', ['fileManager', function (fileManager) {

		var failure = function () {
			console.error('Failed to download image!');
		};

		return {
			restrict: 'A',
			link: function ($scope, $element, attr) {

				// Cleanup of resources is now handled by the image directive itself.
				$scope.$on('$destroy', function() {
					console.log("image: destroy");
					console.log($scope.uri);
					URL.revokeObjectURL($scope.uri);
				});	
				
				attr.$observe('image', function (value) {

					if (value === '' || value === null) {
						return;
					}

					fileManager.download(value, function (uri) {

						$element.attr('src', uri);
						$scope.uri = uri;

					}, failure);

					/*
					fileManager.downloadAsText(value, function(base64) {

						// Set the src to locally cached base64 encoded image.
						var base64Url = 'data:image/png;base64,' + base64;
						$element.attr('src', base64Url);

					}, failure);*/
				});
			}
		};
	}]);

	// NOTE: Currently the LumX tabs control does not raise $destroy event on the tab control, but it
	// re-created the directive within the tab page on each navigation. Look into this in the future
	// as this is a memory leak right now.
	app.directive('gallery', ['$location', 
                                     'flickr', 
                                     '$timeout', 
                                     'settings', function ($location, 
                                                            flickr, 
                                                            $timeout, 
                                                            settings) {

		return {
			restrict: 'E',
			scope: {
				class: '@',
				value: '=',
				target: '@',
				eventHandler: '&ngSearch',
				loadMore: '&',
				status: '@',
				query: '&'
			},
			controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

				console.log('CONTROLLER on GALLERY WAS CALLED!');
				
				$scope.onFilterEvent = $rootScope.$on('Event:Filter', function (event) {
					
					console.log('Event:Filter: ', event);
					
					//$scope.clearPhotos();
					//console.log('User changed filter...');
					//$scope.performSearch($rootScope.state.searchText);
					
					console.log('User changed filter... calling loadItems...');
					
					$scope.items = [];
					$scope.page = 1;
					
					// This event handler is triggered before the settings are saved,
					// that means the filter value won't be available yet. Therefore it
					// must be executed in a $timeout.
					$timeout(function() {
						loadItems();
					}, 1);
					
				});
				
				// Do we need to initialize items here?
				$scope.items = [];
				$scope.page = 1;
				
				var onError = function(err) {
					console.log('something bad happened...', err);
				};
				
				var onData = function(data) {
				
					$scope.showStatus = false;
					$scope.status = '';
					
					if (!data.ok)
					{
						console.log('ERROR OCCURRED: ', data); // Consider showing the error to users.
						$scope.albumStatus = 'Failed to retreive items.';
						return;
					}
					else if (data.total === 0)
					{
						$scope.favoritesStatus = 'Nothing to see here.';
						return;
					}
					
					data.items.forEach(function (item) {
						$scope.items.push(item);
					});
					
					if (data.page === data.pages || data.total === 0)
					{
						$scope.showLoadMore = false;
					}
					else
					{
						$scope.showLoadMore = true;
					}
					
					if ($scope.status !== null && $scope.status !== '') {
						$scope.showStatus = true;
					}
					
				};
				
				var loadItems = function() {
					
					var input = $scope.query();
					
					if (input === undefined)
					{
						return;
					}
					
					console.log(input);
					
					//var input = JSON.parse(query);
					//console.log(input);
					
					// Set the page to query for.
					input.arguments.page = '' + $scope.page + '';
					
					input.arguments.sort = settings.values.sort;
					
					input.arguments.license = settings.values.license;
					
					var query = flickr.createMessage(input.method, input.arguments);
					flickr.query(query, onData, onError);
				};
				
				// Load the first page of items.
				loadItems();

				/*
				$scope.showStatus = false;

				$scope.setStatus = function (text) {

					$scope.status = text;

					if ($scope.status !== null && $scope.status !== '') {
						$scope.showStatus = true;
					}

				};*/

				$scope.menu = function (item) {
					var url = item.link;
					window.open(url);
				};
				
				$scope.loadMore = function () {

					console.log('loadMore');
					$scope.page++;
					
					loadItems();
					
				};
				
				// Event handler when user selects a photo. Same event for click on existing selected or new photo.
				$scope.select = function (item) {
					
					if (item.can_download !== 1)
					{
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

			}],
			templateUrl: 'views/template_gallery.html',
			link: function ($scope, element, attrs) {

				
				console.log('LINK ON GALLERY WAS CALLED!!!');
				console.log(element);
				
				// Cleanup of resources is now handled by the image directive itself.
				$scope.$on('$destroy', function() {
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
	}]);
	

	app.directive('icon', function () {

		return {
			restrict: 'E',
			replace: true,
			scope: {
				icon: '@',
				size: '@'
			},
			templateUrl: 'views/template_icon.html'
		};
	});


	app.directive('windowIcon', function () {

		return {
			restrict: 'E',
			replace: false,
			scope: {
				icon: '@',
				size: '@'
			},
			templateUrl: 'views/template_window_icon.html'
		};
	});

})();