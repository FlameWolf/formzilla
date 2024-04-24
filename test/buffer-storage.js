"use strict";

const setup = require("./setup");
const test = require("ava");
const { Buffer } = require("buffer");
const { BufferStorage } = require("../BufferStorage");

test("should store file as buffer and populate request body", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.is(typeof requestBody.name, "string");
			t.true(requestBody.avatar.data instanceof Buffer);
			t.is(typeof requestBody.age, "number");
			t.is(typeof requestBody.address, "object");
			t.is(reply.statusCode, 200);
		});
		await setup(instance, { storage: new BufferStorage() });
	} catch (err) {
		t.fail(err.message);
	}
});