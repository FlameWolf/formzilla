"use strict";

const formDataParser = require("../index");

const requestSchema = {
	consumes: ["multipart/form-data"],
	body: {
		type: "object",
		properties: {
			file: {
				type: "string",
				format: "binary"
			},
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
};