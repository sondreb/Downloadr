/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

/*
  Simple wrapper for the socket.io. Hiding some of the details
  to create a new instance. Due to the individual socket pr. client
  nature of socket.io, we'll simply return the socket.io instance
  and don't do any abstractions of it's methods.
*/


function createSocket(app, settings) {
	// Expose the on handler directly from the socket.io instance.
	//exports.on = io.on;

	io.on('connection', function (socket) {

		//exports.socket = socket;

		console.log('a user connected, session id: ', socket.id);

		socket.on('disconnect', function () {
			console.log('user disconnected: ', socket.id);
		});

		//socket.on('message', function () { return "Hello World!"; });

		//io.emit('status', { text: 'Connected.' });
		//io.emit('url', { url: 'http://www.flickr.com/services/oauth/request_token' });
		//io.emit('this', { will: 'aawwwesome!!' });
		/*
    var flickrApi = require('flickr-oauth-and-upload');

    var myCallback = function (err, data) {
      if (!err) {
        console.log('Remember the credentials:');
        console.log('oauthToken: ' + data.oauthToken);
        console.log('oauthTokenSecret: ' + data.oauthTokenSecret);
        console.log('Ask user to go here for authorization: ' + data.url);

        storage.openCollection('tokens').then(function(collection) {

          // Create a new session.
          var session = { connectionId: socket.id, token: data.oauthToken, tokenSecret: data.oauthTokenSecret, tokenVerifier: '', isAccessToken: false };

          storage.insert(session, collection).then(function(document)
          {
            console.log('Document Created: ', document);
            //return storage.delete(document);
          })
          .fail(function(error){
            console.log(error);
          });

        });

        io.emit('url', {url: data.url});

      } else {
        console.log('Error: ' + err);
      }
    };*/

		/*
    var args = {
      flickrConsumerKey: configuration.get('FLICKR_KEY'),
      flickrConsumerKeySecret: configuration.get('FLICKR_SECRET'),
      permissions: 'read',
      redirectUrl: 'http://localhost:3000/auth/',
      callback: myCallback
    };

    flickrApi.getRequestToken(args);
*/

		//socket.broadcast.emit('user connected');
		//socket.broadcast.emit('this', { will: 'asdfasdfasdfadfs!!' });

		//socket.on('private message', function(from, msg){
		//  console.log('I received a private message by ', from, ' saying ', msg)
		//});



	});

	return this;

}

module.exports = function (socket, storage, flickr) {

	// Bind the socket events with the Flickr API and storage API.
	socket.on('connection', function (client) {

		client.on('message', function (msg) {
			console.log('socket.io:message: ', msg);
		});

		client.on('accessGranted', function (msg) {

			console.log('socket.io:accessGranted: ', msg);

			var token = msg.oauth_token;
			var verifier = msg.oauth_verifier;

			storage.openCollection('tokens').then(function (collection) {
				console.log('Opening collection... reading document by token..');

				var document = storage.readByToken(token, collection).then(function (document) {
					if (document === undefined) {
						console.log('This should not happen. When the user have received verified, this document should exist in the database.');
						throw new Error('Cannot find existing session. Cannot continue.');
					} else {
						var doc = document;

						console.log('Found document: ', doc);

						doc.modified = new Date();
						doc.tokenVerifier = verifier;

						var secret = doc.tokenSecret;

						flickr.getAccessToken(token, secret, verifier, function (err, message) {

							if (err) {
								throw err;
							}

							console.log('Get Access Token: ', message);

							// Return the access token to the user for local permanent storage.
							client.emit('token', message);

							// Now we should delete the session token from storage.
							// Perhaps we should have some sort of timeout, if there
							// is a connection issue with the WebSocket?

							storage.delete(doc);

						});

					}
				}).fail(function (err) {

					console.log('Failed to read document!! Error: ' + err);

				});
			});


		});


		client.on('signUrl', function (msg) {

			console.log('Sign this method: ', msg);

			flickr.signUrl(msg.token, msg.secret, msg.method, msg.args, function (err, data) {

				console.log('URL SIGNED: ', data);

				// Return the login url to the user.
				client.emit('urlSigned', data);

			});
		});

		// When user requests auth URL, generate using the Flickr service.
		client.on('getUrl', function () {

			console.log('io: User requests login url.');

			flickr.getAuthUrl(function (err, data) {

				if (err) {
					console.log('Error with getAuthUrl: ', err);
					return;
				}

				// Store these details in storage on the current client id.
				var oauthToken = data.oauthToken;
				var oauthTokenSecret = data.oauthTokenSecret;
				var clientId = client.id;

				console.log('oauthToken: ', oauthToken);
				console.log('oauthTokenSecret: ', oauthTokenSecret);
				console.log('clientId: ', clientId);

				// Return the login url to the user.
				client.emit('url', {
					url: data.url
				});

				storage.openCollection('tokens').then(function (collection) {

					console.log('COLLECTION OPENED!! Searching for: ' + clientId);

					var document = storage.readBySessionId(clientId, collection).then(function (document) {
						if (document === undefined) {
							var doc = {
								modified: new Date(),
								connectionId: clientId,
								token: oauthToken,
								tokenSecret: oauthTokenSecret,
								tokenVerifier: ''
							};

							storage.insert(doc, collection).then(function (document) {
								console.log('Saved document: ' + document);

							});
						} else {
							console.log('Found document: ' + document);

							document.modified = new Date();

							storage.update(document, collection);

						}
					}).fail(function (err) {

						console.log('Failed to read document!! Error: ' + err);

					});
				});
			});
		});
	});




	//var port = settings.port || 5000;
	//console.log('socket.io hosted on port: ', port);

	// Create the socket.io server which runs on specified port.
	//var server = require('http').Server(app);
	//var io = require('socket.io').listen(server);
	//server.listen(port);

	/*
  io.on('connection', function(client) {

    console.log('a user connected, session id: ', client.id);

    client.on('disconnect', function() {
      console.log('user disconnected: ', client.id);
    });

  });*/

	//return io;
};