import { Dictionary, FieldParser } from "./index";

export declare class FieldParserWithSchema implements FieldParser {
	#props: Dictionary;
	constructor(props: Dictionary);
	parseField(name: string, value: any): any;
}