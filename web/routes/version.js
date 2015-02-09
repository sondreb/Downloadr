exports.index = function (req, res) {

	var pjson = require('../package.json');
	res.json({ version: pjson.version });
	
};

