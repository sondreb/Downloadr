/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Services
{
    using Downloadr.Models;
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Linq;
    using System.Web;

    public class UserDataServiceTableStorage : IUserDataService
    {
        CloudTableClient _storage;
        CloudTable _table;

        public UserDataServiceTableStorage()
        {
            var storageAccount = CloudStorageAccount.Parse(ConfigurationManager.AppSettings["cloud:StorageConnection"]);

            _storage = storageAccount.CreateCloudTableClient();
            _table = _storage.GetTableReference("userdata");

            _table.CreateIfNotExists();
        }

        public Models.UserData2 Retrieve(string connectionId)
        {
            var operation = TableOperation.Retrieve <UserData2>("users", connectionId);
            var result = _table.Execute(operation);

            if (result.Result == null)
            {
                return null;
            }

            return (UserData2)result.Result;
        }

        public Models.UserData2 Retreive(string oAuthToken, string oAuthVerifier)
        {
            return null;
            //var operation = TableOperation.Retrieve<UserData2>("users", connectionId);
            //var result = _table.Execute(operation);

            //if (result.Result == null)
            //{
            //    return null;
            //}

            //return (UserData2)result.Result;
        }

        public void Delete(string connectionId)
        {
            var delete = TableOperation.Delete(new UserData2(connectionId) { ETag = "*" });
            _table.Execute(delete);
        }

        public void InsertOrUpdate(Models.UserData2 userData)
        {
            var operation = TableOperation.InsertOrReplace(userData);
            _table.Execute(operation);
        }
    }
}