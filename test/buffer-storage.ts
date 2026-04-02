"use strict";

import setup from "./setup.ts";
import test from "ava";
import { Buffer } from "buffer";
import { BufferStorage } from "../BufferStorage.ts";
import type { Dictionary } from "../index.ts";

test("should store file as buffer and populate request body", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body as Dictionary;
			t.is(typeof requestBody.name, "string");
			t.true(requestBody.avatar.data instanceof Buffer);
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, { storage: new BufferStorage() });
	} catch (err: any) {
		t.fail(err.message);
	}
});