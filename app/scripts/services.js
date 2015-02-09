/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

	var downloadr = angular.module('downloadr.services', []);


	var sidebar = angular.module('Sidebar', []).service('SidebarService', function () {
		var sidebarIsShown = false;

		function toggleSidebar() {
			sidebarIsShown = !sidebarIsShown;
		}

		return {
			isSidebarShown: function () {
				return sidebarIsShown;
			},
			toggleSidebar: toggleSidebar
		};
	});


	downloadr.factory('settings', ['$rootScope', '$timeout',
		function ($rootScope, $timeout) {

			var load = function () {
				chrome.storage.sync.get('settings', function (result) {

					if (result.settings == null || Object.keys(result.settings).length === 0) // Checks null and undefined
					{
						return;
					}

					var settings = result.settings;

					// When we load, we can't replace the whole "values" object, as that
					// will remove link between controllers and this service.
					values.safe = settings.safe;
					values.size = settings.size;
					values.sort = settings.sort;
					values.license = settings.license;
					values.view = settings.view;
					values.background = settings.background;
					values.debug = settings.debug;
					values.progress = settings.progress;
					values.completed = settings.completed;

					if (values.debug === true) {
						$rootScope.state.debug = true;
					}

					console.log('Settings loaded: ', values);
					$scope.apply();

					$rootScope.$broadcast('Settings:Loaded', values);

				});
			};

			var save = function () {
				chrome.storage.sync.set({
					'settings': values
				}, function () {
					console.log('Settings saved: ', values);
				});
			};

			// Setting keys have been chosen to be small and simple for
			// simplicity. Might not all be self-descriptive, but easy to learn.

			var values = {
				safe: '1',
				size: 'o',
				sort: 'relevance',
				license: '1,2,3,4,5,6,7,8',
				view: 'large',
				background: true,
				debug: false,
				progress: true,
				completed: true
			};

			// Before we return the service, we'll load the settings if they exists.
			load();

			return {
				values: values,
				load: load,
				save: save
			};

    }]);


	downloadr.factory('notify', function () {
		return function (id, type, title, body, callback, progress) {

			chrome.notifications.onClicked.addListener(function (id) {
				// Launch the local file browser at the target destination.
				callback(id);
			});

			var options = {
				type: type,
				title: title,
				message: body,
				iconUrl: 'images/icon_128.png',
				progress: progress
			};

			chrome.notifications.create(id, options, function (notificationId) {});

		};
	});


	downloadr.factory('searchProvider', ['$location', '$timeout', function ($location, $timeout) {
		var service = {};

		service.performSearch = function () {
			console.log("PERFORM SEARCH!!!");
		}

		service.searchText = 'Hello World';

		return service;
	}]);


	downloadr.service('util', function () {
		this.format = function (text, params) {
			var str = text.replace(/\{(.*?)\}/g, function (i, match) {
				return params[match];
			});

			return str;
		};
	});


	downloadr.service('flickr', ['$rootScope', function ($rootScope) {

		var token = '';
		var secret = '';
		var userId = '';
		var userName = '';
		var fullName = '';

		var removeToken = function () {
			this.token = '';
			this.secret = '';
			this.userId = '';
			this.userName = '';
			this.fullName = '';
		}

		var parseToken = function (message) {
			this.token = message.oauthToken;
			this.secret = message.oauthTokenSecret;
			this.userId = message.userNsId;
			this.userName = message.userName;
			this.fullName = message.fullName;
		};

		var createMessage = function (method, args) {
			var message = {
				method: method,
				args: args,
				token: token,
				secret: secret
			};

			return message;
		};

		return {
			parseToken: parseToken,
			removeToken: removeToken,
			createMessage: createMessage,
			userId: userId,
			userName: userName

		};

	}]);
})();