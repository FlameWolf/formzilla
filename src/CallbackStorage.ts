"use strict";

import type { FileInfo } from "busboy";
import { Readable } from "stream";
import type { StorageOption, FileHandler, FormzillaFile } from "./index.ts";

export class CallbackStorage implements StorageOption {
	callback: FileHandler;
	constructor(callback: FileHandler) {
		this.callback = callback;
	}
	process(name: string, stream: Readable, info: FileInfo): FormzillaFile | Promise<FormzillaFile> {
		return this.callback(name, stream, info);
	}
}