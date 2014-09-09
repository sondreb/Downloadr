/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Services
{
    using Downloadr.Models;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    public interface IUserDataService
    {
        UserData2 Retrieve(string connectionId);

        void Delete(string connectionId);

        void InsertOrUpdate(UserData2 userData);
    }
}
