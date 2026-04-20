"use strict";
import { Readable, PassThrough } from "stream";
import { FileInternal } from "./FileInternal.js";
export class StreamStorage {
	lazy = true;
	process(name, stream, info) {
		const file = new FileInternal(name, info);
		const proxy = new PassThrough();
		stream.pipe(proxy);
		stream.on("error", err => {
			file.error = err;
			proxy.destroy(err);
		});
		file.stream = proxy;
		return file;
	}
}