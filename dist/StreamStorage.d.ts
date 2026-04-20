import { Readable } from "stream";
import type { FileInfo } from "busboy";
import type { FormzillaFile, StorageOption } from "./index.ts";
export declare class StreamStorage implements StorageOption {
	lazy: boolean;
	process(name: string, stream: Readable, info: FileInfo): FormzillaFile;
}