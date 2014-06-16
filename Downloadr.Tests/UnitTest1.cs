using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Downloadr.Services;

namespace Downloadr.Tests
{
    [TestClass]
    public class UserDataServiceTests
    {
        [TestMethod]
        public void ShouldSaveUserData()
        {
            var service = new UserDataService();
            var data = new Models.UserData() { ConnectionId = "1", Token = "token", TokenSecret = "secret" };
            service.InsertOrUpdate(data);

            //service.Retrieve();
        }
    }
}
