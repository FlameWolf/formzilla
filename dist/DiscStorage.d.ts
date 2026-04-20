import { Readable } from "stream";
import type { FileInfo } from "busboy";
import type { FormzillaFile, StorageOption, TargetType } from "./index.ts";
export declare class DiscStorage implements StorageOption {
	target: TargetType | void;
	constructor(target: TargetType | void);
	process(name: string, stream: Readable, info: FileInfo): Promise<FormzillaFile>;
}