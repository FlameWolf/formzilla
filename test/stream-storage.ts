"use strict";

import setup from "./setup.ts";
import test from "ava";
import { Readable } from "stream";
import type { Dictionary } from "../index.ts";

test("should store file as stream and populate request body", async (t: any) => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body as any;
			t.is(typeof requestBody.name, "string");
			t.true(requestBody.avatar.stream instanceof Readable);
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance);
	} catch (err: any) {
		t.fail(err.message);
	}
});