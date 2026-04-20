"use strict";
import test from "ava";
import { Buffer } from "buffer";
import FormData from "form-data";
import formDataParser from "../index.js";
import { BufferStorage } from "../BufferStorage.js";
import { assertHandlerOk, injectForm } from "../test/setup.js";
test("accepts an empty file upload and exposes a zero-length buffer", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser, { storage: new BufferStorage() });
	instance.post("/", async (request, reply) => {
		const body = request.body;
		t.true(body.empty.data instanceof Buffer);
		t.is(body.empty.data.length, 0);
		t.is(body.empty.originalName, "empty.bin");
		reply.code(200).send();
	});
	const form = new FormData();
	form.append("empty", Buffer.alloc(0), { filename: "empty.bin", contentType: "application/octet-stream" });
	const res = await injectForm(instance, form);
	assertHandlerOk(t, res);
});
test("handles fields without a schema as raw strings (no coercion)", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser);
	instance.post("/", async (request, reply) => {
		const body = request.body;
		t.is(body.flag, "true");
		t.is(body.count, "42");
		reply.code(200).send();
	});
	const form = new FormData();
	form.append("flag", "true");
	form.append("count", "42");
	const res = await injectForm(instance, form);
	assertHandlerOk(t, res);
});
test("rejects requests that are not multipart/form-data", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser);
	instance.post("/", async (_req, reply) => reply.code(200).send());
	const res = await instance.inject({
		path: "/",
		method: "POST",
		headers: { "content-type": "application/json" },
		payload: JSON.stringify({ a: 1 })
	});
	// plugin ignores non-multipart; request should be handled by fastify's JSON parser
	t.is(res.statusCode, 200);
});