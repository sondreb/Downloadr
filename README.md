Flickr Downloadr 3 (3.1.105)
============

http://flickr-downloadr.com/

## Description

Elegant and simple app that allows you to search and download
photos from Flickr.com photo service.

Available on Linux, Mac and Windows, either through the Chrome Web Store or the Windows Store (Windows 10 only).

Install on the Chrome Web Store: https://chrome.google.com/webstore/detail/flickr-downloadr/fpmonoglnknhfnfgeopdjmhpilpejedj

Install on the Windows Store: (coming soon)

Screenshots

![Home Screen](/web/public/images/Flickr_Downloadr_02.png?raw=true "Home Screen")

![Results](/web/public/images/Flickr_Downloadr_06.png?raw=true "Results")

## Features
- Search for photos based upon name, the user account or groups.
- View and select photos for download.
- Download originals or high resolution photos to local disk storage.
- Supports authentication (OAuth) to search for restricted and your private photos.

- Note: The Flickr API restricts downloads to photos licensed under Creative Commons. The All Rights Reserved photos cannot be downloaded.

## Installation

The app is deployed on Chrome Web Store and can easily be installed there.
If you want to develop and modify the source code yourself, you can easily fork the GitHub repository
and then load it by going into Chrome/Settings/Extensions and choose the
"Load unpacked extension" button. Pick the "app" folder within the repository.

If you want too, you can run your own instance of the Flickr Downloadr OAuth Gateway Service, located
in the "service" folder. Make sure you replace the consumer key and secret from Flickr API, either
directly in the web.config file, or by adding your own Secret.config, or by adding the two key/value
pairs to the app settings section on your Azure Website Configure tab.

## Build

If you want to work with the source code of Flickr Downloadr, make a clone of the GitHub repository
and then run:

```sh
$ npm install
$ bower install
```

Then navigate into the "web" folder and run:

```sh
$ npm install
```

Navigate back into the root of the repository, then run the following command to open up the web
server that is required to communicate for OAuth tokens and live-reload:

```sh
$ grunt debug
```

If there is any modules that require node-gyp and you don't have Visual Studio 2010 redist installed,
you might need to append the following parameter to npm and bower install commands: --msvs_version=2013

This will download dependencies, such as Grunt, Bower, Mocha, Chai and more.

Next step is simply running Grunt, this will host the app and the service on
your local machine. It won't launch the Chrome App, you have to manually open
it. After you open the Chrome App, it should auto-reload whenever you make
any changes to the app-code.

```sh
$ grunt debug
```

## Help

- Documentation: http://flickrdownloadr.codeplex.com/documentation
- Issues: http://flickrdownloadr.codeplex.com/workitem/list/basic
- Discussions: http://flickrdownloadr.codeplex.com/discussions

## Contribute

You can contribute by uploading patches in the source code area:
http://flickrdownloadr.codeplex.com/SourceControl/latest

## Credits
- Developed by Sondre Bjellås: http://brain.no/
- Icon by HADezign: http://hadezign.com/
- Mac Icons by synetcon: http://synetcon.deviantart.com/art/OSX-Yosemite-window-buttons-459868391
- Symbols by Font Awesome: http://fontawesome.io/
- Image by Ossi Petruska: http://www.flickr.com/photos/10134557@N08/2527630813
- Components: https://angularjs.org/, https://jquery.org/, http://nodejs.org/, http://expressjs.com/, 
https://github.com/Azure/azure-documentdb-node,
https://github.com/mattiaserlo/flickr-oauth-and-upload, https://github.com/flatiron/nconf,
https://github.com/HubSpot/pace, https://github.com/khasinski/angular-mousetrap,
http://gruntjs.com/, http://ui.lumapps.com/

## License

MIT © [Sondre Bjellås](http://sondreb.com)