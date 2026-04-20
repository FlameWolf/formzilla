"use strict";
export class FieldParserWithSchema {
	props;
	constructor(props) {
		this.props = props;
	}
	parseField(name, value) {
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