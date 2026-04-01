"use strict";
import path from "path";
import { Readable, finished } from "stream";
import { FileInternal } from "./FileInternal.js";
import os from "node:os";
import fs from "node:fs";
export class DiscStorage {
	target;
	constructor(target) {
		this.target = target;
	}
	async process(name, stream, info) {
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
