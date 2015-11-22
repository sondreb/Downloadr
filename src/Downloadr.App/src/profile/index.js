'use strict';

var angular = require('angular');

var app = angular.module('app.profile', [

]);

app.controller('ProfileController', require('./profile.controller.js'));

module.exports = app;
