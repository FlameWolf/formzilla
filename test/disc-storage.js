"use strict";

const setup = require("./setup");
const test = require("ava");
const { DiscStorage } = require("../DiscStorage");

test("should save file to disc and populate request body", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.is(typeof requestBody.name, "string");
			t.is(typeof requestBody.avatar.path, "string");
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, { storage: new DiscStorage() });
	} catch (err) {
		t.fail(err.message);
	}
});
test("should read file save target from function", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.is(typeof requestBody.name, "string");
			t.is(typeof requestBody.avatar.path, "string");
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, {
			storage: new DiscStorage(file => {
				return {
					fileName: `${Date.now()}_${file.originalName}`
				};
			})
		});
	} catch (err) {
		t.fail(err.message);
	}
});