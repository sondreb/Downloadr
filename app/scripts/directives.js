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
