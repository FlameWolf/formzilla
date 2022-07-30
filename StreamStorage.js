"use strict";

const { PassThrough } = require("stream");
const { FileInternal } = require("./FileInternal");
class StreamStorage {
	process(name, stream, info) {
		const file = new FileInternal(name, info);
		const delegateStream = new PassThrough();
		stream.on("data", chunk => delegateStream.push(chunk));
		stream.on("close", () => {
			file.stream = delegateStream;
		});
		return file;
	}
}

exports.StreamStorage = StreamStorage;