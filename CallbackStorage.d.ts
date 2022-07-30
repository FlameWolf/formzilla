import { FileInfo } from "busboy";
import { Readable } from "stream";
import { FileInternal } from "./FileInternal";
import { StorageOption } from "./index";

declare type CallbackType = (source: Readable) => any;
export declare class CallbackStorage implements StorageOption {
    callback: CallbackType;
    constructor(callback: CallbackType);
    process(name: string, stream: Readable, info: FileInfo): FileInternal;
}