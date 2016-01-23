'use strict';

var angular = require('angular');

var app = angular.module('app.core', [

]);

// Register the Flickr Service.
app.directive('appVersion', require('./directives/appVersion.directive.js'));
app.directive('image', require('./directives/image.directive.js'));
app.directive('gallery', require('./directives/gallery.directive.js'));
app.directive('enter', require('./directives/enter.directive.js'));

app.factory('selectionManager', require('./factories/selectionManager.factory.js'));
app.factory('fileManager', require('./factories/fileManager.factory.js'));
app.factory('notify', require('./factories/notify.factory.js'));
app.factory('storage', require('./factories/storage.factory.js'));
app.factory('logger', require('./factories/logger.factory.js'));

//app.factory('settings', require('./factories/settings.factory.js'));
app.service('settings', require('./services/settings.service.js'));
app.service('flickr', require('./services/flickr.service.js'));
app.service('downloadManager', require('./services/downloadManager.service.js'));

module.exports = app;
