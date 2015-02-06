/*!
 * Flickr Downloadr
 * Copyright: 2007-2015 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

// Before we load any requirements, we'll get the configuration loaded.
var nconf = require('nconf'),
	path = require('path');

// Load config from file, then environment.
nconf.file(path.resolve(__dirname, 'config.json')).env();

var http_port = process.env.PORT || 3000;

// Load all the dependencies.
var express = require('express'),
	app = express(),
	routes = require('./routes'),
	user = require('./routes/user'),
	auth = require('./routes/auth'),
	logger = require('morgan'),
	multer = require('multer'),
	methodOverride = require('method-override'),
	favicon = require('serve-favicon'),
	bodyParser = require('body-parser'),
	errorHandler = require('errorhandler')
	//  , http = require('http')
	,
	nconf = require('nconf'),
	storage = require('./services/storage.js')(
		nconf.get('DB_HOST'),
		nconf.get('DB_KEY'),
		'downloadr'),
	flickr = require('./services/flickr.js')(
		nconf.get('FLICKR_KEY'),
		nconf.get('FLICKR_SECRET'), {
			url: 'http://localhost:' + http_port + '/auth/'
		})


// Make our objects accessible to our routers
app.use(function (req, res, next) {
	req.storage = storage;
	req.flickr = flickr;
	next();
});

app.set('port', http_port);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//app.use(express.bodyParser());
//app.use(express.methodOverride());

app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));


//app.get('/', routes.index);
//app.get('/users', user.list);
app.get('/auth', auth.index);

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
	app.use(errorHandler());
}

var server = app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);
var socket = require('./services/socket.js')(io, storage, flickr)