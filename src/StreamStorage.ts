"use strict";

import { Readable, PassThrough, finished } from "stream";
import { FileInternal } from "./FileInternal.ts";
import type { FileInfo } from "busboy";
import type { StorageOption } from "./index.ts";

export class StreamStorage implements StorageOption {
	process(name: string, stream: Readable, info: FileInfo): Promise<FileInternal> {
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