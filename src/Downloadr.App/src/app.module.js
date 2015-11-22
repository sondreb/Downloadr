'use strict';
// @ngInject

var appSettings = require('./app.constants');
var angular = require('angular');
var $ = require('jquery');
var Mousetrap = require('mousetrap');

// Require the dependencies that does not support returning name from the require.
require('angular-local-storage');
require('winjs');
require('angular-winjs');
require('angular-busy');

// @ngInject
var app = angular.module(appSettings.appName, [
        require('angular-ui-router'),
        require('angular-animate'),
        'LocalStorageModule',
        require('./core').name,
        require('./home').name,
        require('./search').name,
        require('./auth').name,
        require('./about').name,
        require('./profile').name,
        require('./folder').name,
        require('./download').name,
        require('./settings').name,
        require('./favorites').name,
        'winjs',
        'cgBusy'
]);

app.constant('appSettings', appSettings);
app.constant('licenses', require('./app.licenses.js'));
app.value('userSettings', {});
app.value('userToken', {});
app.value('state', require('./app.state.js'));
app.value('runtime', require('./app.runtime.js'));
app.value('cgBusyDefaults', {
    message: 'Loading...',
    templateUrl: 'views/core/templates/angular-busy.html',
    delay: 0,
    minDuration: 500
});
app.config(require('./app.config'));
app.run(require('./app.run'));
app.controller('AppController', require('./app.controller.js'));

angular.element(document).ready(function () {
    angular.bootstrap(document, [appSettings.appName]);
});

module.exports = app;
