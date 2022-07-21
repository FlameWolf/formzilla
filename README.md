# Formzilla

Formzilla is a [Fastify](http://fastify.io/) plugin to handle `multipart/form-data` content.

# Why?

Even though other plugins for the same purpose exist, like [@fastify/multipart][1] and [fastify-multer][2], when dealing with mixed content, they don't play well with JSON schemas which are Fastify's built-in mechanism for request validation and documentation. Formzilla is intended to work seamlessly with JSON schemas and [@fastify-swagger][3].

[1]: https://github.com/fastify/fastify-multipart
[2]: https://github.com/fox1t/fastify-multer
[3]: https://github.com/fastify/fastify-swagger

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
import fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyPluginOptions
} from "fastify";
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
            data: <Buffer>
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

# Important

I guess this goes without saying, but you must register the plugin before registering your application routes.

## API

### Options

The `options` parameter for Formzilla is the same as the `limits` configuration option for [busboy][4].

[4]: https://github.com/mscdex/busboy

```tsx
server.register(formDataParser, {
  fieldNameSize?: number, // Max field name size (in bytes). Default: 100.
  fieldSize?: number, // Max field value size (in bytes). Default: 1048576 (1MB).
  fields?: number, // Max number of non-file fields. Default: Infinity.
  fileSize?: number, // For multipart forms, the max file size (in bytes). Default: Infinity.
  files?: number, // For multipart forms, the max number of file fields. Default: Infinity.
  parts?: number, // For multipart forms, the max number of parts (fields + files). Default: Infinity.
  headerPairs?: number // For multipart forms, the max number of header key-value pairs to parse. Default: 2000 (same as node's http module).
});
```

# Caveats

1. Schema composition (`allOf`, `anyOf`, `oneOf`, `not`) can be tricky when a composed property may accept a string value. Composed properties are always parsed using `JSON.parse(...)`, so you will have to wrap the value in single/double quotation marks or backticks.
2. File data will not be available in `request.body` until the `preHandler` request lifecycle stage. So if you want to access the files inside a `preValidation` hook, use `request.__files__` instead. This is a temporary property that gets removed from the request object at the `preHandler` stage. It is done this way for security purposes.