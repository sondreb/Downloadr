/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Hubs
{
    using Autofac;
    using Downloadr.Models;
    using Downloadr.Security;
    using Downloadr.Services;
    using Microsoft.AspNet.SignalR;
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Web;

    public class TokenHub : Hub
    {
        private readonly ILifetimeScope _lifetimeScope;
        private readonly ILog _log = new Logger(typeof(TokenHub));
        private readonly string ConsumerKey = ConfigurationManager.AppSettings["downloadr:key"];
        private readonly string ConsumerSecret = ConfigurationManager.AppSettings["downloadr:secret"];
        private IUserDataService _dataService;

        // Minor hack until we implement IoC.
        public static TokenHub Instance { get; private set; }

        public TokenHub()
        {
            // We have to use the Service Locator pattern here, as I'm
            // unable to get the other DI pattern working with SignalR and Autofac.
            _dataService = IoC.Container.Resolve<IUserDataService>();

            Instance = this;
        }

        //public TokenHub(ILifetimeScope lifetimeScope)
        //{
        //    _lifetimeScope = lifetimeScope;

        //    _dataService = _lifetimeScope.Resolve<IUserDataService>();

        //    Instance = this;
        //}

        //protected override void Dispose(bool disposing)
        //{
        //    // Dipose the hub lifetime scope when the hub is disposed.
        //    if (disposing && _lifetimeScope != null)
        //        _lifetimeScope.Dispose();

        //    base.Dispose(disposing);
        //}

        public static string HttpGet(string URI)
        {
            System.Net.WebRequest req = System.Net.WebRequest.Create(URI);
            System.Net.WebResponse resp = req.GetResponse();
            System.IO.StreamReader sr = new System.IO.StreamReader(resp.GetResponseStream());
            return sr.ReadToEnd().Trim();
        }

        public static Dictionary<string, string> TokenSecrets = new Dictionary<string, string>();

        public static List<UserData> Users = new List<UserData>();

        /// <summary>
        /// Used by the service to handle the oauth_verifier and request the OAuth token.
        /// </summary>
        public void LoginAccepted(string oauthRequestToken, string oauthRequestVerifier)
        {
            // Call the correct user with the finalized authentication token.
            //Clients.Group(oauth_token).AuthenticationTokenReceived(token);

            if (!TokenSecrets.ContainsKey(oauthRequestToken))
            {
                throw new ArgumentException("Invalid OAuth Request Token");
            }

            var oauth_token_secret = TokenSecrets[oauthRequestToken];

            OAuthBase auth = new OAuthBase();

            var nounce = auth.GenerateNonce();
            var timestamp = auth.GenerateTimeStamp();

            var callback = ConfigurationManager.AppSettings["downloadr:callback"];
            var encodedCallback = auth.UrlEncode(callback);

            var url = new Uri("http://www.flickr.com/services/oauth/access_token");

            string normalizedUrl;
            string normalizedRequestParameters;

            var signature = auth.GenerateSignature(url, oauthRequestVerifier, ConsumerKey, ConsumerSecret, oauthRequestToken, oauth_token_secret, "GET", timestamp, nounce, callback, out normalizedUrl, out normalizedRequestParameters);

            var encodedSignature = auth.UrlEncode(signature);

            var result = HttpGet(normalizedUrl + "?" + normalizedRequestParameters + "&oauth_signature=" + encodedSignature);

            _log.Info("Result: " + result);

            var values = auth.GetQueryList(result);

            var fullname = values.Find(v => v.Name == "fullname").Value;
            var oauthAuthenticationToken = values.Find(v => v.Name == "oauth_token").Value;
            var oauthAuthenticationTokenSecret = values.Find(v => v.Name == "oauth_token_secret").Value;
            var userid = values.Find(v => v.Name == "user_nsid").Value;
            var username = values.Find(v => v.Name == "username").Value;

            //var authorizeUrl = "http://www.flickr.com/services/oauth/authorize?oauth_token=" + oauthToken + "&perms=read";

            // Notify that we now have a verified token.
            //Clients.Group(oauthRequestToken).authenticationTokenReceived(fullname + "|" + oauthRequestToken + "|" + userid + "|" + username);

            var response = new AuthenticationResponse();
            response.FullName = fullname;
            response.UserId = userid;
            response.UserName = username;
            response.Token = oauthAuthenticationToken;
            response.Secret = oauthAuthenticationTokenSecret;

            Clients.Group(oauthRequestToken).authenticationTokenReceived(response);
        }

        public void Search(string searchText, string userId)
        {
            var userData = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);

            if (userData != null) // Perform authenticated and signed search
            {
                var method = "flickr.photos.search";

            }
            else // Perform unauthenticated search
            {

            }
        }

        public string GenerateUrl(string url)
        {
            var userData = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);

            if (userData == null)
            {
                throw new ArgumentException("Only call this method for authorized users. Connect directly to Flickr API for unauthorized requests.");
            }

            OAuthBase auth = new OAuthBase();

            var nounce = auth.GenerateNonce();
            var timestamp = auth.GenerateTimeStamp();

            var uri = new Uri(url);

            string normalizedUrl;
            string normalizedRequestParameters;

            var signature = auth.GenerateSignature(uri, null, ConsumerKey, ConsumerSecret, userData.Token, userData.TokenSecret, "GET", timestamp, nounce, null, out normalizedUrl, out normalizedRequestParameters);

            _log.Info("Signature: " + signature);

            var encodedSignature = auth.UrlEncode(signature);

            var queryUrl = normalizedUrl + "?" + normalizedRequestParameters + "&oauth_signature=" + encodedSignature;

            //Clients.Caller.

            return queryUrl;

            //var result = HttpGet(normalizedUrl + "?" + normalizedRequestParameters + "&oauth_signature=" + encodedSignature);

            //_log.Debug(result);

            //var values = auth.GetQueryList(result);

            //var oauthCallbackConfirmed = values.Find(v => v.Name == "oauth_callback_confirmed").Value;
            //var oauthRequestToken = values.Find(v => v.Name == "oauth_token").Value;
            //var oauthRequestTokenSecret = values.Find(v => v.Name == "oauth_token_secret").Value;

            //var authorizeUrl = "http://www.flickr.com/services/oauth/authorize?oauth_token=" + oauthRequestToken + "&perms=read";
            //return authorizeUrl;
        }

        /// <summary>
        /// Used by the client to start the request to retreive login URL.
        /// </summary>
        public void RequestLoginUrl()
        {
            _log.Info("RequestLoginUrl Called");

            OAuthBase auth = new OAuthBase();

            var nounce = auth.GenerateNonce();
            var timestamp = auth.GenerateTimeStamp();

            var callback = ConfigurationManager.AppSettings["downloadr:callback"];
            var encodedCallback = auth.UrlEncode(callback);

            var url = new Uri("http://www.flickr.com/services/oauth/request_token");

            string normalizedUrl;
            string normalizedRequestParameters;

            var signature = auth.GenerateSignature(url, null, ConsumerKey, ConsumerSecret, null, null, "GET", timestamp, nounce, callback, out normalizedUrl, out normalizedRequestParameters);
            //var signature2 = auth.GenerateSignature(url, "653e7a6ecc1d528c516cc8f92cf98611", null, null, null, "GET", "1305583298", "89601180", out normalizedUrl, out normalizedRequestParameters);

            _log.Info("Signature: " + signature);

            var encodedSignature = auth.UrlEncode(signature);

            //if (!Program.IsDebugMode)
            //{
                var result = HttpGet(normalizedUrl + "?" + normalizedRequestParameters + "&oauth_signature=" + encodedSignature);

                _log.Info(result);

                var values = auth.GetQueryList(result);

                var oauthCallbackConfirmed = values.Find(v => v.Name == "oauth_callback_confirmed").Value;
                var oauthRequestToken = values.Find(v => v.Name == "oauth_token").Value;
                var oauthRequestTokenSecret = values.Find(v => v.Name == "oauth_token_secret").Value;

                var authorizeUrl = "http://www.flickr.com/services/oauth/authorize?oauth_token=" + oauthRequestToken + "&perms=read";

                // At this point, we are not going to store anything as this
            // is simple the Request Token, that will later be exchanged for Access Token.
                Clients.Caller.loginUrl(authorizeUrl);

                // Store the token and secret of the user.
                //var userData = new UserData() { ConnectionId = Context.ConnectionId, Token = oauthRequestToken, TokenSecret = oauthRequestTokenSecret };
                //_dataService.InsertOrUpdate(userData);

                // If it does not contain the token, we'll add.
                //if (!TokenSecrets.ContainsKey(oauthRequestToken))
                //{
                //    // Ensure we remember the secret for the current token.
                //    TokenSecrets.Add(oauthRequestToken, oauthRequestTokenSecret);

                //    Users.Add(new UserData() { ConnectionId = Context.ConnectionId, Token = oauthRequestToken, TokenSecret = oauthRequestTokenSecret });
                //}

                // Add the current user to a group based on the oauth token.
                //Groups.Add(Context.ConnectionId, oauthRequestToken);

                

                // For testing while developing...
                //LoginAccepted(oauthToken, oauthTokenSecret);
            //}
            //else
            //{
            //    var authorizeUrl = "http://www.flickr.com/services/oauth/authorize?oauth_token=" + encodedSignature + "&perms=read";
            //    Clients.Caller.loginUrl(authorizeUrl);
            //}
        }

        public override Task OnConnected()
        {
            _log.Info("Client Connected.");

            return base.OnConnected();
        }

        public override Task OnDisconnected()
        {
            _log.Info("Client Disconnected.");

            // Remove users that have been disconnected.
            _dataService.Delete(Context.ConnectionId);

            return base.OnDisconnected();
        }

        public override Task OnReconnected()
        {
            _log.Info("Client Reconnected.");
            return base.OnReconnected();
        }
    }
}