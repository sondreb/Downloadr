/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

// References: http://www.codeproject.com/Articles/247241/Javascript-Module-Pattern

// Library that handles integration, queries and authentication with the Flickr API.
// Written by Sondre Bjellås (October/November 2013).
var Flickr = (function () {

	var _self = this;

	// Used to see if we're running inside Chrome Packaged App.
	var _packaged = (typeof chrome != 'undefined' && typeof chrome.runtime != 'undefined');

	var resources = {
		connectionError: 'Connection is in an invalid state, there is no transport active.',
		invalidState: 'Invalid state.'
	};

	// Private variables
	var _url = 'http';
	var _consumerKey = '519594a5d8ab2bb0e42d75d54d2bca87';
	var getUrl = function () {
		return url;
	};
	var _connection = null;
	var _proxy = null;

	var deleteToken = function () {
		// Save the token with null should delete it.
		saveToken(null);
	};

	var buildUrl = function (method, query) {
		var apiKey = '519594a5d8ab2bb0e42d75d54d2bca87';
		var apiUrl = 'https://api.flickr.com/services/rest/?method=';
		query += '&format=json&api_key=' + apiKey;

		return apiUrl + method + query;
	};

	var saveToken = function (token) {

		if (!_packaged) {
			localStorage['token'] = token;
		} else {
			//chrome.storage.sync.set({ 'token': token }, function () {
			//    console.log('Token saved.');
			//});
		}
	};

	var loadToken = function (cb) {

		var token = '';

		if (!_packaged) {

			token = localStorage['token'];

			console.dir(token);

			cb(token);
		} else {

			// Is this async? Then the return value will probably be null.
			//chrome.storage.sync.get('token', function (data) {
			//    token = data;
			//    console.dir(token);
			//    cb(token);
			//});
		}
	};

	//var getToken = function (callback) {

	//    console.log("METHOD: getToken");

	//    proxy.invoke('chat').done(function () {
	//        console.log('Invocation of Send succeeded');
	//    });

	//    window.setTimeout(callback, 500);
	//    this.OnAuthenticated();
	//};

	var onAuthenticationTokenReceived = function (response) {
		console.log('METHOD: onAuthenticationTokenReceived');
		console.log(response);
		var responseString = JSON.stringify(response);
		saveToken(responseString);

		// Parse back into JSON.
		var token = JSON.parse(responseString);

		// We got a token, notify that we're authenticated.
		Flickr.OnAuthenticated(token);
	};

	var generateUrl = function (url, callback) {
		console.log('Flickr/generateUrl:' + url);
		//console.log(_proxy);

		_proxy.invoke('generateUrl', url).done(function (signedUrl) {
			console.log('generateUrl: ' + signedUrl);
			callback(signedUrl);
		}).fail(function (error) {
			console.log('FAIL!!!:' + error);
		});
	};

	var onLoginUrl = function (url) {
		console.log('METHOD: onLoginUrl');
		//console.log(message.Name, message.Value);
		// Raise the event that will display UI.
		//this.OnAuthenticated();

		Flickr.OnAuthenticating(url);

		//if (this.OnAuthenticated != undefined)
		//{
		//    console.log("OnAuthenticated handler exists!!!");
		//}
		//else
		//{
		//    console.log("Missing OnAuthenticated handler.");
		//}

		//console.log(initialize);
		//console.log(this.OnAuthenticated);
		//console.log(_self.StartAuthentication);

		//this.OnAuthenticating(message.Name);
	};

	//var onAuthenticated = {};


	var initialize = function (hasToken) {

		//photos.search();

		// Open WebSocket connection with service and ask for Request Token.
		_connection = $.hubConnection();
		//_connection.url = "http://brain.no:8080/api";
		//_connection.url = "http://localhost:8080/api";
		_connection.url = 'http://localhost:8484/api';

		_connection.logging = true;

		_proxy = _connection.createHubProxy('tokenHub');

		console.log('TOKEN SERVICE INITIALIZE');

		// Raised whenever we retreive a login url.
		_proxy.on('loginUrl', onLoginUrl);
		_proxy.on('authenticationTokenReceived', onAuthenticationTokenReceived);

		//_connection.stateChanged(function (state) {
		//    // Transitioning from connecting to connected
		//    if (state.oldState === $.signalR.connectionState.connecting && state.newState === $.signalR.connectionState.connected) {

		//    }
		//});

		_connection.start().done(function () {

			console.log('WebSocket Started: ' + _connection.id);

			/*
            var url = "http://api.flickr.com/services/rest/?method=flickr.photos.search&user_id=32954227@N00&format=json&api_key=519594a5d8ab2bb0e42d75d54d2bca87";

            console.log(url);
            // Generate a signed URL.
            generateUrl(url, function (signedUrl) {

                console.log("YES:" + signedUrl);

            });

*/


			if (!hasToken) {
				// If we don't have token, we'll invoke to get login URL.
				_proxy.invoke('requestLoginUrl').done(function () {
					console.log('Invocation of "requestLoginUrl" succeeded');
				});
			} else {
				// If we have a token, we'll try to load an updated profile
				// of the logged on user to get the latest profile image. If this
				// fails, we'll request the login URL instead.

				// At this time, the UI have already received OnAuthenticated event.
			}

			//proxy.invoke('send', { Name: 'my name', Value: 'hello world!' }).done(function () {
			//    console.log('Invocation of Send succeeded');
			//}).fail(function (error) {
			//    console.log('Invocation of Send failed. Error: ' + error);
			//});;

		}).fail(function () {
			console.log('Could not connect');
		});

	};

	function startAuthentication() {

		return;

		console.log('METHOD: startAuthentication');

		loadToken(function (token) {

			// If there is no token, we need to start the process to get it.
			if (token == null || token == '') {

				// Initialize the WebSocket connection.
				initialize(false);
			} else {

				console.log('Has Token, Running initialize...');

				// Initialize the WebSocket connection.
				initialize(true);

				console.dir(token);

				//var parsedToken = JSON.parse(token);

				// We got a token, notify that we're authenticated.
				Flickr.OnAuthenticated(token);
			}
		});


		// Wait for callback from WS with oauth token and secret.

		// Generate the URL and redirect the user.

		// Retreive the oauth verifier from the WS.

		// Exchange the Request Token for an Access Token.

		// Store the Access Token in file system.

	};

	/* Here the API is organized to map directly to the names of the official Flickr API,
    this will make it more easily discoverable. */
	var photos = photos || {};
	var groups = groups || {};
	var people = people || {};

	photos.search = function (callback) {
		console.log("flickr.photos.search!!!!");
	};

	people.getInfo = function (id, callback) {
		console.log('flickr.people.getInfo: ' + id);

		var method = 'flickr.people.getInfo';
		var query = '&user_id=' + id;

		var url = buildUrl(method, query);

		console.log('TRY THIS URL: ' + url);

		$.getJSON(url, function (data) {


			var items = [];
			$.each(data, function (key, val) {
				items.push('<li id="' + key + '">' + val + '</li>');
			});

			$('<ul/>', {
				"class": 'my-new-list',
				html: items.join('')
			}).appendTo('body');
		});


		$http.get(url).success(function (data) {

			// Remove the wrapper.
			data = data.replace('jsonFlickrApi(', '');
			data = data.replace(')', '');
			data = JSON.parse(data);

			console.log(data);
			//$scope.parseProfile(data);

			callback(data);
		});

	};


	//var onAuthenticated = function () { console.log("onAuthenticated"); };

	// Public properties and functions.
	return {
		//the method inside the return object are
		//called as privileged method because it has access
		//to the private methods and variables of the module.

		//OnAuthenticatingHandler: {},
		//OnAuthenticating: function() { OnAuthenticatingHandler(); },

		AuthenticationUrl: getUrl,
		OnAuthenticating: null,
		OnAuthenticated: null,
		//OnAuthenticating: null,

		//addListener: function(event, func)
		//{
		//    if (event == "OnAuthenticating")
		//    {
		//        OnAuthenticatingHandler = func;
		//    }
		//    else if (event == "OnAuthenticated")
		//    {

		//    }
		//},

		StartAuthentication: startAuthentication,
		Authenticate: startAuthentication,
		LoadToken: loadToken,
		SaveToken: saveToken,
		GenerateUrl: generateUrl,
		DeleteToken: deleteToken,
		BuildUrl: buildUrl,

		/* Map to same as API as Flickr.com */
		photos: photos,
		groups: groups,
		people: people

		//privilegedMethod: function () {
		//    //this method can access its private variable and method
		//    //by using the principle of closure.
		//    alert(privateVariable); //accessing private variable.
		//    privateMethod(); //calling private method
		//}
	};
})();


// Extending the Flickr library with authentication sub-module.
Flickr.Authentication = (function () {

	// Private variables
	var url = 'http';

	var getUrl = function () {
		return url;
	};

	//var privateVariable = "some value",
	//    privateMethod = function () {
	//        alert('hi from private');
	//    };
	//returning one anonymous object literal that would expose privileged methods.
	return {
		//the method inside the return object are
		//called as privileged method because it has access
		//to the private methods and variables of the module.

		AuthenticationUrl: getUrl,

		//privilegedMethod: function () {
		//    //this method can access its private variable and method
		//    //by using the principle of closure.
		//    alert(privateVariable); //accessing private variable.
		//    privateMethod(); //calling private method
		//}
	};
})();