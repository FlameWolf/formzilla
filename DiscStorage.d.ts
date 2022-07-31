import { FileSaveTarget, File, StorageOption } from "./index";
import { Readable } from "stream";
import { FileInfo } from "busboy";
import { FileInternal } from "./FileInternal";

declare type TargetType = FileSaveTarget | ((source: File) => FileSaveTarget);
export declare class DiscStorage implements StorageOption {
	target: TargetType;
	constructor(target: TargetType);
	process(name: string, stream: Readable, info: FileInfo): FileInternal;
}