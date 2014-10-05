
/*
 * GET home page.
 */

exports.index = function(req, res){

  res.send('OK');
  return;


  // Handle any errors in the auth.
  if (true)
  {
    res.send('OK');
  }
  else
  {
    res.render('auth', { title: 'Express' });
  }







  var storage = req.storage;
  var flickr = req.flickr;

  console.log('WHEEE!!!!', req.storage);

  var token = req.query.oauth_token;
  var verifier = req.query.oauth_verifier;

  console.log('Token :', token);
  console.log('Verifier: ', verifier);

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

          storage.update(doc).then(function(document){

            console.log('Document updated: ', document);

            flickr.getAccessToken(token, secret, verifier, function(err, message) {

              if (err)
                {
                  throw err;
                }

              console.log('Get Access Token: ', message);

            });


          }).fail(function(err){

            console.log('Failed to update document: ', err);

          });
        }
      }
    ).fail(function(err){

      console.log('Failed to read document!! Error: ' + err);

    });
  });


};
