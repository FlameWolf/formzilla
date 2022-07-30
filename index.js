"use strict";

const busboy = require("busboy");
const { StreamStorage } = require("./StreamStorage");
const formDataParser = async (instance, options) => {
	instance.addContentTypeParser("multipart/form-data", (request, message, done) => {
		const files = [];
		const body = {};
		const props = request.context.schema?.body?.properties;
		const bus = busboy({ headers: message.headers, limits: options?.limits });
		bus.on("file", (name, stream, info) => {
			files.push((options.storage || new StreamStorage()).process(name, stream, info));
			body[name] = JSON.stringify(info);
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

exports.default = formDataParser;