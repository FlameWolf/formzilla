import type { FieldParser } from "./index.ts";
export declare class FieldParserNoSchema implements FieldParser {
    parseField(name: string, value: any): any;
}
