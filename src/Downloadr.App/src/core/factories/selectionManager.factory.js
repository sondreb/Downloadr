'use strict';

var _ = require('underscore');

// @ngInject
function selectionManager($rootScope, userSettings) {

    // This is the complete collection of items to be downloaded, including photos, albums and galleries.
    var items = [];

    var state = {
        count: 0
    };

    var license = userSettings.license;
    var size = userSettings.size;

    var remove = function (item) {
        items = _.without(items, item);
    };

    var add = function (item) {
        items.push(item);
    };

    var clear = function () {

        console.log('CLEAR WAS CALLED ON DOWNLOAD MANAGER!');

        // First make sure we remove selection to update the UI.
        items.forEach(function (item) {
            item.selected = false;
        });

        // Remove all items by clearing the array.
        //items = [];
        items.length = 0;

        // Update the count to zero.
        state.count = 0;

    };

    // The manager will listen to the selection changed event and update accordingly.
    $rootScope.$on('Event:SelectedItemChanged', function (event, data) {

        console.log('$on:Event:SelectedItemChanged', data);

        if (data.selected) {
            add(data.item);
        }
        else {
            remove(data.item);
        }

        console.log('Currently Selected: ');

        var selectedCount = 0;

        items.forEach(function (item) {
            console.log(item);

            if (item.count !== undefined) {
                selectedCount += item.count;
            }
            else {
                selectedCount += 1;
            }

        });

        state.count = selectedCount;

    });

    return {
        state: state,
        items: items,
        add: add,
        remove: remove,
        clear: clear,
        license: license,
        size: size
    };

};

module.exports = selectionManager;