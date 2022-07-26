"use strict";

const busboy = require("busboy");
class File {
	field;
	name;
	encoding;
	mimeType;
	data;
	constructor(name, info) {
		this.field = name;
		if (info) {
			this.name = info.filename;
			this.encoding = info.encoding;
			this.mimeType = info.mimeType;
		}
	}
}
const formDataParser = async (instance, options) => {
	instance.addContentTypeParser("multipart/form-data", (request, message, done) => {
		const files = [];
		const body = {};
		const props = request.context.schema?.body?.properties;
		const bus = busboy({ headers: message.headers, limits: options });
		bus.on("file", (name, stream, info) => {
			const data = [];
			const file = new File(name, info);
			stream.on("data", chunk => data.push(chunk));
			stream.on("close", () => {
				file.data = Buffer.concat(data);
				files.push(file);
				body[name] = JSON.stringify(info);
			});
		});
		bus.on("field", (name, value) => {
			if (props && props[name]?.type !== "string") {
				try {
					body[name] = JSON.parse(value);
					return;
				} catch (err) {}
			}
			body[name] = value;
		});
		bus.on("close", () => {
			request.__files__ = files;
			done(null, body);
		});
		bus.on("error", error => {
			done(error);
		});
		message.pipe(bus);
	});
	instance.addHook("preHandler", async (request, reply) => {
		const body = request.body;
		const files = request.__files__;
		if (files?.length) {
			for (const fileObject of files) {
				const field = fileObject.field;
				delete fileObject.field;
				body[field] = fileObject;
			}
		}
		delete request.__files__;
	});
};
formDataParser[Symbol.for("skip-override")] = true;

exports.File = File;
exports.default = formDataParser;