/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Core
{
    using Downloadr.Services;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

    public class LoggingPipelineModule : HubPipelineModule
    {
        private readonly ILog _log = new Logger(typeof(LoggingPipelineModule));

        public LoggingPipelineModule()
        {

        }

        protected override bool OnBeforeIncoming(IHubIncomingInvokerContext context)
        {
            _log.Info("=> Invoking " + context.MethodDescriptor.Name + " on hub " + context.MethodDescriptor.Hub.Name);
            return base.OnBeforeIncoming(context);
        }
        protected override bool OnBeforeOutgoing(IHubOutgoingInvokerContext context)
        {
            _log.Info("<= Invoking " + context.Invocation.Method + " on client hub " + context.Invocation.Hub);
            return base.OnBeforeOutgoing(context);
        }
    }
}