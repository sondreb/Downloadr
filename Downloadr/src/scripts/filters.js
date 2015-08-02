/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

    var app = angular.module('downloadr');

	app.filter('joinBy', function () {
		return function (input, delimiter) {
			return (input || []).join(delimiter || ',');
		};
	});

	app.filter('iconLink', function () {
		return function (stringValue) {
			return '#icon-' + stringValue;
		};
	});

	app.filter('iconLinkNormal', function () {
		return function (stringValue) {
			return '#icon-' + stringValue + '-normal';
		};
	});

	app.filter('iconLinkHover', function () {
		return function (stringValue) {
			return '#icon-' + stringValue + '-hover';
		};
	});

	app.filter('iconLinkActive', function () {
		return function (stringValue) {
			return '#icon-' + stringValue + '-press';
		};
	});

	app.filter('iconLinkNoFocus', function () {
		return function (stringValue) {
			return '#icon-' + stringValue + '-nofocus';
		};
	});

})();