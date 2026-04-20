"use strict";
import busboy from "busboy";
import { Readable, finished } from "stream";
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
		const results = new Array();
		const body = Object.create(null);
		const schemaBody = request.routeOptions.schema?.body;
		const props = schemaBody && (schemaBody.content?.["multipart/form-data"]?.schema?.properties || schemaBody.properties);
		const parser = props ? new FieldParserWithSchema(props) : new FieldParserNoSchema();
		const bus = busboy({ headers: message.headers, limits, defParamCharset: "utf8" });
		bus.on("partsLimit", () => {
			done(new Error("Parts limit exceeded"));
		});
		bus.on("filesLimit", () => {
			done(new Error("Files limit exceeded"));
		});
		bus.on("fieldsLimit", () => {
			done(new Error("Fields limit exceeded"));
		});
		bus.on("file", (name, stream, info) => {
			stream.on("limit", () => {
				done({
					name: "Bad input",
					message: "File size limit exceeded",
					field: name,
					...info
				});
			});
			try {
				results.push(storage.process(name, stream, info));
			} catch (err) {
				done(err);
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
			body[name] = parser.parseField(name, value);
		});
		bus.on("error", err => {
			done(err, body);
		});
		bus.on("close", () => {
			Promise.all(results).then(files => {
				request.__files__ = files;
				done(null, body);
			});
		});
		bus.on("end", () => {
			if (storage.lazy) {
				bus.emit("close");
			}
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