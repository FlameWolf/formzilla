"use strict";

class CallbackStorage {
	#callback;
	constructor(callback) {
		this.#callback = callback;
	}
	process(name, stream, info) {
		return this.#callback(name, stream, info);
	}
}

exports.CallbackStorage = CallbackStorage;