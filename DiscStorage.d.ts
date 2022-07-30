import { FileInfo } from "busboy";
import { Readable } from "stream";
import { File, StorageOption, FileSaveTarget } from "./index";
import { FileInternal } from "./FileInternal";

declare type TargetType = FileSaveTarget | ((source: File) => FileSaveTarget);
export declare class DiscStorage implements StorageOption {
    target: TargetType;
    constructor(target: TargetType);
    process(name: string, stream: Readable, info: FileInfo): FileInternal;
}