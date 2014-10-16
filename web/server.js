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
  , logger = require('morgan')
  , multer = require('multer')
  , methodOverride = require('method-override')
  , favicon = require('serve-favicon')
  , bodyParser = require('body-parser')
  , errorHandler = require('errorhandler')
//  , http = require('http')
  , nconf = require('nconf')
  , storage = require('./services/storage.js')(
    nconf.get('DB_HOST'),
    nconf.get('DB_KEY'),
    'downloadr')
  , socket = require('./services/socket.js')(app, { port: websocket_port })
  , flickr = require('./services/flickr.js')(
    nconf.get('FLICKR_KEY'),
    nconf.get('FLICKR_SECRET'),
    { url: 'http://localhost:' + http_port + '/auth/' })


// Bind the socket events with the Flickr API and storage API.
socket.on('connection', function(client) {

  client.on('message', function(msg){
    console.log('socket.io:message: ', msg);
  });

  client.on('accessGranted', function(msg) {

    console.log('socket.io:accessGranted: ', msg);

    var token = msg.oauth_token;
    var verifier = msg.oauth_verifier;

    storage.openCollection('tokens').then(function(collection) {
    console.log('Opening collection... reading document by token..');

    var document = storage.readByToken(token, collection).then(function(document) {
          if (document === undefined)
          {
              console.log('This should not happen. When the user have received verified, this document should exist in the database.');
              throw new Error('Cannot find existing session. Cannot continue.');
          }
          else
          {
            var doc = document;

            console.log('Found document: ', doc);

            doc.modified = new Date();
            doc.tokenVerifier = verifier;

            var secret = doc.tokenSecret;

            flickr.getAccessToken(token, secret, verifier, function(err, message) {

              if (err)
              {
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
        }
      ).fail(function(err){

        console.log('Failed to read document!! Error: ' + err);

      });
    });


  });


  client.on('signUrl', function(msg) {

    console.log('Sign this method: ', msg);

    flickr.signUrl(msg.token, msg.secret, msg.method, msg.args, function(err, data) {

    console.log('URL SIGNED: ', data);

    // Return the login url to the user.
    client.emit('urlSigned', data);

   });
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
      client.emit('url', { url: data.url});

      storage.openCollection('tokens').then(function(collection){

        console.log('COLLECTION OPENED!! Searching for: ' + clientId);

        var document = storage.readBySessionId(clientId, collection).then(function(document) {
            if (document === undefined)
            {
                var doc = { modified: new Date(), connectionId: clientId, token: oauthToken, tokenSecret: oauthTokenSecret, tokenVerifier: '' };

                storage.insert(doc, collection).then(function(document){
                  console.log('Saved document: ' + document);

                });
            }
            else
            {
              console.log('Found document: ' + document);

                document.modified = new Date();

                storage.update(document, collection);

            }
          }
        ).fail(function(err){

          console.log('Failed to read document!! Error: ' + err);

        });
      });
    });
  });
});

// Make our objects accessible to our routers
app.use(function(req,res,next){
    req.storage = storage;
    req.flickr = flickr;
    next();
});

app.set('port', http_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.bodyParser());
//app.use(express.methodOverride());

app.use(multer());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', routes.index);
app.get('/users', user.list);
app.get('/auth', auth.index);

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/*
http.createServer(app).listen(app.get('port'), function(){

  console.log("Express server listening on port " + app.get('port'));

});*/
