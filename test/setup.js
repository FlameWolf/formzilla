"use strict";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const sampleFilePath = path.join(__dirname, "chequer.png");
export const requestSchema = {
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
export const multifileSchema = {
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
export function buildStandardForm() {
	const form = new FormData();
	form.append("name", "Jane Doe");
	form.append("avatar", fs.createReadStream(sampleFilePath));
	form.append("age", 31);
	form.append(
		"address",
		JSON.stringify({
			id: "316 A",
			street: "First Street"
		})
	);
	return form;
}
export function buildMultifileForm() {
	const form = new FormData();
	form.append("files", fs.createReadStream(sampleFilePath));
	form.append("files", fs.createReadStream(sampleFilePath));
	return form;
}
export async function injectForm(instance, form) {
	return await instance.inject({
		path: "/",
		method: "POST",
		headers: form.getHeaders(),
		payload: form
	});
}
export function assertHandlerOk(t, res) {
	if (res.statusCode !== 200) {
		t.fail(`Handler returned ${res.statusCode}: ${res.body}`);
	}
	t.is(res.statusCode, 200);
}