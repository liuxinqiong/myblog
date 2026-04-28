var fs = require('fs');
var path = require('path');

var MAX_FILE_SIZE = 5 * 1024 * 1024;
var ALLOWED_EXTS = ['.bmp', '.png', '.gif', '.jpg', '.jpeg', '.webp'];
var ALLOWED_MIMES = ['image/bmp', 'image/png', 'image/gif', 'image/jpeg', 'image/webp'];

function removeFile(file) {
    if (file && file.path) {
        fs.unlink(file.path, function () {});
    }
}

function removeFiles(files) {
    files.forEach(removeFile);
}

function hasImageSignature(filePath) {
    var buffer = Buffer.alloc(12);
    var fd;
    var bytesRead;

    try {
        fd = fs.openSync(filePath, 'r');
        bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    } catch (e) {
        return false;
    } finally {
        if (typeof fd === 'number') fs.closeSync(fd);
    }

    if (bytesRead < 4) return false;

    var isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    var isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    var isGif = buffer.slice(0, 6).toString() === 'GIF87a' || buffer.slice(0, 6).toString() === 'GIF89a';
    var isBmp = buffer[0] === 0x42 && buffer[1] === 0x4d;
    var isWebp = buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';

    return isJpeg || isPng || isGif || isBmp || isWebp;
}

function isAllowedImage(file) {
    var name = file.name || '';
    var ext = path.extname(name).toLowerCase();
    var mime = (file.type || '').toLowerCase();
    var size = file.size || 0;

    return ALLOWED_EXTS.indexOf(ext) !== -1 &&
        ALLOWED_MIMES.indexOf(mime) !== -1 &&
        size > 0 &&
        size <= MAX_FILE_SIZE &&
        hasImageSignature(file.path);
}

module.exports = {
    maxFileSize: MAX_FILE_SIZE,
    isAllowedImage: isAllowedImage,
    removeFile: removeFile,
    removeFiles: removeFiles
};
