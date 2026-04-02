import { type FileInfo, type Limits } from "busboy";
import { Readable } from "stream";
import type { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
export { BufferStorage } from "./BufferStorage.ts";
export { CallbackStorage } from "./CallbackStorage.ts";
export { DiscStorage } from "./DiscStorage.ts";
export { StreamStorage } from "./StreamStorage.ts";
export interface Dictionary extends Object {
    [key: string | symbol]: any;
}
export interface FormzillaFile {
    field: string | undefined;
    originalName: string;
    encoding: string;
    mimeType: string;
    path: string | undefined;
    stream: Readable | undefined;
    data: Buffer | undefined;
    error: Error | null | undefined;
}
export type FileHandler = (name: string, stream: Readable, info: FileInfo) => FormzillaFile | Promise<FormzillaFile>;
export interface StorageOption {
    process: FileHandler;
}
export interface FileSaveTarget {
    directory?: string;
    fileName?: string;
}
export type TargetType = FileSaveTarget | ((source: FormzillaFile) => FileSaveTarget | Promise<FileSaveTarget>);
export interface FormDataParserPluginOptions extends FastifyPluginOptions {
    limits?: Limits;
    storage?: StorageOption;
}
export type FormDataParserPlugin = FastifyPluginAsync<FormDataParserPluginOptions> & Dictionary;
export interface FieldParser {
    parseField(name: string, value: any): any;
}
declare global {
    interface Error {
        [key: string | symbol]: any | undefined;
    }
}
declare module "fastify" {
    interface FastifyRequest {
        __files__?: Array<FormzillaFile>;
    }
}
declare const formDataParser: FastifyPluginAsync;
export default formDataParser;
