"use strict";

const { StreamStorage } = require("./StreamStorage");
const { FieldParserNoSchema } = require("./FieldParserNoSchema");
const { FieldParserWithSchema } = require("./FieldParserWithSchema");
const busboy = require("busboy");
const { finished } = require("stream");

const formDataParser = async (instance, options) => {
	const { limits, storage = new StreamStorage() } = options;
	instance.addContentTypeParser("multipart/form-data", (request, message, done) => {
		const results = [];
		const body = new Map();
		const props = request.routeOptions.schema?.body?.properties;
		const parser = props ? new FieldParserWithSchema(props) : new FieldParserNoSchema();
		const bus = busboy({ headers: message.headers, limits, defParamCharset: "utf8" });
		bus.on("file", (name, stream, info) => {
			results.push(storage.process(name, stream, info));
			const fileProp = body.get(name);
			if (!fileProp) {
				body.set(name, JSON.stringify(info));
				return;
			}
			if (Array.isArray(fileProp)) {
				fileProp.push(JSON.stringify(info));
				return;
			}
			body.set(name, [fileProp, JSON.stringify(info)]);
		});
		bus.on("field", (name, value) => {
			body.set(name, parser.parseField(name, value));
		});
		finished(bus, (err = null) => {
			Promise.all(results).then(files => {
				request.__files__ = files;
				done(err, Object.fromEntries(body));
			});
		});
		message.pipe(bus);
	});
	instance.addHook("preHandler", async request => {
		const files = request.__files__;
		if (files?.length) {
			const fileFields = new Map();
			for (const file of files) {
				const field = file.field;
				delete file.field;
				const fileProp = fileFields.get(field);
				if (!fileProp) {
					fileFields.set(field, file);
					continue;
				}
				if (Array.isArray(fileProp)) {
					fileProp.push(file);
					continue;
				}
				fileFields.set(field, [fileProp, file]);
			}
			Object.assign(request.body, Object.fromEntries(fileFields));
		}
		delete request.__files__;
	});
};
formDataParser[Symbol.for("skip-override")] = true;

exports.default = formDataParser;