"use strict";
import test from "ava";
import { Buffer } from "buffer";
import formDataParser from "../index.js";
import { BufferStorage } from "../BufferStorage.js";
import { assertHandlerOk, buildStandardForm, injectForm, requestSchema } from "../test/setup.js";
test("BufferStorage stores file as buffer and populates request body", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser, { storage: new BufferStorage() });
	instance.post("/", { schema: requestSchema }, async (request, reply) => {
		const body = request.body;
		t.is(typeof body.name, "string");
		t.true(body.avatar.data instanceof Buffer);
		t.true(body.avatar.data.length > 0);
		t.is(body.avatar.mimeType, "image/png");
		t.is(typeof body.age, "number");
		t.is(body.age, 31);
		t.is(typeof body.address, "object");
		t.is(body.address.id, "316 A");
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildStandardForm());
	assertHandlerOk(t, res);
});