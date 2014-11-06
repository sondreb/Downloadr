/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

// Before we load any requirements, we'll get the configuration loaded.
var nconf = require('nconf'),
	path = require('path');

// Load config from file, then environment.
nconf.file(path.resolve(__dirname, 'config.json')).env();

var assert = require("assert"),
	should = require('chai').should(),
	storage = require('../services/storage.js')(nconf.get('DB_HOST'), nconf.get('DB_KEY'), 'downloadr'),
	nconf = require('nconf'),
	path = require('path'),
	chaiAsPromised = require("chai-as-promised"),
	chai = require('chai')

chai.use(chaiAsPromised);

describe('Array', function () {
	describe('#indexOf()', function () {
		it('should return -1 when the value is not present', function () {
			assert.equal(-1, [1, 2, 3].indexOf(5));
			assert.equal(-1, [1, 2, 3].indexOf(0));
		})
	})
})

describe('Storage', function () {

	// Since storage is a singleton, after running this first task we won't
	// have to re-open the database.
	describe('openDatabase', function () {
		it('should not return error', function (done) {
			storage.openDatabase('downloadr').should.be.fulfilled.and.notify(done);
		})
	})

	// Get the tokens collection and verify.
	describe('openCollection', function () {
		it('should not return error', function (done) {
			storage.openCollection('tokens').should.be.fulfilled.and.notify(done);
			//storage.openCollection('tokens').should.be.rejected.and.notify(done);
		})
	})

	describe('openDocument', function () {
		it('should not return error', function () {

			return storage.openCollection('tokens').then(function (collection) {

				return storage.readByToken('72157647688791676-0476982f92e0c9c3', collection).then(function (document) {

				});
			})
		})
	})
})