"use strict";

const { StreamStorage } = require("./StreamStorage");
const { FieldParserWithSchema } = require("./FieldParserWithSchema");
const { FieldParserNoSchema } = require("./FieldParserNoSchema");
const busboy = require("busboy");
const { finished } = require("stream");

const formDataParser = async (instance, options) => {
	const { limits, storage = new StreamStorage() } = options;
	instance.addContentTypeParser("multipart/form-data", (request, message, done) => {
		const results = [];
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
		finished(bus, (err = null) => {
			Promise.all(results).then(files => {
				request.__files__ = files;
				done(err, body);
			});
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

exports.default = formDataParser;