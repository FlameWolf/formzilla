"use strict";
import setup from "./setup.js";
import test from "ava";
import { Buffer } from "buffer";
import { BufferStorage } from "../BufferStorage.js";
test("should store file as buffer and populate request body", async (t) => {
    const { fastify } = await import("fastify");
    const instance = fastify();
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
    }
    catch (err) {
        t.fail(err.message);
    }
});
