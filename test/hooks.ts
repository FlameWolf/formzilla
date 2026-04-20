"use strict";

import test from "ava";
import formDataParser, { type Dictionary } from "../index.ts";
import { BufferStorage } from "../BufferStorage.ts";
import { assertHandlerOk, buildStandardForm, injectForm, requestSchema } from "./setup.ts";

test("__files__ is populated in preValidation and removed before the handler runs", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	let filesInPreValidation: any = "not-set";
	let filesInHandler: any = "not-set";
	instance.register(formDataParser, { storage: new BufferStorage() });
	instance.addHook("preValidation", async (request: any) => {
		filesInPreValidation = request.__files__;
	});
	instance.post("/", { schema: requestSchema }, async (request: any, reply: any) => {
		filesInHandler = request.__files__;
		const body = request.body as Dictionary;
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