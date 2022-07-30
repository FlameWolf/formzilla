"use strict";

class FileInternal {
    field;
    originalName;
    encoding;
    mimeType;
    path;
    stream;
    data;
    constructor(name, info) {
        this.field = name;
        this.originalName = info.filename;
        this.encoding = info.encoding;
        this.mimeType = info.mimeType;
    }
}

exports.FileInternal = FileInternal;