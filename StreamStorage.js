"use strict";

const { FileInternal } = require("./FileInternal");
const { PassThrough, finished } = require("stream");

class StreamStorage {
	process(name, stream, info) {
		const file = new FileInternal(name, info);
		const delegateStream = new PassThrough();
		stream.on("data", chunk => delegateStream.push(chunk));
		return new Promise(resolve =>
			finished(stream, err => {
				file.error = err;
				file.stream = delegateStream;
				resolve(file);
			})
		);
	}
}

exports.StreamStorage = StreamStorage;