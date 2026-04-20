"use strict";

import busboy, { type FileInfo, type Limits } from "busboy";
import { Readable, finished } from "stream";
import { FieldParserNoSchema } from "./FieldParserNoSchema.ts";
import { FieldParserWithSchema } from "./FieldParserWithSchema.ts";
import { StreamStorage } from "./StreamStorage.ts";
import type { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";

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
	lazy?: Boolean;
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
export { BufferStorage } from "./BufferStorage.ts";
export { CallbackStorage } from "./CallbackStorage.ts";
export { DiscStorage } from "./DiscStorage.ts";
export { StreamStorage } from "./StreamStorage.ts";
export { FileInternal } from "./FileInternal.ts";
export { FieldParserNoSchema } from "./FieldParserNoSchema.ts";
export { FieldParserWithSchema } from "./FieldParserWithSchema.ts";

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

const formDataParser: FastifyPluginAsync = async (instance: FastifyInstance, options: FormDataParserPluginOptions) => {
	const { limits, storage = new StreamStorage() } = options;
	instance.addContentTypeParser("multipart/form-data", (request, message, done) => {
		let settled = false;
		const results = new Array<any>();
		const body = Object.create(null);
		const schemaBody = request.routeOptions.schema?.body as Dictionary;
		const props = schemaBody && (schemaBody.content?.["multipart/form-data"]?.schema?.properties || schemaBody.properties);
		const parser = props ? new FieldParserWithSchema(props) : new FieldParserNoSchema();
		const bus = busboy({ headers: message.headers, limits, defParamCharset: "utf8" });
		const finish = (err: Error | null, body?: any) => {
			if (settled) {
				return;
			}
			settled = true;
			if (err) {
				message.unpipe(bus);
				bus.destroy();
			}
			done(err, body);
		};
		bus.on("partsLimit", () => {
			finish(new Error("Parts limit exceeded"));
		});
		bus.on("filesLimit", () => {
			finish(new Error("Files limit exceeded"));
		});
		bus.on("fieldsLimit", () => {
			finish(new Error("Fields limit exceeded"));
		});
		bus.on("file", (name, stream, info) => {
			stream.on("limit", () => {
				finish({
					name: "Bad input",
					message: "File size limit exceeded",
					field: name,
					...info
				});
			});
			try {
				results.push(storage.process(name, stream, info));
			} catch (err: any) {
				stream.resume();
				finish(err);
			}
			const fileProp = body[name];
			if (!fileProp) {
				body[name] = JSON.stringify(info);
				return;
			}
			if (Array.isArray(fileProp)) {
				fileProp.push(JSON.stringify(info));
				return;
			}
			body[name] = [fileProp, JSON.stringify(info)];
		});
		bus.on("field", (name, value) => {
			const fieldProp = body[name];
			if (!fieldProp) {
				body[name] = parser.parseField(name, value);
				return;
			}
			if (Array.isArray(fieldProp)) {
				fieldProp.push(parser.parseField(name, value));
				return;
			}
			body[name] = [fieldProp, parser.parseField(name, value)];
		});
		bus.on("error", (err: Error) => {
			finish(err, body);
		});
		bus.on("close", () => {
			Promise.all(results)
				.then(files => {
					request.__files__ = files;
					finish(null, body);
				})
				.catch(err => finish(err, body));
		});
		// bus.on("end", () => {
		// 	if (storage.lazy) {
		// 		bus.emit("close");
		// 	}
		// });
		message.pipe(bus);
	});
	instance.addHook("preHandler", async request => {
		const files = request.__files__;
		if (files?.length) {
			const fileFields = Object.create(null) as Dictionary;
			for (const file of files) {
				const field = file.field as string;
				delete file.field;
				const fileProp = fileFields[field];
				if (!fileProp) {
					fileFields[field] = file;
					continue;
				}
				if (Array.isArray(fileProp)) {
					fileProp.push(file);
					continue;
				}
				fileFields[field] = [fileProp, file];
			}
			Object.assign(request.body as Dictionary, fileFields);
		}
		delete request.__files__;
	});
};
(formDataParser as Dictionary)[Symbol.for("skip-override")] = true;

export default formDataParser;