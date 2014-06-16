/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr
{
    using Autofac;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;

    public static class IoC
    {
        public static IContainer Container { get; set; }
    }
}