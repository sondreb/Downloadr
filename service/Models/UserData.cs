/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Models
{
    using Microsoft.WindowsAzure.Storage.Table;
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.Web;

    public class UserData
    {
        public string ConnectionId { get; set; }

        public string Token { get; set; }

        public string TokenSecret { get; set; }

        public bool IsAccessToken { get; set; }
    }

    public class UserData2 : TableEntity
    {
        public UserData2(string connectionId)
        {
            this.PartitionKey = "users";
            this.RowKey = connectionId;
        }

        public UserData2()
        {
            this.PartitionKey = "users";
        }

        [NotMapped]
        public string ConnectionId { get { return RowKey; } }

        public string Token { get; set; }

        public string TokenSecret { get; set; }

        public bool IsAccessToken { get; set; }
    }
}