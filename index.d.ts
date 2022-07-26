import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { Limits, FileInfo } from "busboy";

interface Dictionary extends Object {
	[key: string | symbol]: any;
}
export interface FormDataParserPluginOptions extends Limits, FastifyPluginOptions {}
export declare type FormDataParserPlugin = FastifyPluginAsync<FormDataParserPluginOptions> & Dictionary;
export declare class File {
	field?: string;
	name: string;
	encoding: string;
	mimeType: string;
	data: Buffer;
	constructor(name?: string, info?: FileInfo);
}
declare module "fastify" {
	interface FastifyRequest {
		__files__?: Array<File>;
	}
}
declare const formDataParser: FormDataParserPlugin;

export default formDataParser;