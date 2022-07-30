"use strict";

const formDataParser = require("../index");
const formData = require("form-data");
const http = require("http");
const path = require("path");
const fs = require("fs");

module.exports = async function (instance, options = undefined) {
	instance.register(formDataParser, options);
	instance.post(
		"/",
		{
			schema: {
				consumes: ["multipart/form-data"],
				body: {
					type: "object",
					properties: {
						name: {
							type: "string"
						},
						age: {
							type: "integer"
						},
						avatar: {
							type: "string",
							format: "binary"
						},
						address: {
							type: "object",
							properties: {
								id: { type: "string" },
								street: { type: "string" }
							},
							required: ["id", "street"]
						}
					}
				}
			}
		},
		async (request, reply) => {
			reply.status(200).send();
		}
	);
	await instance.listen({ port: 0, host: "::" });
	const form = new formData();
	const req = http.request({
		protocol: "http:",
		hostname: "localhost",
		port: instance.server.address().port,
		path: "/",
		headers: form.getHeaders(),
		method: "POST"
	});
	const filePath = path.join(__dirname, "chequer.png");
	form.append("name", "Jane Doe");
	form.append("avatar", fs.createReadStream(filePath));
	form.append("age", 31);
	form.append(
		"address",
		JSON.stringify({
			id: "316 A",
			street: "First Street"
		})
	);
	form.pipe(req);
	return [form, req];
};