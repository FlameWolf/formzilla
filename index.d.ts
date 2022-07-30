import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { Limits, FileInfo } from "busboy";
import { Readable } from "stream";

interface Dictionary extends Object {
	[key: string | symbol]: any;
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
	storage: StorageOption;
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
export declare type FormDataParserPlugin = FastifyPluginAsync<FormDataParserPluginOptions> & Dictionary;
declare module "fastify" {
	interface FastifyRequest {
		__files__?: Array<File>;
	}
}
declare const formDataParser: FormDataParserPlugin;

export default formDataParser;