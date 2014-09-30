/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

// Before we load any requirements, we'll get the configuration loaded.
var nconf = require('nconf')
  , path = require('path');

// Load config from file, then environment.
nconf.file(path.resolve(__dirname, 'config.json')).env();

var http_port = process.env.PORT || 3000;
var websocket_port = 5000;

// Load all the dependencies.
var express = require('express')
  , app = express()
  , routes = require('./routes')
  , user = require('./routes/user')
  , auth = require('./routes/auth')
  , http = require('http')
  , nconf = require('nconf')
  , storage = require('./services/storage.js')(nconf.get('DB_HOST'), nconf.get('DB_KEY'))
  , socket = require('./services/socket.js')(app, { port: websocket_port })
  , flickr = require('./services/flickr.js')(
    nconf.get('FLICKR_KEY'),
    nconf.get('FLICKR_SECRET'),
    { url: 'http://localhost:' + http_port + '/auth/' })


// Bind the socket events with the Flickr API and storage API.
socket.on('connection', function(client) {

  client.on('message', function(msg){
    console.log('!!!! MESSAGE: ', msg);
  });

  // When user requests auth URL, generate using the Flickr service.
  client.on('getUrl', function() {

    console.log('io: User requests login url.');

    flickr.getAuthUrl(function(err, data) {

      if (err)
      {
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
      client.emit('url', data.url);

      storage.openCollection('token').then(function(collection){


        
      });

      var document = storage.readDocumentBySessionId(clientId);

    });
  });
});

// Make our storage accessible to our router
app.use(function(req,res,next){
    req.storage = storage;
    next();
});

app.configure(function(){
  app.set('port', http_port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/auth', auth.index);

http.createServer(app).listen(app.get('port'), function(){

  console.log("Express server listening on port " + app.get('port'));

});
