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
        void Insert(UserData userData);

        UserData Retrieve();

        void Update(UserData userData);

        void Delete(UserData userData);

        void InsertOrUpdate(UserData userData);
    }
}
