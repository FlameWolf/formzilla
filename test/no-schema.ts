"use strict";

import test from "ava";
import { Readable } from "stream";
import formDataParser, { type Dictionary } from "../index.ts";
import { assertHandlerOk, buildStandardForm, injectForm } from "./setup.ts";

test("fields are treated as raw strings when no schema is provided", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser);
	instance.post("/", async (request: any, reply: any) => {
		const body = request.body as Dictionary;
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