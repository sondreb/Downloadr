'use strict';

var angular = require('angular');

var app = angular.module('app.settings', [

]);

app.controller('SettingsController', require('./settings.controller.js'));

module.exports = app;
