"use strict";

const { FileInternal } = require("./FileInternal");
class CallbackStorage {
	callback;
	constructor(callback) {
		this.callback = callback;
	}
	process(name, stream, info) {
		this.callback(stream);
		return new FileInternal(name, info);
	}
}

exports.CallbackStorage = CallbackStorage;