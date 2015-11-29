Flickr Downloadr 3 (3.1.106)
============

http://flickr-downloadr.com/

## Description:

Elegant and simple app that allows you to search and download
photos from Flickr.com photo service.

Install on the Chrome Web Store: https://chrome.google.com/webstore/detail/flickr-downloadr/fpmonoglnknhfnfgeopdjmhpilpejedj

Screenshots

![Home Screen](/web/public/images/store/downloadr-screenshot-05.png?raw=true "Home Screen")

![Results](/web/public/images/store/downloadr-screenshot-06.png?raw=true "Results")

## Features:
- Search for photos based upon name, the user account or groups.
- View and select photos for download.
- Download originals or high resolution photos to local disk storage.
- Supports authentication (OAuth) to search for restricted and your private photos.
- Note: The Flickr API restricts downloads to photos licensed under Creative Commons. The All Rights Reserved photos cannot be downloaded.

## Installation:

The app is deployed on Chrome Web Store and can easily be installed there.
If you want to develop and modify the source code yourself, you can easily fork the GitHub repository
and then load it by going into Chrome/Settings/Extensions and choose the
"Load unpacked extension" button. Pick the "app" folder within the repository.

If you want too, you can run your own instance of the Flickr Downloadr OAuth Gateway Service, located
in the "service" folder. Make sure you replace the consumer key and secret from Flickr API, either
directly in the web.config file, or by adding your own Secret.config, or by adding the two key/value
pairs to the app settings section on your Azure Website Configure tab.

## Build:

If you want to work with the source code of Flickr Downloadr, make a clone of the GitHub repository
and then run:

```sh
$ npm install
```

Then navigate into the "web" folder and run:

```sh
$ npm install
```

Navigate back into the root of the repository, then run the following command to open up the web
server that is required to communicate for OAuth tokens and live-reload:

```sh
$ gulp
```

If there is any modules that require node-gyp and you don't have Visual Studio 2010 redist installed,
you might need to append the following parameter to npm and bower install commands: --msvs_version=2013

This will download dependencies, such as Grunt, Bower, Mocha, Chai and more.

Next step is simply running Grunt, this will host the app and the service on
your local machine. It won't launch the Chrome App, you have to manually open
it. After you open the Chrome App, it should auto-reload whenever you make
any changes to the app-code.

```sh
$ gulp package
```

## Platforms

This app is coded and configured in such a way that it compiles to the maximum
amount of supported platforms.

- Chrome Web App (Windows, Mac, Linux, Chrome OS)
- Open Web Apps for Desktop (FireFox, Windows, Mac, Linux)
- Cordova (Windows 10, Android, iOS)
- Electron (Windows, Mac)

As of now, the app is only distributed on the Chrome Web Store.

### Fonts

For Windows, the application will use Segoe UI font type, and for
other OS it will use Helvetica Neue if available, or Roboto, which is
the default font for Chrome OS and is additionally a font that is embedded
into the application.

## Help:

- Documentation: https://github.com/sondreb/Downloadr/wiki
- Issues: https://github.com/sondreb/Downloadr/issues

## Contribute:

You can contribute by uploading patches in the source code area:
https://github.com/sondreb/Downloadr

## Credits:
- Developed by Sondre Bjellås: http://brain.no/
- Icon by [HADezign](http://hadezign.com/)
- Wallpaper by [Ossi Petruska](https://www.flickr.com/photos/10134557@N08/2527630813)
- Components: https://angularjs.org/, https://jquery.org/, http://nodejs.org/, http://expressjs.com/, 
https://github.com/Azure/azure-documentdb-node,
https://github.com/mattiaserlo/flickr-oauth-and-upload, https://github.com/flatiron/nconf, 
https://github.com/khasinski/angular-mousetrap,
http://gulpjs.com/, https://github.com/winjs/angular-winjs

## License (MIT):

Copyright (C) 2007-2015 Sondre Bjellås - http://sondreb.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
