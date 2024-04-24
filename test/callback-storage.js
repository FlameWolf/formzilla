"use strict";

const setup = require("./setup");
const test = require("ava");
const { CallbackStorage } = require("../CallbackStorage");
const { FileInternal } = require("../FileInternal");
const { once } = require("events");

test("should pass file stream to callback and populate request body", async t => {
	const instance = require("fastify").fastify();
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
		const req = await setup(instance, {
			storage: new CallbackStorage((name, stream, info) => {
				const file = new FileInternal(name, info);
				const data = [];
				stream.on("data", chunk => data.push(chunk));
				stream.on("close", () => {
					file.data = Buffer.concat(data);
				});
				return file;
			})
		});
		const [res] = await once(req, "response");
		res.resume();
	} catch (err) {
		t.fail(err.message);
	}
});