"use strict";

import formDataParser, { type Dictionary } from "../index.ts";
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
export default async function (instance: any, options: any | undefined = undefined, includeSchema = true) {
	instance.register(formDataParser, options as Dictionary);
	instance.post(
		"/",
		{
			schema: (includeSchema && requestSchema) as Dictionary
		},
		async (request: any, reply: any) => {
			reply.status(200).send();
		}
	);
	await instance.listen({ port: 0, host: "::" });
	const form = new FormData();
	const stream = fs.createReadStream(path.join(__dirname, "chequer.png"));
	form.append("files", stream);
	form.append("files", stream);
	return await instance.inject({
		path: "/",
		headers: form.getHeaders(),
		method: "POST",
		payload: form
	});
}