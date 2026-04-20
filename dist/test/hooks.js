"use strict";
import test from "ava";
import formDataParser from "../index.js";
import { BufferStorage } from "../BufferStorage.js";
import { assertHandlerOk, buildStandardForm, injectForm, requestSchema } from "../test/setup.js";
test("__files__ is populated in preValidation and removed before the handler runs", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(() => instance.close());
	let filesInPreValidation = "not-set";
	let filesInHandler = "not-set";
	instance.register(formDataParser, { storage: new BufferStorage() });
	instance.addHook("preValidation", async request => {
		filesInPreValidation = request.__files__;
	});
	instance.post("/", { schema: requestSchema }, async (request, reply) => {
		filesInHandler = request.__files__;
		const body = request.body;
		t.truthy(body.avatar);
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildStandardForm());
	assertHandlerOk(t, res);
	t.true(Array.isArray(filesInPreValidation));
	t.is(filesInPreValidation.length, 1);
	t.is(filesInPreValidation[0].originalName, "chequer.png");
	t.is(filesInHandler, undefined);
});