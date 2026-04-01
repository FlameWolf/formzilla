"use strict";

import setupMultifile from "./setup-multifile.ts";
import test from "ava";
import { Readable } from "stream";
import type { Dictionary } from "../index.ts";

test("should allow multiple files in one field", async (t: any) => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body as any;
			t.true(requestBody.files instanceof Array);
			t.true(requestBody.files[0].stream instanceof Readable);
			t.true(requestBody.files[1].stream instanceof Readable);
			t.is(reply.statusCode, 200);
		});
		await setupMultifile(instance);
	} catch (err: any) {
		t.fail(err.message);
	}
});