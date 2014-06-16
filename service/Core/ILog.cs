/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Downloadr
{
    public interface ILog
    {
        void Warn(string message);

        void Info(string message);

        void Error(string message);

        void Warn(string format, params object[] args);

        void Info(string format, params object[] args);

        void Error(string format, params object[] args);
    }
}
