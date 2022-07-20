import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Limits } from "busboy";
interface Dictionary extends Object {
	[key: string | symbol]: any;
}
interface FormDataParserPluginOptions extends Limits, FastifyPluginOptions {}
declare type FormDataParserPlugin = (instance: FastifyInstance, opts: FormDataParserPluginOptions, done: (err?: Error) => void) => void;
declare module "fastify" {
	interface FastifyRequest {
		__files__?: Array<Dictionary>;
	}
}
declare const formDataParser: FormDataParserPlugin & Dictionary;
export default formDataParser;