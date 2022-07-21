"use strict";

const busboy = require("busboy");
class RouteSchemaMap extends Object {}
class File {
	fieldName;
	fileName;
	encoding;
	mimeType;
	data;
	constructor(fileInfo) {
		if (fileInfo) {
			this.fileName = fileInfo.filename;
			this.encoding = fileInfo.encoding;
			this.mimeType = fileInfo.mimeType;
		}
	}
}
const formDataParser = async (instance, options) => {
	const instanceSchemas = new RouteSchemaMap();
	instance.addContentTypeParser("multipart/form-data", (request, message, done) => {
		const fileList = [];
		const formData = {};
		const schemaProps = instanceSchemas[request.url]?.properties;
		const bus = busboy({ headers: message.headers, limits: options });
		bus.on("file", (fieldName, file, fileInfo) => {
			const chunks = [];
			const fileObject = new File(fileInfo);
			fileObject.fieldName = fieldName;
			file.on("data", data => chunks.push(data));
			file.on("close", () => {
				fileObject.data = Buffer.concat(chunks);
				fileList.push(fileObject);
				formData[fieldName] = JSON.stringify(fileInfo);
			});
		});
		bus.on("field", (fieldName, fieldValue) => {
			if (schemaProps) {
				const schemaType = schemaProps[fieldName]?.type;
				if (schemaType !== "string") {
					try {
						formData[fieldName] = JSON.parse(fieldValue);
						return;
					} catch (err) {}
				}
			}
			formData[fieldName] = fieldValue;
		});
		bus.on("close", () => {
			request.__files__ = fileList;
			done(null, formData);
		});
		bus.on("error", error => {
			done(error);
		});
		message.pipe(bus);
	});
	instance.addHook("onRoute", async routeOptions => {
		instanceSchemas[routeOptions.url] = routeOptions.schema?.body;
	});
	instance.addHook("preHandler", async (request, reply) => {
		const requestBody = request.body;
		const requestFiles = request.__files__;
		if (requestFiles?.length) {
			for (const fileObject of requestFiles) {
				const fieldName = fileObject.fieldName;
				delete fileObject.fieldName;
				requestBody[fieldName] = fileObject;
			}
		}
		delete request.__files__;
	});
};
formDataParser[Symbol.for("skip-override")] = true;

exports.default = formDataParser;