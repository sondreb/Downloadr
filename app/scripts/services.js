/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

(function () {

	var downloadr = angular.module('downloadr.services', []);

	
	downloadr.factory('settings', ['$rootScope', '$timeout', 'storage',
		function ($rootScope, $timeout, storage) {
			
			var runtime = (typeof(chrome) !== 'undefined') ? 'chrome' : 'firefox';

			var load = function () {
				
				if (runtime === 'chrome')
				{
					
					//storage.get('settings', function (result) {
					chrome.storage.sync.get('settings', function (result) {

						if (result.settings === null || Object.keys(result.settings).length === 0) // Checks null and undefined
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
						values.type = settings.type;

						if (values.debug === true) {
							$rootScope.state.debug = true;
						}

						console.log('Settings loaded: ', values);
						$scope.apply();

						$rootScope.$broadcast('Settings:Loaded', values);

					});
				}
			};

			var save = function () {
				//storage.set('settings', values, function () {
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
				completed: true,
				type: 'photos'
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

	
	downloadr.factory('fileManager', function () {

		var download = function (url, success, error) {

			console.log('File Manager Download: ', url);
			
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'blob';

			xhr.onload = function () {
				
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						
						console.log(xhr.response);
						//window.console.log("response: "+xhr.response);
						//callback(JSON.parse(xhr.response));
						success(window.webkitURL.createObjectURL(xhr.response), url, xhr.response);
					} else {
						error(xhr.statusText);
						console.error(xhr.statusText);
					}
				}
				
			};
			
			 xhr.ontimeout = function () {
        		 console.error("The request for " + url + " timed out.");
				 
				 if (error !== undefined)
				 {
				 	error("The request for " + url + " timed out.");
				 }
				 
			};
			
			xhr.onerror = function(){
				console.error("error: "+xhr.statusText);
				
				if (error !== undefined)
				{
					error("error: "+xhr.statusText);
				}
				
			}
			
			xhr.open('GET', url, true);
			xhr.send();

		};
		
		var downloadAsText = function (url, success, error) {

			console.log('File Manager Download: ', url);
			
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'arraybuffer';

			xhr.onload = function () {
				
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						
						console.log(xhr.response);
						
						
						var uInt8Array = new Uint8Array(this.response);
						var i = uInt8Array.length;
						var biStr = new Array(i);
						while (i--)
						{ biStr[i] = String.fromCharCode(uInt8Array[i]);
						}
						var data = biStr.join('');
						var base64 = window.btoa(data);
						
						success(base64, url);
						
						//window.console.log("response: "+xhr.response);
						//callback(JSON.parse(xhr.response));
						//success(window.webkitURL.createObjectURL(xhr.response), url, xhr.response);
					} else {
						error(xhr.statusText);
						console.error(xhr.statusText);
					}
				}
				
			};
			
			 xhr.ontimeout = function () {
        		 console.error("The request for " + url + " timed out.");
				 
				 if (error !== undefined)
				 {
				 	error("The request for " + url + " timed out.");
				 }
				 
			};
			
			xhr.onerror = function(){
				console.error("error: "+xhr.statusText);
				
				if (error !== undefined)
				{
					error("error: "+xhr.statusText);
				}
				
			}
			
			xhr.open('GET', url, true);
			xhr.send();

		};
		
		return {
			download: download,
			downloadAsText: downloadAsText
		};
		
	});
	
	
	downloadr.factory('storage',['runtime', function (runtime) {
		
		// Create Base64 Object
		var Base64_={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
		
		/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = Base64._utf8_encode(input);
 
        while (i < input.length) {
 
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
 
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
 
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
 
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
        }
 
        return output;
    },
 
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
        while (i < input.length) {
 
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
 
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
 
            output = output + String.fromCharCode(chr1);
 
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
 
        }
 
        output = Base64._utf8_decode(output);
 
        return output;
 
    },
 
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var c = string.charCodeAt(n);
 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
 
        return utftext;
    },
 
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
 
        while ( i < utftext.length ) {
 
            c = utftext.charCodeAt(i);
 
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
 
        }
 
        return string;
    }
 
}
		
		var set = function (key, data, callback) {

			if (runtime === 'chrome')
			{
				chrome.storage.sync.set({key: data}, callback);
			}
			else
			{
				// Add storage strategy for other browser.
			}

		};
		
		var get = function(key, callback)
		{
			if (runtime === 'chrome')
			{
			// Try to find existing token.
				chrome.storage.sync.get(key, callback);
			}
			else
			{
				// Add storage strategy for other browser.
			}
		
		};
		
		var remove = function(key, callback) {
		
			if (runtime === 'chrome')
			{
				chrome.storage.sync.remove(key, callback);
			}
			else
			{
				// Add storage strategy for other browser.
			}
		
		};
		
		var setLocal = function (data, callback) {

			if (runtime === 'chrome')
			{
				chrome.storage.local.set(data, callback);
			}
			else
			{
				// Add storage strategy for other browser.
			}

		};
		
		var removeLocal = function(key, callback) {
		
			if (runtime === 'chrome')
			{
				chrome.storage.local.remove(key, callback);
			}
			else
			{
				// Add storage strategy for other browser.
			}
		
		};
		
		var getLocal = function(key, callback)
		{
			if (runtime === 'chrome')
			{
			// Try to find existing token.
				chrome.storage.local.get(key, callback);
			}
			else
			{
				// Add storage strategy for other browser.
			}
		
		};
		
		
		return {
			set: set,
			get: get,
			remove: remove,
			setLocal: setLocal,
			getLocal: getLocal,
			removeLocal : removeLocal,
			base64: Base64
		};
		
	}]);


	downloadr.service('util', function () {
		this.format = function (text, params) {
			var str = text.replace(/\{(.*?)\}/g, function (i, match) {
				return params[match];
			});

			return str;
		};
	});


	downloadr.service('flickr', ['$rootScope', '$http', 'HOST', function ($rootScope, $http, HOST) {

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
		};

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
		
		var signUrl = function(path, query, callback)
		{
			var url = HOST + path;
			
			// We'll support a specified callback or broadcast.
			if (callback === undefined || callback === null)
			{
				callback = onUrlSigned
			}
			
			$http.post(url, query).success(callback).error(onUrlSignedError);
		}
		
		var onUrlSignedError = function(data, status, headers, config)
		{
			console.log('Unable to sign search request: ', status);
			console.log('Error Data: ', data);
			console.log('Error Data: ', headers);

			$rootScope.$broadcast('status', {
				message: 'Service is unavailable. Please try again later. Code: ' + status
			});
		};
		
		var onUrlSigned = function (message) {
			$rootScope.$broadcast('flickr:urlsigned', {
				message: message
			});
		};
		
		var query = function(message, ok, fail)
		{
			var url = 'https://' + message.hostname + message.path;
			
			console.log('Query URL: ', url);
			console.log('Query Data: ', message);
			
			$http.post(url).success(ok).error(fail);
		}

		return {
			parseToken: parseToken,
			removeToken: removeToken,
			createMessage: createMessage,
			userId: userId,
			userName: userName,
			signUrl: signUrl,
			query: query
		};

	}]);
})();