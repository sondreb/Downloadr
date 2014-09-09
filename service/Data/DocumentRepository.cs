using Downloadr.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Azure.Documents.Linq; 
using System.Web;
using Microsoft.Azure.Documents;

namespace Downloadr.Data
{
    public static class DocumentRepository
    {
        private static Database _database;
        private static Database Database
        {
            get {
                if (_database == null)
                {
                   // ReadOrCreateDatabase().Wait();
                }

                return _database;
            }
        }

        public static List<UserData> Retrieve()
        {
            return null;
            //Microsoft.Azure.Documents.Client
        }
    }
}