'use strict';
// @ngInject
function Logger($log, appSettings, $rootScope) {

    // The Logger "class".
    var Logger = function (source) {
        this.source = source;
    };

    Logger.prototype = {

        _supplant: function (str, o) {
            return str.replace(
                /\{([^{}]*)\}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        },

        _getFormattedTimestamp: function (date) {
            return this._supplant('{0}-{1}-{2} {3}:{4}:{5}:{6}', [
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
                date.getMilliseconds()
            ]);
        },

        _log: function (originalFn, args) {

            if (!appSettings.logging) {
                return;
            }

            if (args.length === 0) {
                return;
            }

            var now = this._getFormattedTimestamp(new Date());
            var message = ''
            var outputObject = null;
            var outputFormat = '{0} - {1}: {2}';

            if (typeof args[0] === 'string' || typeof args[0] === 'number') {
                message = this._supplant(outputFormat, [now, this.source, args[0]]);
            }
            else {
                message = this._supplant(outputFormat, [now, this.source, '(See object output below)']);
                outputObject = args[0];
            }

            if (typeof args[1] === 'string' || typeof args[1] === 'number') {
                message += ' (' + args[1] + ')';
            }
            else if (args[1] !== undefined) {
                outputObject = args[1];
            }

            $log[originalFn].call(null, message);

            if (outputObject !== null) {
                $log[originalFn].call(null, outputObject);
            }

            if (appSettings.console) {
                $rootScope.$broadcast('log', { source: this.source, level: originalFn, message: message, object: outputObject });
            }

        },
        log: function () {
            this._log('log', arguments);
        },
        info: function () {
            this._log('info', arguments);
        },
        warn: function () {
            this._log('warn', arguments);
        },
        debug: function () {
            this._log('debug', arguments);
        },
        error: function () {
            this._log('error', arguments);
        }
    };

    function create(source) {

        // Create a new instance of the Logger.
        return new Logger(source);
    }

    return {
        Create: create
    };

};

module.exports = Logger;