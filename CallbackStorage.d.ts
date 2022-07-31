import { Readable } from "stream";
import { FileInfo } from "busboy";
import { File, StorageOption } from "./index";

declare type CallbackType = (name: string, stream: Readable, info: FileInfo) => File;
export declare class CallbackStorage implements StorageOption {
	callback: CallbackType;
	constructor(callback: CallbackType);
	process(name: string, stream: Readable, info: FileInfo): File;
}