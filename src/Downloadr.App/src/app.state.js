// Instead of putting objects on the $rootScope, we'll have a state value in app.value.
// This file returns the default state with description of all the available fields.

var state = {
    user: null, // During authentication, this field will be populated with result from getInfo.
    userId: null, // The current user ID.
    authenticated: false,
    buddyIcon: '', // Base64-encoded URL for small buddy icon.
    buddyIconLarge: '',  // Base64-encoded URL for large buddy icon.
    buddyIconUrl: '',
    testValue: 'Hello World',
    previousState: 'home',
    targetEntry: null,
    targetPath: '',
    searchText: '',
    pageSize: '50',
    pageSizeGalleries: '50',
};

module.exports = state;