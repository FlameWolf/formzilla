import FormData from "form-data";
export declare const sampleFilePath: string;
export declare const requestSchema: {
	consumes: string[];
	body: {
		type: string;
		properties: {
			name: {
				type: string;
			};
			age: {
				type: string;
			};
			avatar: {
				type: string;
				format: string;
			};
			address: {
				type: string;
				properties: {
					id: {
						type: string;
					};
					street: {
						type: string;
					};
				};
				required: string[];
			};
		};
	};
};
export declare const multifileSchema: {
	consumes: string[];
	body: {
		type: string;
		properties: {
			files: {
				type: string;
				items: {
					type: string;
					format: string;
				};
			};
		};
	};
};
export declare function buildStandardForm(): FormData;
export declare function buildMultifileForm(): FormData;
export declare function injectForm(instance: any, form: FormData): Promise<any>;
export declare function assertHandlerOk(t: any, res: any): void;