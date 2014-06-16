/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

using Downloadr;
using Downloadr.Core;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Autofac;
using Microsoft.Owin.Cors;
using Owin;

// Do we really need this? Works without...
[assembly: OwinStartup(typeof(Startup))]

namespace Downloadr
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var hubConfiguration = new HubConfiguration
            {
                // You can enable JSONP by uncommenting line below.
                // JSONP requests are insecure but some older browsers (and some
                // versions of IE) require JSONP to work cross domain
                // EnableJSONP = true
                EnableDetailedErrors = true,

                // We don't need this, clients are running natively on devices.
                EnableJavaScriptProxies = false
            };

            // Setup the CORS middleware to run before SignalR.
            // By default this will allow all origins. You can 
            // configure the set of origins and/or http verbs by
            // providing a cors options with a different policy.
            app.UseCors(CorsOptions.AllowAll);

            // Add a global logging module to SignalR.
            GlobalHost.HubPipeline.AddModule(IoC.Container.Resolve<LoggingPipelineModule>()); 

            // Make sure SignalR runs with the /api path.
            app.MapSignalR("/api", hubConfiguration);
        }
    }
}