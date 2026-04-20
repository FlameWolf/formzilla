"use strict";

import { Readable, PassThrough } from "stream";
import { FileInternal } from "./FileInternal.ts";
import type { FileInfo } from "busboy";
import type { FormzillaFile, StorageOption } from "./index.ts";

export class StreamStorage implements StorageOption {
	lazy = true;
	process(name: string, stream: Readable, info: FileInfo): FormzillaFile {
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