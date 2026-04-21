import { Readable } from "stream";
import { FileInternal } from "./FileInternal.ts";
import type { FileInfo } from "busboy";
import type { StorageOption } from "./index.ts";
export declare class StreamStorage implements StorageOption {
	process(name: string, stream: Readable, info: FileInfo): Promise<FileInternal>;
}