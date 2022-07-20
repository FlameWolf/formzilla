import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { Limits } from "busboy";

interface Dictionary extends Object {
	[key: string | symbol]: any;
}
interface FormDataParserPluginOptions extends Limits, FastifyPluginOptions {}
declare type FormDataParserPlugin = FastifyPluginAsync<FormDataParserPluginOptions> & Dictionary;
declare module "fastify" {
	interface FastifyRequest {
		__files__?: Array<Dictionary>;
	}
}
declare const formDataParser: FormDataParserPlugin;

export default formDataParser;