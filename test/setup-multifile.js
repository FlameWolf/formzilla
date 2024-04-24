"use strict";

const formDataParser = require("../index");
const formData = require("form-data");
const path = require("path");
const fs = require("fs");

const requestSchema = {
	consumes: ["multipart/form-data"],
	body: {
		type: "object",
		properties: {
			files: {
				type: "array",
				items: {
					type: "string",
					format: "binary"
				}
			}
		}
	}
};
module.exports = async function (instance, options = undefined, includeSchema = true) {
	instance.register(formDataParser, options);
	instance.post(
		"/",
		{
			schema: includeSchema && requestSchema
		},
		async (request, reply) => {
			reply.status(200).send();
		}
	);
	await instance.listen({ port: 0, host: "::" });
	const form = new formData();
	const stream = fs.createReadStream(path.join(__dirname, "chequer.png"));
	form.append("files", stream);
	form.append("files", stream);
	return await instance.inject({
		protocol: "http:",
		hostname: "localhost",
		port: instance.server.address().port,
		path: "/",
		headers: form.getHeaders(),
		method: "POST",
		payload: form
	});
};