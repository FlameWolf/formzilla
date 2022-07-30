import { FileInfo } from "busboy";
import { Readable } from "stream";
import { FileInternal } from "./FileInternal";
import { StorageOption } from "./index";

export declare class StreamStorage implements StorageOption {
	process(name: string, stream: Readable, info: FileInfo): FileInternal;
}