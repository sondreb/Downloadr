'use strict';

var angular = require('angular');

var app = angular.module('app.download', [

]);

app.controller('DownloadController', require('./download.controller.js'));

module.exports = app;