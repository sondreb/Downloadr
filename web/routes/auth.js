/*
 * GET home page.
 */

exports.index = function (req, res) {

	var storage = req.storage;
	var flickr = req.flickr;

	var token = req.query.oauth_token;
	var verifier = req.query.oauth_verifier;

	console.log('Token :', token);
	console.log('Verifier: ', verifier);

	// We could show error messages to users at this
	// time if the auth did not succeed?

	// Handle any errors in the auth.
	if (true) {
		res.send('OK');
	} else {
		res.render('auth', {
			title: 'Express'
		});
	}

};