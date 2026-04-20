# Formzilla

Formzilla is a [Fastify](http://fastify.io/) plugin to handle `multipart/form-data` content.

# Why?

Even though other plugins for the same purpose exist, like [@fastify/multipart][1] and [fastify-multer][2], when dealing with mixed content, they don't play well with JSON schemas which are Fastify's built-in mechanism for request validation and documentation. Formzilla is intended to work seamlessly with JSON schemas and [@fastify/swagger][3].

# Example

Let's say you have an endpoint that accepts `multipart/form-data` with the following schema.

```ts
const postCreateSchema = {
	consumes: ["multipart/form-data"],
	body: {
		type: "object",
		properties: {
			content: {
				type: "string"
			},
			media: {
				type: "string",
				format: "binary"
			},
			poll: {
				type: "object",
				properties: {
					first: { type: "string" },
					second: { type: "string" }
				},
				required: ["first", "second"]
			}
		}
	}
};
```

You will find that neither `@fastify/multipart` nor `fastify-multer` will process this schema correctly, unless you add a `preValidation` hook to convert your request body into the correct schema. I created Formzilla to solve this exact problem.

```ts
import fastify, { FastifyInstance } from "fastify";
import formDataParser from "formzilla";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

const postCreateSchema = {
	consumes: ["multipart/form-data"],
	body: {
		type: "object",
		properties: {
			content: {
				type: "string"
			},
			media: {
				type: "string",
				format: "binary"
			},
			poll: {
				type: "object",
				properties: {
					first: { type: "string" },
					second: { type: "string" }
				},
				required: ["first", "second"]
			}
		}
	}
};
const server: FastifyInstance = fastify({ logger: true });
server.register(formDataParser);
server.register(fastifySwagger, {
	mode: "dynamic",
	openapi: {
		info: {
			title: "Formzilla Demo",
			version: "1.0.0"
		}
	}
});
server.register(fastifySwaggerUi, {
	routePrefix: "/swagger"
});
server.register(async (instance, options) => {
	instance.post("/create-post", {
		schema: postCreateSchema,
		handler: (request, reply) => {
			console.log(request.body);
			/*
			request.body will look like this:
			{
				content: "Test.",
				poll: { first: "Option 1", second: "Option 2" },
				media: {
					originalName: "flame-wolf.png",
					encoding: "7bit",
					mimeType: "image/png",
					path?: <string>,		// Only when using DiscStorage
					stream?: <Readable>,	// Only when using StreamStorage — must be consumed (piped or drained) or the upload stalls
					data?: <Buffer>,		// Only when using BufferStorage
					error?: <Error>			// Only if any errors occur during processing
				}
			}
			*/
			reply.status(200).send();
		}
	});
});
server.listen(
	{
		port: +(process.env.PORT as string) || 1024,
		host: process.env.HOST || "::"
	},
	(err, address) => {
		if (err) {
			console.log(err.message);
			process.exit(1);
		}
		console.log(`Listening on ${address}`);
	}
);
```

# Installation

```sh
npm install formzilla
```

You must register the plugin before registering your application routes.

## API

### Version compatibility

| Formzilla | Fastify |
| --------- | ------- |
| 1.x       | < 4.8   |
| 2.x       | < 4.8   |
| 3.x       | ≥ 4.8   |
| 4.x       | ≥ 4.8   |
| 5.x       | ≥ 4.8   |

### Options

These are the valid keys for the `options` object parameter accepted by Formzilla:

-   `limits`: Same as the `limits` configuration option for [busboy][4].

    ```ts
    const formLimits = {
    	fieldNameSize: number, // Max field name size (in bytes). Default: 100.
    	fieldSize: number, // Max field value size (in bytes). Default: 1048576 (1MB).
    	fields: number, // Max number of non-file fields. Default: Infinity.
    	fileSize: number, // For multipart forms, the max file size (in bytes). Default: Infinity.
    	files: number, // For multipart forms, the max number of file fields. Default: Infinity.
    	parts: number, // For multipart forms, the max number of parts (fields + files). Default: Infinity.
    	headerPairs: number // For multipart forms, the max number of header key-value pairs to parse. Default: 2000 (same as node's http module).
    };
    server.register(formDataParser, {
    	limits: formLimits
    });
    ```

-   `storage`: Where to store the files, if any, included in the request. Formzilla provides the following built-in options. It is also possible to write [custom storage plugins](#custom-storage).

    -   `StreamStorage`: The default storage option. Streams file contents end-to-end — the handler starts before the upload finishes, and file data flows through `file.stream` as it arrives. Your handler must consume `file.stream` (pipe or drain it); ignoring it will stall the upload. Example:

        ```ts
        server.register(formDataParser, {
        	storage: new StreamStorage()
        });
        ```

    -   `BufferStorage`: Emulates Formzilla 1.x behaviour by storing file contents as a `Buffer` in the `data` property of the file. Example:

        ```ts
        server.register(formDataParser, {
        	storage: new BufferStorage()
        });
        ```

    -   `DiscStorage`: Saves the file to disk. Accepts a `FileSaveTarget` object or a function that accepts a `FormzillaFile` and returns one:

        ```ts
        interface FileSaveTarget {
        	directory?: string; // Defaults to the OS temp directory.
        	fileName?: string; // Defaults to the original file name.
        }
        ```

        Example:

        ```ts
        server.register(formDataParser, {
        	storage: new DiscStorage(file => {
        		return {
        			directory: path.join(__dirname, "public"),
        			fileName: path.basename(file.originalName).toUpperCase()
        		};
        	})
        });
        ```

        **Security note:** both `file.originalName` and any value you compute from it come from the client's multipart headers and may contain path separators or `..` segments. Always run the chosen `fileName` through `path.basename()` (and verify the resolved destination stays inside your intended directory) before returning it, or an attacker can write files outside the target directory.

    -   `CallbackStorage`: For advanced users. Accepts a callback function that takes three parameters: a `string`, a `Readable`, and a `busboy.FileInfo`. The callback function must consume the `Readable` and return either a `FormzillaFile` or a promise that resolves to a `FormzillaFile`. Example:

        ```ts
        // The following example uploads the incoming stream
        // directly to a cloud server. The call to `resolve` is
        // nested inside the cloud API's callback function to ensure
        // that the `path` property of the `FileInternal` object
        // is populated correctly.

        server.register(formDataParser, {
        	storage: new CallbackStorage((name, stream, info) => {
        		return new Promise(resolve => {
        			const file = new FileInternal(name, info);
        			var uploader = cloudinary.v2.uploader.upload_stream((err, res) => {
        				file.error = err;
        				file.path = res?.secure_url;
        				resolve(file);
        			});
        			stream.pipe(uploader);
        		});
        	})
        });
        ```

### Custom storage

Implement the `StorageOption` interface to write your own storage plugin:

```ts
interface StorageOption {
	lazy?: boolean;
	process: (name: string, stream: Readable, info: FileInfo) => FormzillaFile | Promise<FormzillaFile>;
}
```

-   `process` — called for every uploaded file. Must return a `FormzillaFile` (or a promise that resolves to one). If `lazy` is `false` or omitted, Formzilla waits for the returned promise to settle before running the handler; `process` must therefore fully consume the stream before resolving.
-   `lazy` — when `true`, Formzilla delivers the request to the handler as soon as busboy finishes parsing headers and non-file fields, without waiting for `process` to resolve. The stream is still live at that point and must be consumed by the handler. `StreamStorage` uses this flag to achieve end-to-end streaming.

### `FileInternal`

`FileInternal` is a convenience class that implements `FormzillaFile`. It is exported for use inside `CallbackStorage` callbacks, so you can construct a file object and populate it incrementally as the upload progresses.

```ts
const file = new FileInternal(name, info); // info is a busboy `FileInfo` object
```

# Recommendations

Pick the storage option based on how you want to consume the upload:

-   **`StreamStorage`** (default) — streams the files end-to-end. The request reaches your handler as soon as headers and non-file fields are parsed; file data flows through `file.stream` as it arrives, so memory stays bounded regardless of upload size. Your handler **must consume** `file.stream` (pipe or drain it) — ignoring it stalls the upload. Errors raised mid-upload (e.g. a `fileSize` limit exceeded after the handler starts) surface on the stream, not as a request-level rejection, so attach `stream.on("error", …)` and check `file.error` once the stream ends. Do not send a success response until the stream has finished.

-   **`DiscStorage`** — safe choice when you don't need streaming semantics. The handler runs only after the file is fully written to disk, so you can safely re-upload to a cloud provider (e.g. [Cloudinary][5]) from the handler and then delete the temp file. Caps disk — not memory — usage.

-   **`BufferStorage`** — holds the entire file in `file.data` as a `Buffer`. Convenient for small payloads, but concurrent or large uploads can exhaust memory (DoS risk). Avoid unless you ensure the upload size is bounded.

-   **`CallbackStorage`** — for advanced users who need to pipe the upload somewhere custom (cloud bucket, transform pipeline) without touching disk. The callback **must** consume the stream, otherwise the request will stall. By default the handler waits for all callbacks to resolve; set `lazy = true` on your storage instance if you want the same early-handler behaviour as `StreamStorage`.

# Caveats

-   File data will not be available in `request.body` until the `preHandler` request lifecycle stage. So if you want to access the files inside a `preValidation` hook, use `request.__files__` instead. This is a temporary property that gets removed from the request object at the `preHandler` stage. It is done this way for security purposes.

## Migration

### From version 4.x

1. `StreamStorage` was updated in formzilla 5.x to use true end-to-end streaming. The handler receives `file.stream` while the upload is still in progress, so you must consume the stream in your handler — ignoring it will stall the request.
2. A `lazy` property has been added to `StorageOption`. Custom storage implementations can set `lazy = true` to opt into the same early-handler delivery that `StreamStorage` uses.

### From version 2.x

1. Formzilla 2.x will not work with Fastify versions 4.8 and above. Use Formzilla 3.x with Fastify versions >= 4.8.

### From version 1.x

1. Formzilla 1.x `options` have been moved to `options.limits` in Formzilla 2.x.
2. File content is stored by default in `file.stream` as a `Readable` in Formzilla 2.x whereas in Formzilla 1.x it was stored in `file.data` as a `Buffer`.

[1]: https://github.com/fastify/fastify-multipart
[2]: https://github.com/fox1t/fastify-multer
[3]: https://github.com/fastify/fastify-swagger
[4]: https://github.com/mscdex/busboy
[5]: https://cloudinary.com