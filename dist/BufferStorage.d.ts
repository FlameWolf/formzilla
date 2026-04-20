import { Readable } from "stream";
import type { FileInfo } from "busboy";
import type { FormzillaFile, StorageOption } from "./index.ts";
export declare class BufferStorage implements StorageOption {
	process(name: string, stream: Readable, info: FileInfo): Promise<FormzillaFile>;
}