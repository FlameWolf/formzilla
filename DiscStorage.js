"use strict";

const { FileInternal } = require("./FileInternal");
const { finished } = require("stream");
const path = require("path");
const os = require("os");
const fs = require("fs");

class DiscStorage {
	target;
	constructor(target) {
		this.target = target;
	}
	process(name, stream, info) {
		return new Promise(resolve => {
			const target = this.target;
			const file = new FileInternal(name, info);
			const saveLocation = typeof target === "function" ? target(file) : target;
			const filePath = path.join(saveLocation?.directory || os.tmpdir(), saveLocation?.fileName || file.originalName);
			const fileStream = fs.createWriteStream(filePath);
			stream.pipe(fileStream);
			finished(stream, err => {
				file.error = err;
				file.path = filePath;
				resolve(file);
			});
		});
	}
}

exports.DiscStorage = DiscStorage;