"use strict";
import formDataParser, {} from "../index.js";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requestSchema = {
    consumes: ["multipart/form-data"],
    body: {
        type: "object",
        properties: {
            files: {
                type: "array",
                items: {
                    type: "string",
                    format: "binary"
                }
            }
        }
    }
};
export default async function (instance, options = undefined, includeSchema = true) {
    instance.register(formDataParser, options);
    instance.post("/", {
        schema: (includeSchema && requestSchema)
    }, async (request, reply) => {
        reply.status(200).send();
    });
    await instance.listen({ port: 0, host: "::" });
    const form = new FormData();
    const stream = fs.createReadStream(path.join(__dirname, "chequer.png"));
    form.append("files", stream);
    form.append("files", stream);
    return await instance.inject({
        path: "/",
        headers: form.getHeaders(),
        method: "POST",
        payload: form
    });
}
