"use strict";
import { Readable, PassThrough, finished } from "stream";
import { FileInternal } from "./FileInternal.js";
export class StreamStorage {
	process(name, stream, info) {
		const file = new FileInternal(name, info);
		const proxy = new PassThrough();
		return new Promise(resolve => {
			finished(stream, err => {
				file.error = err;
				file.stream = proxy;
				proxy.end();
				resolve(file);
			});
			stream.on("data", chunk => {
				if (!proxy.write(chunk)) {
					stream.pause();
				}
			});
			proxy.on("drain", () => stream.resume());
		});
	}
}