"use strict";

import setup from "./setup.ts";
import test from "ava";
import { Readable } from "stream";
import type { Dictionary } from "../index.ts";

test("should parse fields as strings when there is no schema", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body as Dictionary;
			t.is(typeof requestBody.name, "string");
			t.true(requestBody.avatar.stream instanceof Readable);
			t.is(typeof requestBody.age, "string");
			t.is(typeof requestBody.address, "string");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, undefined, false);
	} catch (err: any) {
		t.fail(err.message);
	}
});