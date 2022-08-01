"use strict";

const busboy = require("busboy");
const { StreamStorage } = require("./StreamStorage");
const tryParse = value => {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
};
const formDataParser = async (instance, options) => {
	instance.addContentTypeParser("multipart/form-data", (request, message, done) => {
		const files = [];
		const body = {};
		const props = request.context.schema?.body?.properties;
		const parseField = props ? (name, value) => (props[name]?.type === "string" ? value : tryParse(value)) : (name, value) => value;
		const bus = busboy({ headers: message.headers, limits: options?.limits });
		bus.on("file", (name, stream, info) => {
			files.push((options.storage || new StreamStorage()).process(name, stream, info));
			body[name] = JSON.stringify(info);
		});
		bus.on("field", (name, value) => {
			body[name] = parseField(name, value);
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

exports.default = formDataParser;