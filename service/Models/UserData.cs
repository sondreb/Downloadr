/*!
 * Flickr Downloadr
 * Copyright: 2007-2014 Sondre Bjellås. http://sondreb.com/
 * License: MIT
 */

namespace Downloadr.Models
{
    using Microsoft.WindowsAzure.Storage.Table;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.Web;

    public class UserData : TableEntity
    {
        public UserData(string connectionId)
        {
            this.PartitionKey = "users";
            this.RowKey = connectionId;
        }

        public UserData()
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