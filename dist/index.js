"use strict";
import busboy from "busboy";
import { Readable } from "stream";
import { FieldParserNoSchema } from "./FieldParserNoSchema.js";
import { FieldParserWithSchema } from "./FieldParserWithSchema.js";
import { StreamStorage } from "./StreamStorage.js";
export { BufferStorage } from "./BufferStorage.js";
export { CallbackStorage } from "./CallbackStorage.js";
export { DiscStorage } from "./DiscStorage.js";
export { StreamStorage } from "./StreamStorage.js";
export { FileInternal } from "./FileInternal.js";
export { FieldParserNoSchema } from "./FieldParserNoSchema.js";
export { FieldParserWithSchema } from "./FieldParserWithSchema.js";
const formDataParser = async (instance, options) => {
	const { limits, storage = new StreamStorage() } = options;
	instance.addContentTypeParser("multipart/form-data", (request, message, done) => {
		let settled = false;
		const results = new Array();
		const body = Object.create(null);
		const schemaBody = request.routeOptions.schema?.body;
		const props = schemaBody && (schemaBody.content?.["multipart/form-data"]?.schema?.properties || schemaBody.properties);
		const parser = props ? new FieldParserWithSchema(props) : new FieldParserNoSchema();
		const bus = busboy({ headers: message.headers, limits, defParamCharset: "utf8" });
		const finish = (err, body) => {
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
		const populateField = (name, value, isFile = false) => {
			const fieldProp = body[name];
			const fieldValue = isFile ? JSON.stringify(value) : parser.parseField(name, value);
			if (!fieldProp) {
				body[name] = fieldValue;
				return;
			}
			if (Array.isArray(fieldProp)) {
				fieldProp.push(fieldValue);
				return;
			}
			body[name] = [fieldProp, fieldValue];
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
			} catch (err) {
				stream.resume();
				finish(err);
			}
			populateField(name, info, true);
		});
		bus.on("field", (name, value) => {
			populateField(name, value);
		});
		bus.on("error", err => {
			finish(err, body);
		});
		bus.on("close", () => {
			Promise.all(results)
				.then(files => {
					request.__files__ = files;
					finish(null, body);
				})
				.catch(finish);
		});
		message.pipe(bus);
	});
	instance.addHook("preHandler", async request => {
		const files = request.__files__;
		if (files?.length) {
			const fileFields = Object.create(null);
			for (const file of files) {
				const field = file.field;
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
			Object.assign(request.body, fileFields);
		}
		delete request.__files__;
	});
};
formDataParser[Symbol.for("skip-override")] = true;
export default formDataParser;