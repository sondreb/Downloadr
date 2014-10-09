/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

 'use strict';

(function () {

  var directives = angular.module('downloadr.directives', []);

  directives.directive('appVersion', ['version', function (version) {
      return function(scope, elm, attrs) {
          elm.text(version);
      };
  }]);

  /*
  This directive allows us to pass a function in on an enter key to do what we want.
   */
  directives.directive('ngEnter', function ($rootScope, $location, $timeout) {
      return function (scope, element, attrs) {
          element.bind("keydown keypress", function (event) {
              if(event.which === 13) {

                  $timeout(function() {

                    if (attrs.ngEnter != null)
                    {
                      // First make sure we navigate to the page.
                      $location.path(attrs.ngEnter);
                    }

                    // This should check for both undefined and null.
                    if (scope.eventHandler != null)
                    {
                      // If there is any event handler defined on the directive
                      // call the function.
                      scope.eventHandler();
                    }
                  }, 0);

                  event.preventDefault();
              }
          });
      };
  });

  // This directive is used to show the search input with options dropdown
  // and the search icon/button.
  directives.directive('search', function ($location) {

      return {
          restrict: 'E',
          scope: {
            class: '@',
            value: '=',
            target: '@',
            eventHandler: '&ngSearch'
          },
          templateUrl: 'views/template_search.html',
          link: function($scope, element, attrs) {

              // Click Handler handles when user clicks the
              // search button, then we will navigate and perform search.
              $scope.clickHandler = function()
              {
                  if ($scope.target != null)
                  {
                    $location.path($scope.target);
                  }

                  if ($scope.eventHandler != null)
                  {
                    // If there is any event handler defined on the directive
                    // call the function.
                    $scope.eventHandler();
                  }
              };
          }
      };
  });

  directives.directive('navMenu', function($location) {
    return function(scope, element, attrs) {
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

        if ($location.$$html5) {
          urlMap[url] = link;
        } else {
          urlMap[url.replace(routePattern, '')] = link;
        }
      }

      scope.$on('$routeChangeStart', function() {
        var pathLink = urlMap[$location.path()];

        if (pathLink) {
          if (currentLink) {
            currentLink.removeClass(onClass);
          }
          currentLink = pathLink;
          currentLink.addClass(onClass);
        }
        else // If user clicks logo or search, etc.
          {
            if (currentLink) {
              currentLink.removeClass(onClass);
            }
          }
      });
    };
  });

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


})();
