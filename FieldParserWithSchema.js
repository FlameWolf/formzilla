"use strict";

class FieldParserWithSchema {
	#props;
	constructor(props) {
		this.#props = props;
	}
	parseField(name, value) {
		if (this.#props[name]?.type !== "string") {
			try {
				return JSON.parse(value);
			} catch {
				void 0;
			}
		}
		return value;
	}
}

exports.FieldParserWithSchema = FieldParserWithSchema;