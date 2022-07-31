"use strict";

const { FileInternal } = require("./FileInternal");
const path = require("path");
const os = require("os");
const fs = require("fs");
class DiscStorage {
	target;
	constructor(target) {
		this.target = target;
	}
	process(name, stream, info) {
		const target = this.target;
		const file = new FileInternal(name, info);
		const saveLocation = typeof target === "function" ? target(file) : target;
		const filePath = path.join(saveLocation?.directory || os.tmpdir(), saveLocation?.fileName || file.originalName);
		const fileStream = fs.createWriteStream(filePath);
		stream.pipe(fileStream);
		stream.on("close", () => {
			file.path = filePath;
		});
		return file;
	}
}

exports.DiscStorage = DiscStorage;