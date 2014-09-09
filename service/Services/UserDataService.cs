using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.Documents.Linq;
using Microsoft.Azure.Documents;  

namespace Downloadr.Services
{
    public class UserDataService : IUserDataService
    {
        public UserDataService()
        {

        }


        public Models.UserData2 Retrieve(string connectionId)
        {


            throw new NotImplementedException();
        }

        public void Delete(string connectionId)
        {
            throw new NotImplementedException();
        }

        public void InsertOrUpdate(Models.UserData2 userData)
        {
            throw new NotImplementedException();
        }
    }
}