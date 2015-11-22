'use strict';

var angular = require('angular');

var app = angular.module('app.search', [

]);

app.controller('SearchController', require('./search.controller.js'));

module.exports = app;
