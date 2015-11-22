'use strict';

var angular = require('angular');

var app = angular.module('app.about', [

]);

app.controller('AboutController', require('./about.controller.js'));

module.exports = app;
