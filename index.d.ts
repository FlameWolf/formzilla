import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { Limits } from "busboy";

interface Dictionary extends Object {
	[key: string | symbol]: any;
}
export interface FormDataParserPluginOptions extends Limits, FastifyPluginOptions {}
export interface IFile {
	field?: string;
	name: string;
	encoding: string;
	mimeType: string;
	data: Buffer;
}
export declare type FormDataParserPlugin = FastifyPluginAsync<FormDataParserPluginOptions> & Dictionary;
declare module "fastify" {
	interface FastifyRequest {
		__files__?: Array<IFile>;
	}
}
declare const formDataParser: FormDataParserPlugin;

export default formDataParser;