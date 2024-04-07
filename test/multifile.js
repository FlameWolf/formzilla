"use strict";

const setup = require("./setup-multifile");
const tap = require("tap");
const { Readable } = require("stream");
const { once } = require("events");
const formData = require("form-data");
const http = require("http");
const path = require("path");
const fs = require("fs");


async function sendRequest(instance) {
    const form = new formData();
	const req = http.request({
		protocol: "http:",
		hostname: "localhost",
		port: instance.server.address().port,
		path: "/",
		headers: form.getHeaders(),
		method: "POST"
	});
	const filePath = path.join(__dirname, "chequer.png");
	form.append("file", fs.createReadStream(filePath));
	form.append("files", fs.createReadStream(filePath));
    form.append("files", fs.createReadStream(filePath));
    form.append("files", fs.createReadStream(filePath));
	return form.pipe(req);
};

tap.test("should allow multiple files in one field", async t => {
	const instance = require("fastify").fastify();
	t.teardown(async () => {
		await instance.close();
	});
	try {
		instance.addHook("onResponse", async (request, reply) => {
			const requestBody = request.body;
			t.isArray(requestBody.files);
			t.ok(requestBody.files[0].stream instanceof Readable);
            t.ok(requestBody.files[1].stream instanceof Readable);
			t.equal(reply.statusCode, 200);
		});
		await setup(instance, undefined, false);
        const req = await sendRequest(instance);
		const [res] = await once(req, "response");
		res.resume();
	} catch (err) {
		console.log(err);
	}
});