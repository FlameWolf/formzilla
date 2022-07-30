"use strict";

const { FileInternal } = require("./FileInternal");
class BufferStorage {
	process(name, stream, info) {
		const file = new FileInternal(name, info);
		const data = [];
		stream.on("data", chunk => data.push(chunk));
		stream.on("close", () => {
			file.data = Buffer.concat(data);
		});
		return file;
	}
}

exports.BufferStorage = BufferStorage;