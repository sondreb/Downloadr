'use strict';
// @ngInject
function Version(appSettings) {
    // @ngInject
    return function (scope, elm, attrs) {
        elm.text(appSettings.appVersion);
    };
};

module.exports = Version;