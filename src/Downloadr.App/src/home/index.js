'use strict';

var angular = require('angular');
var app = angular.module('app.home', [

]);

app.controller('HomeController', require('./home.controller.js'));

module.exports = app;
