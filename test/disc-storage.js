"use strict";

const setup = require("./setup");
const tap = require("tap");
const { DiscStorage } = require("../DiscStorage");
const { once } = require("events");

tap.test("should save file to disc and populate request body", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.type(requestBody.name, "string");
			t.type(requestBody.avatar.path, "string");
			t.type(requestBody.age, "number");
			t.type(requestBody.address, "object");
			t.equal(reply.statusCode, 200);
		});
		const req = await setup(instance, { storage: new DiscStorage() });
		const [res] = await once(req, "response");
		res.resume();
	} catch (err) {
		console.log(err);
	}
});