Flickr Downloadr Development Notes
============

## Introduction:

This document tries to explain technical developer details that is usefull
for future references. This document also have some guidelines for any
developers who want to contribute.

## Architecture:

The solution is built with a server part built on ASP.NET and hosted on
Azure Websites. This is required to keep the private keys secure.

The client is built on HTML5 technologies and to access private photos,
the user needs to authenticate with the Flickr service through the
Flickr Token Hub built in this project.

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

## Notes:

To add a new JavaScript component, run the following node command:

bower install jquery --save

This will download the jquery library and save the bower.json file.

After this, you can run the following command to update links in index.html:

grunt bowerInstall

The bower.json currently is setup to take the latest version of all
dependencies. While this is good for active development, it might be a problem
in the future. Consider adding specific versions at a later time.
