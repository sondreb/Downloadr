/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

var flickrApi = require('flickr-oauth-and-upload');
var oauth_token = '';
var _key, _secret, _url = null;

/*
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

var search = function(text)
{


}

var getAuthUrl = function(cb)
{
  console.log("!!!!!!!!!!!!!");

  var args = {
    flickrConsumerKey: _key,
    flickrConsumerKeySecret: _secret,
    permissions: 'read',
    redirectUrl: _url,
    callback: cb
  };

  console.log(args);

  flickrApi.getRequestToken(args);
}

module.exports = function(key, secret, settings)
{
  var port = settings.port || 3000;

  _url = settings.url || 'http://localhost:' + port + '/auth/';
  _key = key;
  _secret = secret;

  console.log('Flickr Service configured: ');
  console.log(' URL: ', _url);
  console.log(' KEY: ', _key);
  console.log(' SECRET: ', _secret);

  return {
      getAuthUrl: getAuthUrl,
      search: search
      }
};
