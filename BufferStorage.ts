"use strict";

import { Readable, finished } from "stream";
import { FileInternal } from "./FileInternal.ts";
import type { FileInfo } from "busboy";
import type { FormzillaFile, StorageOption } from "./index.ts";

export class BufferStorage implements StorageOption {
	process(name: string, stream: Readable, info: FileInfo): Promise<FormzillaFile> {
		const file = new FileInternal(name, info);
		const data = new Array<any>();
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
