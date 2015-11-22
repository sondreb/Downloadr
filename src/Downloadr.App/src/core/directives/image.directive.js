'use strict';
// @ngInject
function Image(fileManager) {

    var failure = function () {
        console.error('Failed to download image!');
    };

    return {
        restrict: 'A',
        link: function ($scope, $element, attr) {

            //console.log('LINK on IMAGE DIRECTIVE!');

            // Cleanup of resources is now handled by the image directive itself.
            $scope.$on('$destroy', function () {
                console.log("image: destroy");
                console.log($scope.uri);
                URL.revokeObjectURL($scope.uri);
            });

            attr.$observe('image', function (value) {

                if (value === '' || value === null) {
                    return;
                }
                else if (value.indexOf('data:image') > -1) {
                    $scope.uri = value;
                }
                else {
                    fileManager.download(value, function (uri) {

                        $element.attr('src', uri);
                        $scope.uri = uri;

                    }, failure);
                }
            });
        }
    };
};

module.exports = Image;