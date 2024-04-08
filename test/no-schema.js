"use strict";

const setup = require("./setup");
const tap = require("tap");
const { Readable } = require("stream");
const { once } = require("events");

tap.test("should parse fields as strings when there is no schema", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.type(requestBody.name, "string");
			t.ok(requestBody.avatar.stream instanceof Readable);
			t.type(requestBody.age, "string");
			t.type(requestBody.address, "string");
			t.equal(reply.statusCode, 200);
		});
		const req = await setup(instance, undefined, false);
		const [res] = await once(req, "response");
		res.resume();
	} catch (err) {
		console.log(err);
	}
});
