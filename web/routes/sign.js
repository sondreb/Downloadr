exports.url = function (req, res) {

	var flickr = req.flickr;
	var storage = req.storage;
	
	var msg = req.body;

	flickr.signUrl(msg.token, msg.secret, msg.method, msg.args, function (err, data) {

		console.log('URL SIGNED: ', data);
		res.json(data);

	});
	
};