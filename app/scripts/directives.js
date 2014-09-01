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


  directives.directive('search', function () {

      return {
          restrict: 'E',
          scope: {
            class: '@'
          },
          templateUrl: 'views/template_search.html'
      };
  });


  /*

  '<div class="dropdown">' +
      '<a href="#" class="search-type" ng-click="dropDown();">' +
          '<span class="fa fa-camera fa-fw"></span>' +
          '<span class="fa fa-caret-down"></span>' +
      '</a>' +
      '<ul class="search-options">' +
          '<li><a href="#"><i class="fa fa-camera"></i> Photos</a></li>' +
          '<li><a href="#"><i class="fa fa-video-camera"></i> Videos</a></li>' +
          '<li><a href="#"><i class="fa fa-user"></i> User</a></li>' +
          '<li><a href="#"><i class="fa fa-group"></i> Groups</a></li>' +
      '</ul>' +
  '</div>' +

  */

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

        console.log('YES!!!');

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
