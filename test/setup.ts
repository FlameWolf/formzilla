"use strict";

import formDataParser from "../index.ts";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const requestSchema = {
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
};
export default async function (instance: any, options: any | undefined = undefined, includeSchema = true) {
	instance.register(formDataParser, options as any);
	instance.post(
		"/",
		{
			schema: (includeSchema && requestSchema) as any
		},
		async (request: any, reply: any) => {
			reply.status(200).send();
		}
	);
	await instance.listen({ port: 0, host: "::" });
	const form = new FormData();
	form.append("name", "Jane Doe");
	form.append("avatar", fs.createReadStream(path.join(__dirname, "chequer.png")));
	form.append("age", 31);
	form.append(
		"address",
		JSON.stringify({
			id: "316 A",
			street: "First Street"
		})
	);
	return await instance.inject({
		path: "/",
		headers: form.getHeaders(),
		method: "POST",
		payload: form
	});
}