/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Services
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Linq;
    using System.Web;

    public class Logger : ILog
    {
        private Type _source;

        private string _path;

        public Logger(Type source)
        {
            _source = source;
            _path = _source.FullName;
        }

        public void Warn(string message)
        {
            Trace.TraceWarning(_path + ": " + message);
            Debug.WriteLine(_path + ": " + message);
        }

        public void Info(string message)
        {
            Trace.TraceInformation(_path + ": " + message);
            Debug.WriteLine(_path + ": " + message);

        }

        public void Error(string message)
        {
            Trace.TraceError(_path + ": " + message);
            Debug.WriteLine(_path + ": " + message);

        }

        public void Warn(string format, params object[] args)
        {
            format = _path + ": " + format;
            Trace.TraceWarning(format, args);
            Debug.WriteLine(string.Format(format, args));

        }

        public void Info(string format, params object[] args)
        {
            format = _path + ": " + format;
            Trace.TraceInformation(format, args);
            Debug.WriteLine(string.Format(format, args));

        }

        public void Error(string format, params object[] args)
        {
            format = _path + ": " + format;
            Trace.TraceError(format, args);
            Debug.WriteLine(string.Format(format, args));

        }
    }
}
