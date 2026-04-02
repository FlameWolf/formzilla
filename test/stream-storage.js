"use strict";
import setup from "./setup.js";
import test from "ava";
import { Readable } from "stream";
test("should store file as stream and populate request body", async (t) => {
    const { fastify } = await import("fastify");
    const instance = fastify();
    t.teardown(async () => {
        await instance.close();
    });
    try {
        instance.addHook("onResponse", async (request, reply) => {
            const requestBody = request.body;
            t.is(typeof requestBody.name, "string");
            t.true(requestBody.avatar.stream instanceof Readable);
            t.is(typeof requestBody.age, "number");
            t.is(typeof requestBody.address, "object");
            t.is(reply.statusCode, 200);
        });
        await setup(instance);
    }
    catch (err) {
        t.fail(err.message);
    }
});
