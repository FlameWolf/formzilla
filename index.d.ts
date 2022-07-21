import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { Limits, FileInfo } from "busboy";

interface Dictionary extends Object {
	[key: string | symbol]: any;
}
interface FormDataParserPluginOptions extends Limits, FastifyPluginOptions {}
declare type FormDataParserPlugin = FastifyPluginAsync<FormDataParserPluginOptions> & Dictionary;
declare class File {
	fieldName?: string;
	fileName: string;
	encoding: string;
	mimeType: string;
	data: Buffer;
	constructor(fileInfo?: FileInfo);
}
declare module "fastify" {
	interface FastifyRequest {
		__files__?: Array<File>;
	}
}
declare const formDataParser: FormDataParserPlugin;

export default formDataParser;