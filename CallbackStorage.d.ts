import type { FileInfo } from "busboy";
import { Readable } from "stream";
import type { StorageOption, FileHandler, FormzillaFile } from "./index.ts";
export declare class CallbackStorage implements StorageOption {
    callback: FileHandler;
    constructor(callback: FileHandler);
    process(name: string, stream: Readable, info: FileInfo): FormzillaFile | Promise<FormzillaFile>;
}
