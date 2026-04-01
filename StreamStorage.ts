"use strict";

import { Readable, PassThrough, finished } from "stream";
import { FileInternal } from "./FileInternal.ts";
import type { FileInfo } from "busboy";
import type { StorageOption } from "./index.ts";

export class StreamStorage implements StorageOption {
	process(name: string, stream: Readable, info: FileInfo): Promise<FileInternal> {
		const file = new FileInternal(name, info);
		const delegateStream = new PassThrough();
		return new Promise(resolve => {
			finished(stream, err => {
				file.error = err;
				file.stream = delegateStream;
				resolve(file);
			});
			stream.on("data", chunk => delegateStream.push(chunk));
		});
	}
}
