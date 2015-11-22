'use strict';

var angular = require('angular');

var app = angular.module('app.auth', [

]);

app.controller('LoginController', require('./login.controller.js'));
app.controller('LogoutController', require('./logout.controller.js'));

module.exports = app;