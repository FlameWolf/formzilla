import { File } from "./index";
import { Readable } from "stream";
import { FileInfo } from "busboy";

export declare class FileInternal implements File {
	field: string | undefined;
	originalName: string;
	encoding: string;
	mimeType: string;
	path: string | undefined;
	stream: Readable | undefined;
	data: Buffer | undefined;
	error: Error | undefined;
	constructor(name: string, info: FileInfo);
}