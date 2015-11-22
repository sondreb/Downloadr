'use strict';
// @ngInject
function EnterDirective() {
    return function (scope, element, attrs) {

        var inputElement = element.find('input');

        //$('input[type=search]').keyup(function (event) {
        //    if (event.which == 13) {
        //        $scope.search();
        //    }
        //});

        inputElement.bind('keydown keypress', function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.enter || attrs.ngClick, { $event: event });
                });
                event.preventDefault();
            }
        });
    }
};

module.exports = EnterDirective;