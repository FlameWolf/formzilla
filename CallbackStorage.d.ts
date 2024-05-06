import { Readable } from "stream";
import { FileInfo } from "busboy";
import { FileHandler, StorageOption } from "./index";

export declare class CallbackStorage implements StorageOption {
	private callback: FileHandler;
	constructor(callback: FileHandler);
	process(name: string, stream: Readable, info: FileInfo): import("./index").File | Promise<import("./index").File>;
}