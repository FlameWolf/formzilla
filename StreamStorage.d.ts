import { StorageOption, File } from "./index";
import { Readable } from "stream";
import { FileInfo } from "busboy";

export declare class StreamStorage implements StorageOption {
	process(name: string, stream: Readable, info: FileInfo): Promise<File>;
}