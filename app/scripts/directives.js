/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

	var directives = angular.module('downloadr.directives', []);

	directives.directive('appVersion', ['version',
		function (version) {
			return function (scope, elm, attrs) {
				elm.text(version);
			};
  }]);

	/*
  This directive allows us to pass a function in on an enter key to do what we want.
   */
	directives.directive('ngEnter', ['$rootScope', '$location', '$timeout', function ($rootScope, $location, $timeout) {
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
	directives.directive('search', ['$location', function ($location) {

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

	directives.directive('justified', ['$timeout',
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

	directives.directive('repeatDone', [
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

	directives.directive('navMenu', ['$location', function ($location) {
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

	directives.directive('thumb', function () {

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


	directives.directive('image', ['fileManager', function (fileManager) {

		var failure = function () {
			console.error('Failed to download image!');
		};

		return {
			restrict: 'A',
			link: function ($scope, $element, attr) {

				attr.$observe('image', function (value) {

					if (value === '' || value === null) {
						return;
					}

					fileManager.download(value, function (uri) {

						$element.attr('src', uri);

						//URL.revokeObjectURL(uri);

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

	directives.directive('gallery', ['$location', function ($location) {

		return {
			restrict: 'E',
			scope: {
				items: '=',
				class: '@',
				value: '=',
				target: '@',
				eventHandler: '&ngSearch',
				loadMore: '&',
				status: '@'
			},
			controller: function ($scope, $rootScope) {

				console.log($scope);
				
				$scope.showStatus = false;

				$scope.setStatus = function (text) {

					$scope.status = text;

					if ($scope.status !== null && $scope.status !== '') {
						$scope.showStatus = true;
					}

				};

				$scope.menu = function (item) {
					var url = item.link;
					window.open(url);
				};
				
				$scope.loadMore = function () {

					console.log('loadMore');
					
				};

				// Event handler when user selects a photo. Same event for click on existing selected or new photo.
				$scope.select = function (item) {
					
					if (item.license === "0") {
						return;
					}

					if (item.selected === true) {
						item.selected = false;

						$rootScope.state.selectedPhotos = _.without($rootScope.state.selectedPhotos, item);

					} else {
						item.selected = true;
						$rootScope.state.selectedPhotos.push(item);
					}

					
					$rootScope.$broadcast('Event:SelectedPhotosChanged', {
						photos: $rootScope.state.selectedPhotos
					});

					console.log('Select item: ', item);
				};

			},
			templateUrl: 'views/template_gallery.html',
			link: function ($scope, element, attrs) {

				console.log($scope);
				
				attrs.$observe('status', function (value) {

					if (value === '' || value === null) {
						$scope.showStatus = false;
					}
					else
					{
						$scope.showStatus = true;
					}
				});
				
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


	directives.directive('icon', function () {

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


	directives.directive('windowIcon', function () {

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