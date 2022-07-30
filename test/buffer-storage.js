"use strict";

const setup = require("./setup");
const tap = require("tap");
const { Buffer } = require("buffer");
const { BufferStorage } = require("../BufferStorage");
const { once } = require("events");

tap.test("should store file as buffer and populate request body", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.type(requestBody.name, "string");
			t.ok(requestBody.avatar.data instanceof Buffer);
			t.type(requestBody.age, "number");
			t.type(requestBody.address, "object");
			t.equal(reply.statusCode, 200);
		});
		const req = await setup(instance, { storage: new BufferStorage() });
		const [res] = await once(req, "response");
		res.resume();
	} catch (err) {
		console.log(err);
	}
});