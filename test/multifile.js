"use strict";

const setupMultifile = require("./setup-multifile");
const test = require("ava");
const { Readable } = require("stream");

test("should allow multiple files in one field", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.true(requestBody.files instanceof Array);
			t.true(requestBody.files[0].stream instanceof Readable);
			t.true(requestBody.files[1].stream instanceof Readable);
			t.is(reply.statusCode, 200);
		});
		await setupMultifile(instance);
	} catch (err) {
		t.fail(err.message);
	}
});