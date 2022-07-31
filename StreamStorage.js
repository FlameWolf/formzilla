"use strict";

const { FileInternal } = require("./FileInternal");
const { PassThrough } = require("stream");
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