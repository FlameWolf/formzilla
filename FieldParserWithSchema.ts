"use strict";

import type { FieldParser, Dictionary } from "./index.ts";

export class FieldParserWithSchema implements FieldParser {
	props: Dictionary;
	constructor(props: Dictionary) {
		this.props = props;
	}
	parseField(name: string, value: any) {
		const prop = this.props[name];
		if (!prop || prop.type === "string") {
			return value;
		}
		try {
			switch (prop.type) {
				case "object":
				case "array":
				case "integer":
				case "number":
				case "boolean":
					return JSON.parse(value);
				default:
					return value;
			}
		} catch {
			return value;
		}
	}
}