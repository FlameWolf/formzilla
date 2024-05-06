import { StorageOption, TargetType, File } from "./index";
import { Readable } from "stream";
import { FileInfo } from "busboy";

export declare class DiscStorage implements StorageOption {
	#target: TargetType;
	constructor(target: TargetType);
	process(name: string, stream: Readable, info: FileInfo): Promise<File>;
}