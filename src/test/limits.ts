"use strict";

import test from "ava";
import fs from "fs";
import FormData from "form-data";
import formDataParser from "../index.ts";
import { BufferStorage } from "../BufferStorage.ts";
import { injectForm, sampleFilePath } from "../test/setup.js";

test("rejects when a file exceeds the configured fileSize limit", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser, {
		limits: { fileSize: 16 },
		storage: new BufferStorage()
	});
	instance.post("/", async (_req: any, reply: any) => reply.code(200).send());
	const form = new FormData();
	form.append("avatar", fs.createReadStream(sampleFilePath));
	const res = await injectForm(instance, form);
	t.not(res.statusCode, 200);
});

test("rejects when the number of files exceeds the files limit", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser, {
		limits: { files: 1 },
		storage: new BufferStorage()
	});
	instance.post("/", async (_req: any, reply: any) => reply.code(200).send());
	const form = new FormData();
	form.append("one", fs.createReadStream(sampleFilePath));
	form.append("two", fs.createReadStream(sampleFilePath));
	const res = await injectForm(instance, form);
	t.not(res.statusCode, 200);
});

test("rejects when the number of non-file fields exceeds the fields limit", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser, {
		limits: { fields: 1 },
		storage: new BufferStorage()
	});
	instance.post("/", async (_req: any, reply: any) => reply.code(200).send());
	const form = new FormData();
	form.append("a", "1");
	form.append("b", "2");
	form.append("c", "3");
	const res = await injectForm(instance, form);
	t.not(res.statusCode, 200);
});

test("rejects when the total number of parts exceeds the parts limit", async t => {
	const { fastify } = await import("fastify");
	const instance: any = fastify();
	t.teardown(() => instance.close());
	instance.register(formDataParser, {
		limits: { parts: 1 },
		storage: new BufferStorage()
	});
	instance.post("/", async (_req: any, reply: any) => reply.code(200).send());
	const form = new FormData();
	form.append("a", "1");
	form.append("b", "2");
	form.append("c", "3");
	const res = await injectForm(instance, form);
	t.not(res.statusCode, 200);
});