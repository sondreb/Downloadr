'use strict';
// @ngInject
function fileManager()
{
    var download = function(url, success, error, metadata) {

        console.log('Download: ', url);

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';

        xhr.onload = function() {

            if (xhr.readyState === 4)
            {
                if (xhr.status === 200)
                {

                    //console.log(xhr.response);
                    //window.console.log("response: "+xhr.response);
                    //callback(JSON.parse(xhr.response));
                    success(window.URL.createObjectURL(xhr.response), url, xhr.response, metadata);
                }
                else
                {
                    error(xhr.statusText, metadata);
                    console.error(xhr.statusText);
                }
            }

        };

        xhr.ontimeout = function() {
            console.error("The request for " + url + " timed out.");

            if (error !== undefined)
            {
                error("The request for " + url + " timed out.");
            }

        };

        xhr.onerror = function(){

            console.log(xhr.statusText);

            /*
            console.error("error: "+xhr.statusText);

            if (error !== undefined)
            {
                error("error: "+xhr.statusText);
            }*/

        }

        xhr.open('GET', url, true);
        xhr.send();

    };

    var downloadAsText = function(url, success, error, metadata) {

        console.log('Download: ', url);

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';

        xhr.onload = function() {

            if (xhr.readyState === 4)
            {
                if (xhr.status === 200)
                {

                    console.log(xhr.response);

                    var uInt8Array = new Uint8Array(xhr.response);
                    var i = uInt8Array.length;
                    var biStr = new Array(i);
                    while (i--)
                    {
                        biStr[i] = String.fromCharCode(uInt8Array[i]);
                    }
                    var data = biStr.join('');
                    var base64 = window.btoa(data);

                    success(base64, url, metadata);

                }
                else
                {

                    console.error(xhr.statusText);
                    error(xhr.statusText, metadata);

                }
            }

        };

        xhr.ontimeout = function() {
            console.error("The request for " + url + " timed out.");

            if (error !== undefined)
            {
                error("The request for " + url + " timed out.");
            }

        };

        xhr.onerror = function(){
            console.error("error: " + xhr.statusText);

            if (error !== undefined)
            {
                error("error: " + xhr.statusText);
            }

        }

        xhr.open('GET', url, true);
        xhr.send();

    };

    return {
        download: download,
			downloadAsText:
        downloadAsText
        };

};

module.exports = fileManager;