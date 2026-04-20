"use strict";
import test from "ava";
import { FieldParserNoSchema } from "../FieldParserNoSchema.js";
import { FieldParserWithSchema } from "../FieldParserWithSchema.js";
test("FieldParserNoSchema returns the raw value unchanged", t => {
	const parser = new FieldParserNoSchema();
	t.is(parser.parseField("anything", "42"), "42");
	t.is(parser.parseField("anything", "not json"), "not json");
});
test("FieldParserWithSchema leaves string-typed fields as strings", t => {
	const parser = new FieldParserWithSchema({ name: { type: "string" } });
	t.is(parser.parseField("name", "42"), "42");
	t.is(parser.parseField("name", '{"a":1}'), '{"a":1}');
});
test("FieldParserWithSchema parses integer-typed fields", t => {
	const parser = new FieldParserWithSchema({ age: { type: "integer" } });
	t.is(parser.parseField("age", "30"), 30);
});
test("FieldParserWithSchema parses object-typed fields", t => {
	const parser = new FieldParserWithSchema({ addr: { type: "object" } });
	t.deepEqual(parser.parseField("addr", '{"id":"1","street":"Main"}'), { id: "1", street: "Main" });
});
test("FieldParserWithSchema parses array-typed fields", t => {
	const parser = new FieldParserWithSchema({ tags: { type: "array" } });
	t.deepEqual(parser.parseField("tags", '["a","b"]'), ["a", "b"]);
});
test("FieldParserWithSchema parses boolean-typed fields", t => {
	const parser = new FieldParserWithSchema({ active: { type: "boolean" } });
	t.is(parser.parseField("active", "true"), true);
	t.is(parser.parseField("active", "false"), false);
});
test("FieldParserWithSchema falls back to the raw string on invalid JSON", t => {
	const parser = new FieldParserWithSchema({ age: { type: "integer" } });
	t.is(parser.parseField("age", "not a number"), "not a number");
});
test("FieldParserWithSchema does not set Object.prototype via a __proto__ payload", t => {
	const parser = new FieldParserWithSchema({ payload: { type: "object" } });
	const parsed = parser.parseField("payload", '{"__proto__":{"polluted":true}}');
	// Node's JSON.parse does not set the prototype, and the literal key is swallowed.
	t.is({}.polluted, undefined);
	t.is(Object.getPrototypeOf(parsed), Object.prototype);
});