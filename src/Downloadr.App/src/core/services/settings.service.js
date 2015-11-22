'use strict';
// @ngInject
function Settings($rootScope, $timeout, storage, runtime, userSettings) {

    $rootScope.$watch(function () { return userSettings; }, changed, true);

	var load = function () {

	    storage.get('settings', function (result) {

	        // When we load, we can't replace the whole "values" object, as that
	        // will remove link between controllers and this service.

	        // Setting keys have been chosen to be small and simple for
	        // simplicity. Might not all be self-descriptive, but easy to learn.

	        if (result === undefined || result === null || result.settings === undefined || result.settings === null || Object.keys(result.settings).length === 0) // Checks null and undefined
	        {
	            userSettings.darkTheme = true;
	            userSettings.keepOpen = true;

	            userSettings.safe = '1';
	            userSettings.size = 'o';
	            userSettings.sort = 'relevance';
	            userSettings.license = '1,2,3,4,5,6,7,8';
	            userSettings.view = 'large';
	            userSettings.background = true;
	            userSettings.debug = true;
	            userSettings.progress = true;
	            userSettings.completed = true;
	            userSettings.type = 'photos';

	            console.log('Default Settings Set:');
	            console.log(userSettings);

	            // Persist the default settings.
	            save();

	        } else {

	            var settings = result.settings;

	            userSettings.darkTheme = settings.darkTheme;
	            userSettings.keepOpen = settings.keepOpen;
	            userSettings.safe = settings.safe;
	            userSettings.size = settings.size;
	            userSettings.sort = settings.sort;
	            userSettings.license = settings.license;
	            userSettings.view = settings.view;
	            userSettings.background = settings.background;
	            userSettings.debug = settings.debug;
	            userSettings.progress = settings.progress;
	            userSettings.completed = settings.completed;
	            userSettings.type = settings.type;

	            console.log('User Settings Loaded:');
	            console.log(userSettings);

	        }

            // Hook up to changes on the userSettings, so we can easily save whenever changed.
	        $rootScope.$watch(function () { return userSettings; }, changed, true);

	        $rootScope.$broadcast('Settings:Loaded');

	    });
	    
	};

	var changed = function (newVal, oldVal) {
	    console.log('CHANGED!!!');
	    save();
	};

	var save = function () {

	    storage.set('settings', userSettings, function () {
	        console.log('Settings saved in storage...');
	        $rootScope.$broadcast('settings:changed');
	    });

	};

	// Before we return the service, we'll load the settings if they exists.
	//load();

	return {
		load: load,
		save: save
	};

};

module.exports = Settings;