/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

'use strict';

/**
 * Storage Service for DocumentDB. This service relies on Q promises.
 */

var Q = require('q'),
	DocumentClient = require('documentdb').DocumentClient;

var _client, _database, _host, _key = null;

// if the database does not exist, then create it, else return the database object
var readOrCreateDatabase = function (databaseId) {

	var deferred = Q.defer();

	var query = _client.queryDatabases('SELECT * FROM root r WHERE r.id="' + databaseId + '"').toArray(function (err, results) {

		if (err) {
			deferred.reject(err);
			return;
		}

		if (!err && results.length === 0) {
			// no error occured, but there were no results returned
			// indicating no database exists matching the query
			_client.createDatabase({
				id: databaseId
			}, function (err, database) {

				if (err) {
					deferred.reject(err);
				} else {
					_database = database;
					deferred.resolve(_database);
				}

			});
		} else {
			// we found a database
			_database = results[0];
			deferred.resolve(_database);
		}

	});

	return deferred.promise;
};

// if the collection does not exist for the database provided, create it, else return the collection object
var readOrCreateCollection = function (collectionId) {

	var deferred = Q.defer();

	if (_database === null) {
		throw new Error('The database has not been loaded. Call openDatabase first.');
	}

	_client.queryCollections(_database._self, 'SELECT * FROM root r WHERE r.id="' + collectionId + '"').toArray(function (err, results) {
		if (err) {
			// some error occured, rethrow up
			deferred.reject(err);
			return;
		}
		if (!err && results.length === 0) {
			// no error occured, but there were no results returned
			//indicating no collection exists in the provided database matching the query
			_client.createCollection(_database._self, {
				id: collectionId
			}, function (err, createdCollection) {
				deferred.resolve(createdCollection);
			});
		} else {
			// we found a collection
			deferred.resolve(results[0]);
		}
	});

	return deferred.promise;

};

var readDocuments = function (collection) {

	console.log('readDocuments:', collection.id);

	var deferred = Q.defer();

	/*
      _client.queryDocuments(collection._self, 'SELECT * FROM root r').toArray(function (err, docs) {
        if (err) {
          deferred.reject(err);
          return;
        }

        deferred.resolve(docs);
    });*/

	// Figure out why readDocuments fails and hangs.
	_client.readDocuments(collection._self).toArray(function (err, results) {

		if (err) {
			deferred.reject(err);
			return;
		}

		deferred.resolve(results);
	});

	return deferred.promise;
};


var readDocumentByToken = function (token, collection) {

	var deferred = Q.defer();

	console.log('Searching for document with token = ', token);

	_client.queryDocuments(collection._self, 'SELECT * FROM tokens t WHERE t.token="' + token + '"').toArray(function (err, results) {
		if (err) {
			console.log('Error: ', err);
			deferred.reject(err);
			return;
		}

		//console.log('Results: ', results);

		deferred.resolve(results[0]);
	});

	return deferred.promise;

}

var readDocumentBySessionId = function (id, collection) {
	var deferred = Q.defer();

	_client.queryDocuments(collection._self, 'SELECT * FROM root r WHERE r.connectionId="' + id + '"').toArray(function (err, results) {
		if (err) {
			deferred.reject(err);
			return;
		}

		deferred.resolve(results[0]);
	});

	return deferred.promise;

}


var readDocument = function (id, collection) {

	var deferred = Q.defer();

	_client.queryDocuments(collection._self, 'SELECT * FROM root r WHERE r.id="' + id + '"').toArray(function (err, results) {
		if (err) {
			deferred.reject(err);
			return;
		}

		deferred.resolve(results[0]);
	});

	return deferred.promise;
};


var insertDocument = function (item, collection) {

	var deferred = Q.defer();

	_client.createDocument(collection._self, item, function (err, document) {

		if (err) {
			deferred.reject(err);
			return;
		}

		deferred.resolve(document);

	});

	return deferred.promise;

};

var updateDocument = function (item) {

	var deferred = Q.defer();

	_client.replaceDocument(item._self, item, function (err, document) {

		if (err) {
			deferred.reject(err);
			return;
		}

		deferred.resolve(document);

	});

	return deferred.promise;

};

var deleteDocument = function (document) {

	var deferred = Q.defer();

	_client.deleteDocument(document._self, function (err) {

		if (err) {
			deferred.reject(err);
			return;
		}

		deferred.resolve();

	});

	return deferred.promise;

};

var cleanup = function () {

	_client.deleteDatabase(_database._self, function (err) {
		if (err) {
			console.log('Failed to delete database: ', err);
		} else {
			console.log('Database deleted.');
		}

	});

};

module.exports = function (host, key, databaseId) {
	if (!host) throw new Error('"host" is required');
	if (!key) throw new Error('"key" is required');
	if (!databaseId) throw new Error('"databaseId" is required');

	// Set the configuration keys. We might need to reuse if we need to re-create
	// the DocumentClient object if certain error occurs.
	_host = host;
	_key = key;

	// Create a new DocumentDB Client that is shared across this storage instance.
	_client = new DocumentClient(_host, {
		masterKey: _key
	});

	// We assume that connecting to the database will finish before any queries
	// are run. This might be an issue with slow connections, verify.
	readOrCreateDatabase(databaseId).then(function (database) {
		console.log('The database "' + databaseId + '" was created/opened successfully');
	});

	return {
		openDatabase: readOrCreateDatabase,
		openCollection: readOrCreateCollection,
		list: readDocuments,
		read: readDocument,
		readByToken: readDocumentByToken,
		readBySessionId: readDocumentBySessionId,
		insert: insertDocument,
		update: updateDocument,
		delete: deleteDocument,
		database: _database,
		cleanup: cleanup
	}
};