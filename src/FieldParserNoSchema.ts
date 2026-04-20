"use strict";

import type { FieldParser } from "./index.ts";

export class FieldParserNoSchema implements FieldParser {
	parseField(name: string, value: any) {
		return value;
	}
}