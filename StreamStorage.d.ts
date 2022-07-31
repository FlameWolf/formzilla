import { StorageOption } from "./index";
import { Readable } from "stream";
import { FileInfo } from "busboy";
import { FileInternal } from "./FileInternal";

export declare class StreamStorage implements StorageOption {
	process(name: string, stream: Readable, info: FileInfo): FileInternal;
}