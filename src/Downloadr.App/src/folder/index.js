'use strict';

var angular = require('angular');

var app = angular.module('app.folder', [

]);

app.controller('FolderController', require('./folder.controller.js'));

module.exports = app;