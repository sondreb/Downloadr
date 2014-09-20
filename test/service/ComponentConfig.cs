﻿/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Tests
{
    using Autofac;
    using Autofac.Integration.SignalR;
    using Downloadr.Core;
    using Downloadr.Services;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection;
    using System.Web;

    public class ComponentTestConfig
    {
        public static IContainer Build()
        {
            var builder = new ContainerBuilder();

            builder.RegisterType<UserDataServiceTableStorage>().As<IUserDataService>();

            builder.RegisterType<Logger>().As<ILog>();

            builder.RegisterType<LoggingPipelineModule>().AsSelf();

            // Register the hubs within the web project, and not the test project.
            builder.RegisterHubs(typeof(ComponentConfig).Assembly);

            return builder.Build();
        }
    }
}