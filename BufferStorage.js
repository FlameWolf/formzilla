"use strict";
import { Readable, finished } from "stream";
import { FileInternal } from "./FileInternal.js";
export class BufferStorage {
    process(name, stream, info) {
        const file = new FileInternal(name, info);
        const data = new Array();
        return new Promise(resolve => {
            finished(stream, err => {
                file.error = err;
                file.data = Buffer.concat(data);
                resolve(file);
            });
            stream.on("data", chunk => data.push(chunk));
        });
    }
}
