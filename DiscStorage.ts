"use strict";

import path from "path";
import { Readable, finished } from "stream";
import { FileInternal } from "./FileInternal.ts";
import os from "node:os";
import { createWriteStream } from "fs";
import { mkdir, unlink } from "fs/promises";
import type { FileInfo } from "busboy";
import type { FormzillaFile, StorageOption, TargetType } from "./index.ts";

export class DiscStorage implements StorageOption {
	target: TargetType | void;
	constructor(target: TargetType | void) {
		this.target = target;
	}
	async process(name: string, stream: Readable, info: FileInfo): Promise<FormzillaFile> {
		const file = new FileInternal(name, info);
		const saveLocation = typeof this.target === "function" ? await this.target(file) : this.target;
		const baseDir = path.resolve(saveLocation?.directory || os.tmpdir());
		const safeName = path.basename(saveLocation?.fileName || file.originalName || "");
		if (!safeName || safeName === "." || safeName === "..") {
			throw new Error("Invalid file name");
		}
		const filePath = path.join(baseDir, safeName);
		const resolved = path.resolve(filePath);
		if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) {
			throw new Error("Path traversal detected");
		}
		await mkdir(baseDir, { recursive: true });
		const fileStream = createWriteStream(resolved);
		return new Promise(resolve => {
			finished(fileStream, err => {
				file.error = err;
				file.path = resolved;
				if (err) {
					unlink(resolved).catch(void 0);
				}
				resolve(file);
			});
			stream.pipe(fileStream);
		});
	}
}