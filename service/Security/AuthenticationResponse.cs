/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Security
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    public class AuthenticationResponse
    {
        public string FullName { get; set; }

        public string UserId { get; set; }

        public string UserName { get; set; }

        public string Token { get; set; }

        public string Secret { get; set; }
    }
}
