export declare const mcpCatalogContract: {
    readonly name: "ngx-workshop-catalog";
    readonly version: "0.1.0";
    readonly tools: readonly [{
        readonly name: "list_workshops";
        readonly description: "List public workshop summaries in a section. This catalog does not determine learner eligibility.";
        readonly annotations: {
            readonly readOnlyHint: true;
            readonly destructiveHint: false;
            readonly idempotentHint: true;
            readonly openWorldHint: true;
        };
        readonly inputSchema: {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema";
            readonly type: "object";
            readonly properties: {
                readonly sectionId: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 120;
                };
            };
            readonly required: readonly ["sectionId"];
            readonly additionalProperties: false;
        };
        readonly outputSchema: {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema";
            readonly type: "object";
            readonly properties: {
                readonly workshops: {
                    readonly maxItems: 500;
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 120;
                            };
                            readonly sectionId: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 120;
                            };
                            readonly title: {
                                readonly type: "string";
                                readonly maxLength: 2000;
                            };
                            readonly summary: {
                                readonly type: "string";
                                readonly maxLength: 20000;
                            };
                            readonly level: {
                                readonly type: "integer";
                                readonly minimum: 1;
                                readonly maximum: 20;
                            };
                        };
                        readonly required: readonly ["id", "sectionId", "title", "summary", "level"];
                        readonly additionalProperties: false;
                    };
                };
            };
            readonly required: readonly ["workshops"];
            readonly additionalProperties: false;
        };
    }, {
        readonly name: "get_workshop";
        readonly description: "Get public workshop metadata and its ordered learning outline within a section. Does not return document bodies or learner progress.";
        readonly annotations: {
            readonly readOnlyHint: true;
            readonly destructiveHint: false;
            readonly idempotentHint: true;
            readonly openWorldHint: true;
        };
        readonly inputSchema: {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema";
            readonly type: "object";
            readonly properties: {
                readonly sectionId: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 120;
                };
                readonly workshopId: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 120;
                };
            };
            readonly required: readonly ["sectionId", "workshopId"];
            readonly additionalProperties: false;
        };
        readonly outputSchema: {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema";
            readonly type: "object";
            readonly properties: {
                readonly workshop: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 120;
                        };
                        readonly sectionId: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 120;
                        };
                        readonly title: {
                            readonly type: "string";
                            readonly maxLength: 2000;
                        };
                        readonly summary: {
                            readonly type: "string";
                            readonly maxLength: 20000;
                        };
                        readonly level: {
                            readonly type: "integer";
                            readonly minimum: 1;
                            readonly maximum: 20;
                        };
                        readonly outline: {
                            readonly maxItems: 500;
                            readonly type: "array";
                            readonly items: {
                                readonly oneOf: readonly [{
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly id: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 120;
                                        };
                                        readonly title: {
                                            readonly type: "string";
                                            readonly maxLength: 2000;
                                        };
                                        readonly kind: {
                                            readonly type: "string";
                                            readonly const: "PAGE";
                                        };
                                        readonly resourceId: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 120;
                                        };
                                    };
                                    readonly required: readonly ["id", "title", "kind", "resourceId"];
                                    readonly additionalProperties: false;
                                }, {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly id: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 120;
                                        };
                                        readonly title: {
                                            readonly type: "string";
                                            readonly maxLength: 2000;
                                        };
                                        readonly kind: {
                                            readonly type: "string";
                                            readonly const: "CODING_LAB";
                                        };
                                        readonly resourceId: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 120;
                                        };
                                    };
                                    readonly required: readonly ["id", "title", "kind", "resourceId"];
                                    readonly additionalProperties: false;
                                }, {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly id: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 120;
                                        };
                                        readonly title: {
                                            readonly type: "string";
                                            readonly maxLength: 2000;
                                        };
                                        readonly kind: {
                                            readonly type: "string";
                                            readonly const: "ASSESSMENT_TEST";
                                        };
                                        readonly resourceId: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 120;
                                        };
                                    };
                                    readonly required: readonly ["id", "title", "kind", "resourceId"];
                                    readonly additionalProperties: false;
                                }];
                            };
                        };
                    };
                    readonly required: readonly ["id", "sectionId", "title", "summary", "level", "outline"];
                    readonly additionalProperties: false;
                };
            };
            readonly required: readonly ["workshop"];
            readonly additionalProperties: false;
        };
    }, {
        readonly name: "get_coding_lab";
        readonly description: "Get a published coding challenge, starter code, hints and public sample tests. Optionally select a published version; no solutions or hidden tests.";
        readonly annotations: {
            readonly readOnlyHint: true;
            readonly destructiveHint: false;
            readonly idempotentHint: true;
            readonly openWorldHint: true;
        };
        readonly inputSchema: {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema";
            readonly type: "object";
            readonly properties: {
                readonly labId: {
                    readonly type: "string";
                    readonly pattern: "^[a-f\\d]{24}$";
                };
                readonly versionId: {
                    readonly type: "string";
                    readonly pattern: "^[a-f\\d]{24}$";
                };
            };
            readonly required: readonly ["labId"];
            readonly additionalProperties: false;
        };
        readonly outputSchema: {
            readonly $schema: "https://json-schema.org/draft/2020-12/schema";
            readonly type: "object";
            readonly properties: {
                readonly lab: {
                    readonly type: "object";
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly versionId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly versionNumber: {
                            readonly type: "integer";
                            readonly exclusiveMinimum: 0;
                            readonly maximum: 9007199254740991;
                        };
                        readonly title: {
                            readonly type: "string";
                            readonly maxLength: 2000;
                        };
                        readonly difficulty: {
                            readonly type: "string";
                            readonly enum: readonly ["intro", "easy", "medium", "hard"];
                        };
                        readonly language: {
                            readonly type: "string";
                            readonly enum: readonly ["javascript", "typescript"];
                        };
                        readonly promptMarkdown: {
                            readonly type: "string";
                            readonly maxLength: 100000;
                        };
                        readonly hints: {
                            readonly maxItems: 100;
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                                readonly maxLength: 20000;
                            };
                        };
                        readonly starterCode: {
                            readonly type: "string";
                            readonly maxLength: 100000;
                        };
                        readonly sampleTests: {
                            readonly maxItems: 100;
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly name: {
                                        readonly type: "string";
                                        readonly maxLength: 2000;
                                    };
                                    readonly kind: {
                                        readonly type: "string";
                                        readonly enum: readonly ["io", "unit"];
                                    };
                                    readonly input: {};
                                    readonly expected: {};
                                    readonly comparator: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly kind: {
                                                readonly type: "string";
                                                readonly enum: readonly ["deepEqual", "strictEqual", "numberTolerance", "stringNormalized", "custom"];
                                            };
                                            readonly tolerance: {
                                                readonly type: "number";
                                            };
                                            readonly normalizeWhitespace: {
                                                readonly type: "boolean";
                                            };
                                            readonly ignoreCase: {
                                                readonly type: "boolean";
                                            };
                                            readonly customComparatorId: {
                                                readonly type: "string";
                                            };
                                        };
                                        readonly required: readonly ["kind"];
                                        readonly additionalProperties: false;
                                    };
                                    readonly testCode: {
                                        readonly type: "string";
                                        readonly maxLength: 50000;
                                    };
                                    readonly framework: {
                                        readonly type: "string";
                                        readonly enum: readonly ["jest", "vitest"];
                                    };
                                };
                                readonly required: readonly ["name", "kind"];
                                readonly additionalProperties: false;
                            };
                        };
                        readonly entryFnName: {
                            readonly type: "string";
                            readonly maxLength: 200;
                        };
                    };
                    readonly required: readonly ["id", "versionId", "versionNumber", "title", "language", "promptMarkdown", "hints", "starterCode", "sampleTests"];
                    readonly additionalProperties: false;
                };
            };
            readonly required: readonly ["lab"];
            readonly additionalProperties: false;
        };
    }];
    readonly errorSchema: {
        readonly $schema: "https://json-schema.org/draft/2020-12/schema";
        readonly type: "object";
        readonly properties: {
            readonly error: {
                readonly type: "object";
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: readonly ["NOT_FOUND", "FORBIDDEN", "UPSTREAM_TIMEOUT", "UPSTREAM_UNAVAILABLE", "UPSTREAM_INVALID_RESPONSE", "INTERNAL_ERROR"];
                    };
                    readonly message: {
                        readonly type: "string";
                    };
                };
                readonly required: readonly ["code", "message"];
                readonly additionalProperties: false;
            };
        };
        readonly required: readonly ["error"];
        readonly additionalProperties: false;
    };
};
