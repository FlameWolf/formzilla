"use strict";

import path from "path";
import { Readable, finished } from "stream";
import { FileInternal } from "./FileInternal.ts";
import os from "node:os";
import fs from "node:fs";
import type { FileInfo } from "busboy";
import type { FormzillaFile, StorageOption, TargetType } from "./index.ts";

export class DiscStorage implements StorageOption {
	target: TargetType | void;
	constructor(target: TargetType | void) {
		this.target = target;
	}
	async process(name: string, stream: Readable, info: FileInfo): Promise<FormzillaFile> {
		const target = this.target;
		const file = new FileInternal(name, info);
		const saveLocation = typeof target === "function" ? await target(file) : target;
		const filePath = path.join(saveLocation?.directory || os.tmpdir(), saveLocation?.fileName || file.originalName);
		const fileStream = fs.createWriteStream(filePath);
		return new Promise(resolve => {
			finished(stream, err => {
				file.error = err;
				file.path = filePath;
				resolve(file);
			});
			stream.pipe(fileStream);
		});
	}
}