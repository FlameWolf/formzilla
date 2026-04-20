"use strict";
import test from "ava";
import { Readable } from "stream";
import formDataParser from "../index.js";
import { assertHandlerOk, buildStandardForm, injectForm } from "../test/setup.js";
test("fields are treated as raw strings when no schema is provided", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser);
	instance.post("/", async (request, reply) => {
		const body = request.body;
		t.is(typeof body.name, "string");
		t.true(body.avatar.stream instanceof Readable);
		t.is(typeof body.age, "string");
		t.is(body.age, "31");
		t.is(typeof body.address, "string");
		// drain stream so busboy can complete
		body.avatar.stream.resume();
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildStandardForm());
	assertHandlerOk(t, res);
});