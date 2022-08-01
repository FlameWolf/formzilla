import { Readable } from "stream";
import { FileInfo, Limits } from "busboy";
import { FastifyPluginOptions, FastifyPluginAsync } from "fastify";

export interface Dictionary extends Object {
	[key: string | symbol]: any;
}
export interface File {
	field: string | undefined;
	originalName: string;
	encoding: string;
	mimeType: string;
	path: string | undefined;
	stream: Readable | undefined;
	data: Buffer | undefined;
}
export interface StorageOption {
	process: (name: string, stream: Readable, info: FileInfo) => File;
}
export interface FileSaveTarget {
	directory?: string;
	fileName?: string;
}
export interface FormDataParserPluginOptions extends FastifyPluginOptions {
	limits?: Limits;
	storage?: StorageOption;
}
export declare type FormDataParserPlugin = FastifyPluginAsync<FormDataParserPluginOptions> & Dictionary;
export declare type FieldParser = (name: string, value: string) => string;
declare module "fastify" {
	interface FastifyRequest {
		__files__?: Array<File>;
	}
}
declare const formDataParser: FormDataParserPlugin;

export default formDataParser;