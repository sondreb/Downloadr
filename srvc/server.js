/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , auth = require('./routes/auth')
  , http = require('http')
  , path = require('path')
  , nconf = require('nconf')
  , storage = new require('./services/storage.js');


// Get path to the correct config.json.
var configPath = path.resolve(__dirname, 'config.json');

// Load config from file, then environment.
nconf.file(configPath).env();

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

/*
var OAuth= require('oauth').OAuth;

var oa = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	"YourConsumerKeyProvidedByTwitter",
	"YourConsumerSecretProvidedByTwitter",
	"1.0",
	"http://yourdomain/auth/twitter/callback",
	"HMAC-SHA1"
);
*/

server.listen(5000);

io.on('connection', function(socket) {
  console.log('a user connected, session id: ', socket.id);

  socket.on('message', function () { return "Hello World!"; });

  io.emit('status', { text: 'Connected.' });
  //io.emit('url', { url: 'http://www.flickr.com/services/oauth/request_token' });
  //io.emit('this', { will: 'aawwwesome!!' });

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
  };

  var args = {
    flickrConsumerKey: nconf.get('FLICKR_KEY'),
    flickrConsumerKeySecret: nconf.get('FLICKR_SECRET'),
    permissions: 'read',
    redirectUrl: 'http://localhost:3000/auth/',
    callback: myCallback
  };

  flickrApi.getRequestToken(args);


  //socket.broadcast.emit('user connected');
  //socket.broadcast.emit('this', { will: 'asdfasdfasdfadfs!!' });

  socket.on('private message', function(from, msg){
    console.log('I received a private message by ', from, ' saying ', msg)
  });

  socket.on('disconnect', function() {

    console.log('user disconnected');

  });

});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
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


  // The environment variables should be configured as app settings on
  // the Azure Website.
  var host = nconf.get('DB_HOST');
  var key = nconf.get('DB_KEY');

  console.log("DocumentDB host: " + host);

  storage.openDatabase('downloadr', host, key).then(function()
  {
    console.log('Database opened successfully.');

    //storage.cleanup();
    //return;

    return storage.openCollection('tokens');
  })
  .then(function(collection)
  {
    /*
    var session = { connectionId: '222', token: '', tokenSecret: '', isAccessToken: false };

    storage.insert(session, collection).then(function(document)
    {
      console.log('Document Created: ', document);
      return storage.delete(document);
    })
    .fail(function(error){
      console.log(error);
    });*/

    storage.list(collection).then(function(documents){
      console.log('All Documents: ', documents);
    })
    .fail(function(error){
      console.log(error);
    });

  })
  .fail(function(error){
    console.log(error);
  });

/*
  var database, colletion, document;

  client.createDatabaseAsync(databaseDefinition)
    .then(function(databaseResponse) {
      database = databaseResponse.resource;
      return client.createCollectionAsync(database._self, collectionDefinition);
    })
    .then(function(collectionResponse)
    {
      collection = collectionResponse.resource;
      return client.createDocumentAsync(collection._self, documentDefinition);
    })
    .then(function(documentResponse) {
      var document = documentResponse.resource;
      console.log('Created Document: ', document);
      cleanup(client, database);
    })
    .fail(function(error){
      console.log('An error occcured', error);
    });

*/

  /*

  SIMPLE DOCUMENT CREATION WITH CALLBACK.

  var client = new DocumentClient(host, {masterKey: key});
  var databaseDefinition = { id: 'downloadr' };
  var collectionDefinition = { id: 'tokens' };
  var documentDefinition = { connectionId: '12345', token: '', tokenSecret: '', isAccessToken: false };

  client.createDatabase(databaseDefinition, function(err, database) {
    if (err) return console.log(err);

    console.log('Created DocumentDB');

    client.createCollection(database._self, collectionDefinition, function(err, collection) {
      if (err) return console.log(err);
      console.log('Created Collection');

      client.createDocument(collection._self, documentDefinition, function(err, document) {
        if (err) return console.log(err);

        console.log('Created document with content: ', document);

      });

    });
  });


  function cleanup(client, database)
  {
    client.deleteDatabase(database._self, function(err) {
      if (err) console.log(err);
    });
  }


  */

  console.log("DocumentDB Initialized Successfully.");

});
