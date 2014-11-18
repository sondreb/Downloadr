/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

	var filters = angular.module('downloadr.filters', []);

	filters.filter('joinBy', function () {
		return function (input, delimiter) {
			return (input || []).join(delimiter || ',');
		};
	});
	
	filters.filter('iconLink', function() {
        return function(stringValue) {
            return '#icon-' + stringValue;
        };
    });

	filters.filter('iconLinkNormal', function() {
        return function(stringValue) {
            return '#icon-' + stringValue + '-normal';
        };
    });
	
	filters.filter('iconLinkHover', function() {
        return function(stringValue) {
            return '#icon-' + stringValue + '-hover';
        };
    });
	
	filters.filter('iconLinkActive', function() {
        return function(stringValue) {
            return '#icon-' + stringValue + '-press';
        };
    });
	
	filters.filter('iconLinkNoFocus', function() {
        return function(stringValue) {
            return '#icon-' + stringValue + '-nofocus';
        };
    });
	
})();