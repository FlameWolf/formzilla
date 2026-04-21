"use strict";

import test from "ava";
import { Readable } from "stream";
import formDataParser, { type Dictionary } from "../index.ts";
import { assertHandlerOk, buildMultifileForm, injectForm, multifileSchema } from "../test/setup.js";

test("StreamStorage collects multiple files under the same field name", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser);
	instance.post("/", { schema: multifileSchema }, async (request: any, reply: any) => {
		const body = request.body as Dictionary;
		t.true(Array.isArray(body.files));
		t.is(body.files.length, 2);
		for (const file of body.files) {
			t.true(file.stream instanceof Readable);
			const chunks: Array<Buffer> = [];
			for await (const chunk of (file.stream as Readable).read()) {
				chunks.push(chunk as Buffer);
			}
			t.true(chunks.length > 0);
		}
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildMultifileForm());
	assertHandlerOk(t, res);
});