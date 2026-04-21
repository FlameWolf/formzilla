"use strict";
import { Readable, PassThrough, finished } from "stream";
import { FileInternal } from "./FileInternal.js";
export class StreamStorage {
	process(name, stream, info) {
		const file = new FileInternal(name, info);
		const data = new Array();
		return new Promise(resolve => {
			finished(stream, err => {
				file.error = err;
				file.stream = Readable.from(data);
				resolve(file);
			});
			stream.on("data", chunk => data.push(chunk));
		});
	}
}