var assert = require("assert")
  , should = require('chai').should()
  , storage = require('../services/storage')
  , nconf = require('nconf')
  , path = require('path')
  , chaiAsPromised = require("chai-as-promised")
  , chai = require('chai')

chai.use(chaiAsPromised);

// Get path to the correct config.json.
var configPath = path.resolve(__dirname, 'config.json');

// Configure the test environment. Keep a copy of the config.json within the
// test folder, so we can have mocked or test environments configured.
nconf.file(configPath).env();

// The environment variables should be configured as app settings on
// the Azure Website.
var host = nconf.get('DB_HOST');
var key = nconf.get('DB_KEY');

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})

describe('Storage', function() {

  // Since storage is a singleton, after running this first task we won't
  // have to re-open the database.
  describe('openDatabase', function() {
    it('should not return error', function(done) {
      storage.openDatabase('downloadr', host, key).should.be.fulfilled.and.notify(done);
    })
  })

  // Get the tokens collection and verify.
  describe('openCollection', function() {
    it('should not return error', function(done) {
      storage.openCollection('tokens').should.be.fulfilled.and.notify(done);
      //storage.openCollection('tokens').should.be.rejected.and.notify(done);
    })
  })

  describe('openDocument', function() {
    it('should not return error', function() {

      return storage.openCollection('tokens').then(function(collection) {

        return storage.readDocumentByToken('72157647688791676-0476982f92e0c9c3', collection).then(function(document) {

        });
      })
    })
  })
})
