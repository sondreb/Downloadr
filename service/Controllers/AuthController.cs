/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Controllers
{
    using Downloadr.Hubs;
    using Microsoft.AspNet.SignalR;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Web.Mvc;

    public class AuthController : Controller
    {
        // GET: Auth
        public ActionResult Index(string oauth_token, string oauth_verifier)
        {

            var context = GlobalHost.ConnectionManager.GetHubContext<TokenHub>();

            //context.Clients.All.Send("Admin", "stop the chat");


            if (TokenHub.Instance != null)
            {
                TokenHub.Instance.LoginAccepted(oauth_token, oauth_verifier);
            }

            return View();
        }
    }
}