using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Downloadr.Services;
using Microsoft.WindowsAzure.Storage;

namespace Downloadr.Tests.Services
{
    [TestClass]
    public class UserDataServiceTests : TestBase
    {
        [TestMethod]
        public void CreateAndRetreiveUserData()
        {
            var service = Resolve<IUserDataService>();

            service.InsertOrUpdate(new Models.UserData2("12345") { IsAccessToken = true, Token = " ", TokenSecret = " " });

            var userData = service.Retrieve("12345");

            Assert.AreEqual(userData.Token, " ");
            Assert.AreEqual(userData.TokenSecret, " ");
            Assert.AreEqual(userData.IsAccessToken, true);
        }

        [TestMethod]
        public void CreateAndDeleteUserData()
        {
            var service = Resolve<IUserDataService>();

            service.InsertOrUpdate(new Models.UserData2("5555") { });

            var data = service.Retrieve("5555");

            Assert.IsNotNull(data);

            service.Delete("5555");

            data = service.Retrieve("5555");

            Assert.IsNull(data);
        }

        [TestMethod]
        [ExpectedException(typeof(StorageException))]
        public void DeleteUserDataThatDoesNotExistsExpectedToFail()
        {
            var service = Resolve<IUserDataService>();
            service.Delete("4444");
        }

        [TestMethod]
        public void RetreiveUserDataThatDoesNotExists()
        {
            var service = Resolve<IUserDataService>();
            var data = service.Retrieve("2222");
            Assert.IsNull(data);
        }
    }
}
