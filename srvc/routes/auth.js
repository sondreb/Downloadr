
/*
 * GET home page.
 */

exports.index = function(req, res){

  // Get path to the correct config.json.
  //var configPath = path.resolve(__dirname, 'config.json');

  // Load config from file, then environment.
  //nconf.file(configPath).env();

  console.log('WHEEE!!!!', req.storage);

  var token = req.query.oauth_token;
  var verifier = req.query.oauth_verifier;

  console.log('Token :', req.query.oauth_token);
  console.log('Verifier: ', req.query.oauth_verifier);

    storage.openCollection('tokens').then(function(collection) {

    console.log('Opening collection... reading document by token..');

      storage.readDocumentByToken(token).then(document)
      {
        console.log('FOUND!!', document);
      };

    });

  var flickrApi = require('flickr-oauth-and-upload');

  var myCallback = function (err, data) {
    if (!err) {

      console.log('Access Token:');
      console.log(data);

      //io.emit('url', {url: data.url});

    } else {
      console.log('Error: ' + err);
    }
  };

  var secret = '';

  var args = {
    flickrConsumerKey: nconf.get('FLICKR_KEY'),
    flickrConsumerKeySecret: nconf.get('FLICKR_SECRET'),
    oauthToken: token,
    oauthTokenSecret: secret,
    oauthVerifier: verifier,
    callback: myCallback
  };

  //flickrApi.useRequestTokenToGetAccessToken(args);


  // Handle any errors in the auth.
  if (true)
  {
    res.send('OK');
  }
  else
  {
    res.render('auth', { title: 'Express' });
  }
};
