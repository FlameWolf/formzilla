"use strict";

import test from "ava";
import { Buffer } from "buffer";
import formDataParser, { type Dictionary } from "../index.ts";
import { CallbackStorage } from "../CallbackStorage.ts";
import { FileInternal } from "../FileInternal.ts";
import { assertHandlerOk, buildStandardForm, injectForm, requestSchema } from "../test/setup.js";

test("CallbackStorage passes file stream to callback and populates request body", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser, {
		storage: new CallbackStorage((name: any, stream: any, info: any) => {
			return new Promise(resolve => {
				const file = new FileInternal(name, info);
				const chunks: Array<Buffer> = [];
				stream.on("data", (chunk: Buffer) => chunks.push(chunk));
				stream.on("end", () => {
					file.data = Buffer.concat(chunks);
					resolve(file);
				});
				stream.on("error", (err: any) => {
					file.error = err;
					resolve(file);
				});
			});
		})
	});
	instance.post("/", { schema: requestSchema }, async (request: any, reply: any) => {
		const body = request.body as Dictionary;
		t.is(typeof body.name, "string");
		t.is(typeof body.avatar, "object");
		t.true(body.avatar.data instanceof Buffer);
		t.true(body.avatar.data.length > 0);
		t.is(typeof body.age, "number");
		t.is(typeof body.address, "object");
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildStandardForm());
	assertHandlerOk(t, res);
});