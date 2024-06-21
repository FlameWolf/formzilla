# Formzilla

Formzilla is a [Fastify](http://fastify.io/) plugin to handle `multipart/form-data` content.

# Why?

Even though other plugins for the same purpose exist, like [@fastify/multipart][1] and [fastify-multer][2], when dealing with mixed content, they don't play well with JSON schemas which are Fastify's built-in mechanism for request validation and documentation. Formzilla is intended to work seamlessly with JSON schemas and [@fastify-swagger][3].

# Example

Let's say you have an endpoint that accepts `multipart/form-data` with the following schema.

```tsx
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

```tsx
import fastify, { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginOptions } from "fastify";
import fastifySwagger from "@fastify/swagger";
import formDataParser from "formzilla";

const server: FastifyInstance = fastify({ logger: true });
server.register(fastifySwagger, {
	routePrefix: "/swagger",
	exposeRoute: true,
	openapi: {
		info: {
			title: "Formzilla Demo",
			version: "1.0.0"
		}
	}
});
server.register(formDataParser);
server.register(
	async (instance: FastifyInstance, options: FastifyPluginOptions) => {
		instance.post(
			"/create",
			{
				schema: postCreateSchema
			},
			(request: FastifyRequest, reply: FastifyReply) => {
				console.log(request.body);
				/*
				request.body will look like this:
				{
					content: "Test.",
					poll: { first: "Option 1", second: "Option 2" },
					media: {
						fileName: "flame-wolf.png",
						encoding: "7bit",
						mimeType: "image/png",
						path?: <string>,		// Only when using DiscStorage
						stream?: <Readable>		// Only when using StreamStorage
						data?: <Buffer>			// Only when using BufferStorage
						error?: <Error>			// Only if any errors occur during processing
					}
				}
				*/
				reply.status(200).send();
			}
		);
	},
	{ prefix: "/posts" }
);
```

# Installation

```sh
npm install formzilla
```

# Important

I guess this goes without saying, but you must register the plugin before registering your application routes.

## API

### Breaking changes from version 2

1. Formzilla 2.x will not work with Fastify versions 4.8 and above. Use Formzilla 3.x with Fastify versions >= 4.8.

### Breaking changes from version 1

1. Formzilla 1.x `options` have been moved to `options.limits` in Formzilla 2.x.
2. File content is stored by default in `file.stream` as a `Readable` in Formzilla 2.x whereas in Formzilla 1.x it was stored in `file.data` as a `Buffer`.

### Options

These are the valid keys for the `options` object parameter accepted by Formzilla:

-   `limits`: Same as the `limits` configuration option for [busboy][4].

    ```tsx
    const formLimits = {
    	fieldNameSize?: number, // Max field name size (in bytes). Default: 100.
    	fieldSize?: number, // Max field value size (in bytes). Default: 1048576 (1MB).
    	fields?: number, // Max number of non-file fields. Default: Infinity.
    	fileSize?: number, // For multipart forms, the max file size (in bytes). Default: Infinity.
    	files?: number, // For multipart forms, the max number of file fields. Default: Infinity.
    	parts?: number, // For multipart forms, the max number of parts (fields + files). Default: Infinity.
    	headerPairs?: number // For multipart forms, the max number of header key-value pairs to parse. Default: 2000 (same as node's http module).
    };
    server.register(formDataParser, {
    	limits: formLimits
    });
    ```

-   `storage`: Where to store the files, if any, included in the request. Formzilla provides the following built-in options. It is possible to write custom storage plugins of your own.

    -   `StreamStorage`: The default storage option used by Formzilla. Stores file contents as a `Readable` in the `stream` property of the file. Example:
        ```tsx
        server.register(formDataParser, {
        	storage: new StreamStorage()
        });
        ```
    -   `BufferStorage`: Emulates Formzilla 1.x behaviour by storing file contents as a `Buffer` in the `data` property of the file. Example:
        ```tsx
        server.register(formDataParser, {
        	storage: new BufferStorage()
        });
        ```
    -   `DiscStorage`: Saves the file to the disc. Accepts a parameter that can be either a `formzilla.FileSaveTarget` or a function that accepts a `formzilla.File` parameter and returns a `formzilla.FileSaveTarget`. By default, Formzilla will save the file to the operating system's TEMP directory. Example:
        ```tsx
        server.register(formDataParser, {
        	storage: new DiscStorage(file => {
        		return {
        			directory: path.join(__dirname, "public"),
        			fileName: file.originalName.toUpperCase()
        		};
        	})
        });
        ```
    -   `CallbackStorage`: For advanced users. Accepts a callback function that takes three parameters: a `string`, a `Readable`, and a `busboy.FileInfo`. The callback function must consume the `Readable` and return either a `formzilla.File` or a promise that resolves to a `formzilla.File`. Example:

        ```tsx
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

# Recommendations

Both `StreamStorage` and `BufferStorage` will cause files to accumulate in memory and hence make your endpoint a potential target for DDoS attacks. `CallbackStorage` must cosume the stream inside the callback or it will break the application. It is recommended only if you are familiar with streams in NodeJS and want to manipulate the stream in some way before sending it to the response body. It's recommended to use `DiscStorage` to temporarily store an incoming file, upload it to a cloud server like [Cloudinary][5] from your request handler, and then delete the temporary file.

# Caveats

-   File data will not be available in `request.body` until the `preHandler` request lifecycle stage. So if you want to access the files inside a `preValidation` hook, use `request.__files__` instead. This is a temporary property that gets removed from the request object at the `preHandler` stage. It is done this way for security purposes.

[1]: https://github.com/fastify/fastify-multipart
[2]: https://github.com/fox1t/fastify-multer
[3]: https://github.com/fastify/fastify-swagger
[4]: https://github.com/mscdex/busboy
[5]: https://cloudinary.com