/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Services
{
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Linq;
    using System.Web;

    public class UserDataService : IUserDataService
    {
        CloudTableClient _storage;
        CloudTable _table;

        public UserDataService()
        {
            var storageAccount = CloudStorageAccount.Parse(ConfigurationManager.AppSettings["cloud:StorageConnection"]);

            _storage = storageAccount.CreateCloudTableClient();
            _table = _storage.GetTableReference("userdata");

            _table.CreateIfNotExists();
        }

        public void Insert(Models.UserData userData)
        {
            TableOperation insert = TableOperation.Insert(userData);
            _table.Execute(insert);
        }

        public Models.UserData Retrieve()
        {
            throw new NotImplementedException();
        }

        public void Update(Models.UserData userData)
        {
            throw new NotImplementedException();
        }

        public void Delete(Models.UserData userData)
        {
            throw new NotImplementedException();
        }

        public void InsertOrUpdate(Models.UserData userData)
        {
            TableOperation.InsertOrReplace(userData);
        }
    }
}