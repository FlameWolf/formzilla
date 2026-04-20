"use strict";

import type { FileInfo } from "busboy";
import type { Readable } from "stream";
import type { FormzillaFile } from "./index.ts";

export class FileInternal implements FormzillaFile {
	field: string | undefined;
	originalName: string;
	encoding: string;
	mimeType: string;
	path: string | undefined;
	stream: Readable | undefined;
	data: Buffer | undefined;
	error: Error | null | undefined;
	constructor(name: string, info: FileInfo) {
		this.field = name;
		this.originalName = info.filename;
		this.encoding = info.encoding;
		this.mimeType = info.mimeType;
	}
}