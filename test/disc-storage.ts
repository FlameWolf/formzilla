"use strict";

import setup from "./setup.ts";
import test from "ava";
import { DiscStorage } from "../DiscStorage.ts";
import type { Dictionary } from "../index.ts";

test("should save file to disc and populate request body", async (t: any) => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body as any;
			t.is(typeof requestBody.name, "string");
			t.is(typeof requestBody.avatar.path, "string");
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, { storage: new DiscStorage() });
	} catch (err: any) {
		t.fail(err.message);
	}
});
test("should read file save target from function", async (t: any) => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body as any;
			t.is(typeof requestBody.name, "string");
			t.is(typeof requestBody.avatar.path, "string");
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, {
			storage: new DiscStorage((file: any) => {
				return {
					fileName: `${Date.now()}_${file.originalName}`
				};
			})
		});
	} catch (err: any) {
		t.fail(err.message);
	}
});
test("should read file save target from async function", async (t: any) => {
	const { fastify } = await import("fastify");
	const instance = fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body as any;
			t.is(typeof requestBody.name, "string");
			t.is(typeof requestBody.avatar.path, "string");
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, {
			storage: new DiscStorage(async (file: any) => {
				return await Promise.resolve({
					fileName: `${Date.now()}_${file.originalName}`
				});
			})
		});
	} catch (err: any) {
		t.fail(err.message);
	}
});