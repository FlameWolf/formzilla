"use strict";

import setup from "./setup.ts";
import test from "ava";
import { CallbackStorage } from "../CallbackStorage.ts";
import { FileInternal } from "../FileInternal.ts";
import type { Dictionary } from "../index.ts";

test("should pass file stream to callback and populate request body", async (t: any) => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body as any;
			t.is(typeof requestBody.name, "string");
			t.is(typeof requestBody.avatar, "object");
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, {
			storage: new CallbackStorage((name: any, stream: any, info: any) => {
				const file = new FileInternal(name, info);
				const data = new Array<any>();
				stream.on("data", (chunk: any) => data.push(chunk));
				stream.on("close", () => {
					file.data = Buffer.concat(data);
				});
				return file;
			})
		});
	} catch (err: any) {
		t.fail(err.message);
	}
});