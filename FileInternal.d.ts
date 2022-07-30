import { FileInfo } from "busboy";
import { Readable } from "stream";
import { File } from "./index";

export declare class FileInternal implements File {
	field: string | undefined;
	originalName: string;
	encoding: string;
	mimeType: string;
	path: string | undefined;
	stream: Readable | undefined;
	data: Buffer | undefined;
	constructor(name: string, info: FileInfo);
}