/*
 * GET URL
 */

exports.index = function (req, res) {

	res.json({ url: "https://www.flickr.com/" });
	
};

exports.exchange = function(req, res)
{
	var flickr = req.flickr;
	var storage = req.storage;
	
	var msg = req.body;
	
	console.log('socket.io:accessGranted: ', msg);
	
	var token = msg.oauth_token;
	var verifier = msg.oauth_verifier;

	storage.openCollection('tokens').then(function (collection) {
		console.log('Opening collection... reading document by token..');
		
		var document = storage.readByRequestToken(token, collection).then(function (document) {
			if (document === undefined) {
				console.log('This should not happen. When the user have received verified, this document should exist in the database.');
				throw new Error('Cannot find existing session. Cannot continue.');
			} else {
				var doc = document;

				console.log('Found document: ', doc);

				doc.modified = new Date();
				doc.requestTokenVerifier = verifier;
				
				var secret = doc.requestTokenSecret;
				
				flickr.getAccessToken(token, secret, verifier, function (err, message) {

					if (err) {
						throw err;
					}

					console.log('Get Access Token: ', message);

					// Return the access token to the user for local permanent storage.
					res.json(message);
					
					doc.authToken = message.oauthToken;
					doc.authTokenSecret = message.oauthTokenSecret;
					doc.userName = message.userName;
					doc.userNsId = message.userNsId;
					
					storage.update(doc, collection);
					//storage.delete(doc);
					
				});

			}
		}).fail(function (err) {

			console.log('Failed to read document!! Error: ' + err);

		});
	});
};

exports.url = function (req, res) {

	var flickr = req.flickr;
	var storage = req.storage;
	
	flickr.getAuthUrl(function (err, data) {

		if (err) {
			console.log('Error with getAuthUrl: ', err);
			return;
		}

		// Store these details in storage on the current client id.
		var oauthToken = data.oauthToken;
		var oauthTokenSecret = data.oauthTokenSecret;
		//var clientId = client.id;

		console.log('oauthRequestToken: ', oauthToken);
		console.log('oauthRequestTokenSecret: ', oauthTokenSecret);
		//console.log('clientId: ', clientId);

		res.json({ url: data.url });
		
		storage.openCollection('tokens').then(function (collection) {

			console.log('COLLECTION OPENED!! Searching for: ' + oauthToken);

			var document = storage.readByRequestToken(oauthToken, collection).then(function (document) {
				if (document === undefined) {
					var doc = {
						modified: new Date(),
						requestToken: oauthToken,
						requestTokenSecret: oauthTokenSecret,
						requestTokenVerifier: ''
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
};
