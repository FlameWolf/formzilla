"use strict";

const { FileInternal } = require("./FileInternal");
const { finished } = require("stream");

class BufferStorage {
	process(name, stream, info) {
		const file = new FileInternal(name, info);
		const data = [];
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

exports.BufferStorage = BufferStorage;