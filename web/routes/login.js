/*
 * GET URL
 */

var tokens = [];

exports.index = function (req, res) {

	res.json({ url: "https://www.flickr.com/" });
	
};

exports.exchange = function(req, res)
{
	var flickr = req.flickr;
	var storage = req.storage;
	
	var msg = req.body;
	
	var requestToken = msg.oauth_token;
	var requestTokenVerifier = msg.oauth_verifier;
	var requestTokenSecret = null;

	for (var i=0; i<tokens.length; i++) {

		var t = tokens[i];
		
		if (t.requestToken === requestToken)
		{
			requestTokenSecret = t.requestTokenSecret;
			
			// Remove the token from array.
			tokens.splice(i, 1);
			
			break;
		}
	}

	if (requestTokenSecret === null)
	{
		throw new Error('Cannot find existing request token. Cannot continue. Please try again.');
	}
	
	flickr.getAccessToken(requestToken, requestTokenSecret, requestTokenVerifier, function (err, message) {

		if (err) {
			throw err;
		}

		console.log('Get Access Token: ', message);

		// Return the access token to the user for local permanent storage.
		res.json(message);
		
		// Insert access token if not already exists.
		storage.openCollection('tokens').then(function (collection) {

			var document = storage.readByToken(message.oauthToken, collection).then(function (document) {
				
				if (document === undefined) {
					var doc = {
						modified: new Date(),
						token: message.oauthToken,
						secret: message.oauthTokenSecret,
						userNsId: message.userNsId,
						userName: message.userName,
						ip: req.ip
					};
					
					storage.insert(doc, collection).then(function (document) {
						console.log('Saved document: ' + document);
					});
				} else {
					console.log('Found document: ' + document);
					//document.modified = new Date();
					//storage.update(document, collection);

				}
			}).fail(function (err) {

				console.log('Failed to read document!! Error: ' + err);

			});
		});
		
		/*
		var doc = {
						modified: new Date(),
						requestToken: oauthToken,
						requestTokenSecret: oauthTokenSecret,
						ip: req.ip
					};
		
		
		doc.authToken = message.oauthToken;
		doc.authTokenSecret = message.oauthTokenSecret;
		doc.userName = message.userName;
		doc.userNsId = message.userNsId;
		doc.ip = req.ip;

		storage.update(doc, collection);*/
		//storage.delete(doc);

	});
	
	/*
	storage.openCollection('tokens').then(function (collection) {
		console.log('Opening collection... reading document by token..');
		
		var document = storage.readByRequestToken(token, collection).then(function (document) {
			if (document === undefined) {
				console.log('This should not happen. When the user have received verified, this document should exist in the database.');
				throw new Error('Cannot find existing session. Cannot continue.');
			} else {
				var doc = document;



			}
		}).fail(function (err) {

			console.log('Failed to read document!! Error: ' + err);

		});
	});*/
};

exports.url = function (req, res) {

	var flickr = req.flickr;
	var storage = req.storage;
	
	var cleanUpTokens = function()
	{
		console.log('cleaning up tokens...', tokens.length);
		
		for (var i=0; i<tokens.length; i++) {

			var token = tokens[i];
			
			var diffSeconds = (new Date() - token.date) / 1000;
			console.log('diff: ', diffSeconds);
			
			// Let's keep the tokens in-memory for 30 minutes. If user have not authorized
			// within that timeframe, we'l delete it from memory.
			if (diffSeconds > 1800)
			{
				console.log('Removing Request Token from memory due to inactivity');
				console.log('Request Token: ', token);
				tokens.splice(i, 1);
			}
		}
	};
	
	flickr.getAuthUrl(function (err, data) {

		if (err) {
			console.log('Error with getAuthUrl: ', err);
			return;
		}

		var oauthToken = data.oauthToken;
		var oauthTokenSecret = data.oauthTokenSecret;

		console.log('oauthRequestToken: ', oauthToken);
		console.log('oauthRequestTokenSecret: ', oauthTokenSecret);
		
		// We'll store the requestToken and requestTokenSecret in-memory temporarely.
		
		var requestToken = { 	requestToken: oauthToken,
								requestTokenSecret: oauthTokenSecret,
						   		date: new Date() 
							};
		
		// Add the new request token.
		tokens.push(requestToken);
		console.log('Token added to array. Length: ', tokens.length);
		
		// Clean up old request tokens.
		cleanUpTokens();
		
		// Return the login URL to the user.
		res.json({ url: data.url });
		
		/*
		storage.openCollection('tokens').then(function (collection) {

			console.log('COLLECTION OPENED!! Searching for: ' + oauthToken);

			var document = storage.readByRequestToken(oauthToken, collection).then(function (document) {
				if (document === undefined) {
					var doc = {
						modified: new Date(),
						requestToken: oauthToken,
						requestTokenSecret: oauthTokenSecret,
						ip: req.ip
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
		});*/
	});
};
