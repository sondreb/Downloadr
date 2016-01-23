function DownloadError(message) {
    this.message = message;
};

DownloadError.prototype = new Error();

function FileError(message) {
    this.message = message;
};

FileError.prototype = new Error();

function FlickrError(message) {
    this.message = message;
};

FileError.prototype = new Error();