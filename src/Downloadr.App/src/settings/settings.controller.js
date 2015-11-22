'use strict';
// @ngInject
function SettingsController($scope, $rootScope, $timeout, settings, userSettings, flickr) {
 
    $scope.options = userSettings;
    $scope.flickr = flickr;

    $scope.languages = [
		{
			key: 'en-US',
			value: 'English'
		},
		{
			key: 'nb-NO',
			value: 'Norwegian'
		},
    ];

    $scope.getAcceptLanguages = function () {
        chrome.i18n.getAcceptLanguages(function (languageList) {
            var languages = languageList.join(',');
            document.getElementById('languageSpan').innerHTML = languages;
        });
    };

    return $scope;
};

module.exports = SettingsController;