/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

/*
  Simple wrapper for the socket.io. Hiding some of the details
  to create a new instance. Due to the individual socket pr. client
  nature of socket.io, we'll simply return the socket.io instance
  and don't do any abstractions of it's methods.
*/


function createSocket(app, settings)
{
  // Expose the on handler directly from the socket.io instance.
  //exports.on = io.on;

  io.on('connection', function(socket) {

    //exports.socket = socket;

    console.log('a user connected, session id: ', socket.id);

    socket.on('disconnect', function() {
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

module.exports = function(app, settings) {

  var port = settings.port || 5000;

  console.log('socket.io hosted on port: ', port);

  // Create the socket.io server which runs on specified port.
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  server.listen(port);

  /*
  io.on('connection', function(client) {

    console.log('a user connected, session id: ', client.id);

    client.on('disconnect', function() {
      console.log('user disconnected: ', client.id);
    });

  });*/

  return io;
};
