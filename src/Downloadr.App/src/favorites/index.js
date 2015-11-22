'use strict';

var angular = require('angular');

var app = angular.module('app.favorites', [

]);

app.controller('ApolloController', require('./apollo.controller.js'));

module.exports = app;
