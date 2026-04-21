"use strict";

import test from "ava";
import { Readable } from "stream";
import formDataParser, { type Dictionary } from "../index.ts";
import { assertHandlerOk, buildStandardForm, injectForm, requestSchema } from "../test/setup.js";

test("StreamStorage (default) exposes file as Readable stream", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser);
	instance.post("/", { schema: requestSchema }, async (request: any, reply: any) => {
		const body = request.body as Dictionary;
		t.is(typeof body.name, "string");
		t.true(body.avatar.stream instanceof Readable);
		const chunks: Array<Buffer> = [];
		for await (const chunk of (body.avatar.stream as Readable).read()) {
			chunks.push(chunk as Buffer);
		}
		t.true(chunks.length > 0);
		t.is(typeof body.age, "number");
		t.is(typeof body.address, "object");
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildStandardForm());
	assertHandlerOk(t, res);
});