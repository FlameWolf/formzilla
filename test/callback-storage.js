"use strict";
import setup from "./setup.js";
import test from "ava";
import { CallbackStorage } from "../CallbackStorage.js";
import { FileInternal } from "../FileInternal.js";
test("should pass file stream to callback and populate request body", async t => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.is(typeof requestBody.name, "string");
			t.is(typeof requestBody.avatar, "object");
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, {
			storage: new CallbackStorage((name, stream, info) => {
				const file = new FileInternal(name, info);
				const data = new Array();
				stream.on("data", chunk => data.push(chunk));
				stream.on("close", () => {
					file.data = Buffer.concat(data);
				});
				return file;
			})
		});
	} catch (err) {
		t.fail(err.message);
	}
});