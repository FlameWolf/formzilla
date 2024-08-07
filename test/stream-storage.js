"use strict";

const setup = require("./setup");
const test = require("ava");
const { Readable } = require("stream");

test("should store file as stream and populate request body", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.is(typeof requestBody.name, "string");
			t.true(requestBody.avatar.stream instanceof Readable);
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance);
	} catch (err) {
		t.fail(err.message);
	}
});