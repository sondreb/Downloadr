using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Downloadr.Services;
using Microsoft.WindowsAzure.Storage;

namespace Downloadr.Tests
{
    [TestClass]
    public class UserDataServiceTests
    {
        [TestMethod]
        public void ShouldSaveUserDataThenRetrieve()
        {
            var service = new UserDataService();
            var data = new Models.UserData() { RowKey = "1", Token = "token", TokenSecret = "secret" };
            service.InsertOrUpdate(data);

            var user = service.Retrieve("1");
            Assert.IsNotNull(user);
        }

        [TestMethod]
        public void ShouldDeleteUserDataThenVerifyDeleted()
        {
            var service = new UserDataService();

            try
            {
                service.Delete("1");
            }
            catch (StorageException ex)
            {
                // 404 will be returned if not exists, otherwise something
                // else failed and we should fail this integration test.
                if (ex.RequestInformation.HttpStatusCode != 404)
                {
                    throw ex;
                }
            }


            var user = service.Retrieve("1");
            Assert.IsNull(user);
        }
    }
}
