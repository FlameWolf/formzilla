import { FieldParser } from "./index";

export declare class FieldParserNoSchema implements FieldParser {
	parseField(name: string, value: any): any;
}