Flickr Downloadr Development Notes
============

## Introduction:

This document tries to explain technical developer details that is usefull
for future references. This document also have some guidelines for any
developers who want to contribute.

# Tools:

There are some requirements and some suggestions on software you should use
when developing on this app.

Requirements:
- Node.JS
- Grunt
- Bower

Suggestions:
- Brackets (Text editor)

Brackets extensions:
- JSHint
- Brackets Git
- Brackets File Icons
- QuickDocsJS
- Stylus Extension for Brackets

## Icons:

Icons are SVG-based (vector) and their are processed by this command:

```sh
$ grunt svgstore
```

This will generate the icons.svg within the images/icons folder, based upon
all the individual .svg files located in the images/icons/svg folder.

To update the icons in the app, take the content from the generated file
and paste it into the beginning of the body in the index.html file.

(Until we find a grunt task that can inject the output into the html file,
this have to be done manually)

## Architecture:

The solution is built with a server part built on Node.js and hosted on
Azure Websites. This is required to keep the private keys secure.

The client is built on HTML5 technologies and to access private photos,
the user needs to authenticate with the Flickr service through the
service built in this project.

## Layers and Services:

storage.js - Stores and queries persistent data.
socket.js - Establishes connections and handle communication with clients.
flickr.js - Handles queries against Flickr.com and authentication.

## Building:

grunt

Will run first test, then the build process.

grunt build

This command will run the build process, creating the .zip output for uploading.

grunt debug

This will readify the app to be auto-reloaded as a Chrome App.

Note that this command will not auto-launch your Chrome App, you still need to
manually register the app under the Extensions on Chrome. You should select
the "app" folder, not the dist or other folders.

grunt debug:Server

This will rund the app in the browser.

## Service:

The service requires some configuration settings (app settings). These are
normally configured as environment variables on Microsoft Azure. For local
development, make a copy of the config.example and name it config.json
within the web folder.

Remember, the config.json is excluded from the repo to make sure no secrets
or passwords is exposed publicly in the git repo.

## Security:

- The service should be hosted using a secure channel like HTTPS.

## Notes:

To add a new JavaScript component, run the following node command:

bower install jquery --save

This will download the jquery library and save the bower.json file.

After this, you can run the following command to update links in index.html:

grunt wiredep

The bower.json currently is setup to take the latest version of all
dependencies. While this is good for active development, it might be a problem
in the future. Consider adding specific versions at a later time.

### Screenshots:

Screenshots taken for the app store is taken at 125% text resolution on the desktop.
The size of the window should then be 1024x615, which should result in files in the size
of 1280x800, which is the correct size for Chrome Web Store.

### console.log:

This code should be used to override the console in the release package:

```javascript
if (!window.console) window.console = {};
var methods = ["log", "debug", "warn", "info"];
for (var i = 0; i < methods.length; i++) {
    console[methods[i]] = function () { };
}
```


# UI:

The UI have been built on Material-design with AngularJS. Here are some resources
that is helpful in learning and understanding Material design:

http://www.google.com/design/spec/style/color.html#color-color-palette
https://material.angularjs.org/
