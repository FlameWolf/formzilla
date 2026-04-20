"use strict";

import test from "ava";
import fs from "fs";
import os from "os";
import path from "path";
import formDataParser, { type Dictionary } from "../index.ts";
import { DiscStorage } from "../DiscStorage.ts";
import { assertHandlerOk, buildStandardForm, injectForm, requestSchema } from "./setup.ts";

function makeTempDir() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "formzilla-test-"));
}

function cleanupDir(dir: string) {
	try {
		fs.rmSync(dir, { recursive: true, force: true });
	} catch {
		void 0;
	}
}

test("DiscStorage saves file to disc and populates request body", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	const dir = makeTempDir();
	t.teardown(async () => {
		await instance.close();
		cleanupDir(dir);
	});
	instance.register(formDataParser, { storage: new DiscStorage({ directory: dir }) });
	instance.post("/", { schema: requestSchema }, async (request: any, reply: any) => {
		const body = request.body as Dictionary;
		t.is(typeof body.name, "string");
		t.is(typeof body.avatar.path, "string");
		t.assert(fs.existsSync(body.avatar.path));
		t.assert(fs.statSync(body.avatar.path).isFile);
		t.is(typeof body.age, "number");
		t.is(typeof body.address, "object");
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildStandardForm());
	assertHandlerOk(t, res);
});

test("DiscStorage reads file save target from function", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	const dir = makeTempDir();
	t.teardown(async () => {
		await instance.close();
		cleanupDir(dir);
	});
	instance.register(formDataParser, {
		storage: new DiscStorage((file: any) => {
			return {
				directory: dir,
				fileName: `${Date.now()}_${file.originalName}`
			};
		})
	});
	instance.post("/", { schema: requestSchema }, async (request: any, reply: any) => {
		const body = request.body as Dictionary;
		t.is(typeof body.avatar.path, "string");
		t.is(path.dirname(body.avatar.path), dir);
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildStandardForm());
	assertHandlerOk(t, res);
});

test("DiscStorage reads file save target from async function", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	const dir = makeTempDir();
	t.teardown(async () => {
		await instance.close();
		cleanupDir(dir);
	});
	instance.register(formDataParser, {
		storage: new DiscStorage(async (file: any) => {
			return await Promise.resolve({
				directory: dir,
				fileName: `${Date.now()}_${file.originalName}`
			});
		})
	});
	instance.post("/", { schema: requestSchema }, async (request: any, reply: any) => {
		const body = request.body as Dictionary;
		t.is(typeof body.avatar.path, "string");
		t.is(path.dirname(body.avatar.path), dir);
		reply.code(200).send();
	});
	const res = await injectForm(instance, buildStandardForm());
	assertHandlerOk(t, res);
});