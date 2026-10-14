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
    readonly publishing: {
        readonly endpoint: "/mcp/publishing";
        readonly authentication: "platform administrator bearer";
        readonly tools: readonly [{
            readonly name: "list_publishing_models";
            readonly description: "List server-approved draft models and reference USD token pricing.";
            readonly annotations: {
                readonly readOnlyHint: true;
                readonly destructiveHint: false;
                readonly idempotentHint: true;
                readonly openWorldHint: true;
            };
            readonly inputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {};
                readonly additionalProperties: false;
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "list_publishing_runs";
            readonly description: "List durable publishing receipts for the authenticated administrator, newest first.";
            readonly annotations: {
                readonly readOnlyHint: true;
                readonly destructiveHint: false;
                readonly idempotentHint: true;
                readonly openWorldHint: true;
            };
            readonly inputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {};
                readonly additionalProperties: false;
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "generate_workshop_draft";
            readonly description: "Generate documentation, labs and assessment from a brief; no owner writes. Review before publish.";
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
                    readonly brief: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 20000;
                    };
                    readonly model: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 120;
                    };
                    readonly sectionId: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 120;
                    };
                    readonly level: {
                        readonly type: "integer";
                        readonly minimum: 1;
                        readonly maximum: 20;
                    };
                };
                readonly required: readonly ["brief", "sectionId", "level"];
                readonly additionalProperties: false;
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "validate_workshop_draft";
            readonly description: "Validate and normalize Ngx-EditorJs2 workshop draft without writing.";
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
                    readonly draft: {
                        readonly type: "object";
                        readonly properties: {
                            readonly sectionId: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 120;
                            };
                            readonly name: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 160;
                            };
                            readonly summary: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 20000;
                            };
                            readonly level: {
                                readonly type: "integer";
                                readonly minimum: 1;
                                readonly maximum: 20;
                            };
                            readonly pages: {
                                readonly minItems: 1;
                                readonly maxItems: 20;
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly name: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 160;
                                        };
                                        readonly blocks: {
                                            readonly minItems: 1;
                                            readonly maxItems: 200;
                                            readonly type: "array";
                                            readonly items: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly blockId: {
                                                        readonly type: "string";
                                                        readonly minLength: 1;
                                                        readonly maxLength: 120;
                                                    };
                                                    readonly sortIndex: {
                                                        readonly type: "integer";
                                                        readonly minimum: 0;
                                                        readonly maximum: 9007199254740991;
                                                    };
                                                    readonly componentInstanceName: {
                                                        readonly type: "string";
                                                        readonly enum: readonly ["HeaderBlockComponent", "ParagraphBlockComponent", "NgxEditorJs2BlockquotesComponent", "NgxEditorJs2PanelComponent", "NgxEditorJs2ImageComponent", "NgxEditorJs2CodemirrorComponent", "NgxEditorJs2MermaidjsComponent", "NgxEditorJs2PopQuizComponent"];
                                                    };
                                                    readonly savedAction: {
                                                        readonly type: "string";
                                                        readonly maxLength: 120;
                                                    };
                                                    readonly dataClean: {
                                                        readonly type: "string";
                                                        readonly maxLength: 100000;
                                                    };
                                                };
                                                readonly required: readonly ["blockId", "sortIndex", "componentInstanceName", "savedAction", "dataClean"];
                                                readonly additionalProperties: false;
                                            };
                                        };
                                    };
                                    readonly required: readonly ["name", "blocks"];
                                    readonly additionalProperties: false;
                                };
                            };
                            readonly labs: {
                                readonly minItems: 1;
                                readonly maxItems: 10;
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly metadata: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly title: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 160;
                                                };
                                                readonly slug: {
                                                    readonly type: "string";
                                                    readonly maxLength: 200;
                                                    readonly pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
                                                };
                                                readonly summary: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 20000;
                                                };
                                                readonly difficulty: {
                                                    readonly type: "string";
                                                    readonly enum: readonly ["intro", "easy", "medium", "hard"];
                                                };
                                            };
                                            readonly required: readonly ["title", "slug", "summary", "difficulty"];
                                            readonly additionalProperties: false;
                                        };
                                        readonly version: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly language: {
                                                    readonly type: "string";
                                                    readonly enum: readonly ["javascript", "typescript"];
                                                };
                                                readonly promptMarkdown: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 20000;
                                                };
                                                readonly hints: {
                                                    readonly maxItems: 30;
                                                    readonly type: "array";
                                                    readonly items: {
                                                        readonly type: "string";
                                                        readonly minLength: 1;
                                                        readonly maxLength: 20000;
                                                    };
                                                };
                                                readonly starterCode: {
                                                    readonly type: "string";
                                                    readonly maxLength: 50000;
                                                };
                                                readonly referenceSolution: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly code: {
                                                            readonly type: "string";
                                                            readonly minLength: 1;
                                                            readonly maxLength: 50000;
                                                        };
                                                    };
                                                    readonly required: readonly ["code"];
                                                    readonly additionalProperties: false;
                                                };
                                                readonly sampleTests: {
                                                    readonly minItems: 1;
                                                    readonly maxItems: 50;
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
                                                readonly hiddenTests: {
                                                    readonly minItems: 1;
                                                    readonly maxItems: 50;
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
                                                readonly runner: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly timeoutMs: {
                                                            readonly type: "integer";
                                                            readonly minimum: 100;
                                                            readonly maximum: 10000;
                                                        };
                                                        readonly entryFnName: {
                                                            readonly type: "string";
                                                            readonly pattern: "^[a-zA-Z_$][\\w$]*$";
                                                        };
                                                    };
                                                    readonly required: readonly ["timeoutMs", "entryFnName"];
                                                    readonly additionalProperties: false;
                                                };
                                            };
                                            readonly required: readonly ["language", "promptMarkdown", "hints", "starterCode", "referenceSolution", "sampleTests", "hiddenTests", "runner"];
                                            readonly additionalProperties: false;
                                        };
                                    };
                                    readonly required: readonly ["metadata", "version"];
                                    readonly additionalProperties: false;
                                };
                            };
                            readonly assessment: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly name: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 160;
                                    };
                                    readonly subject: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 120;
                                    };
                                    readonly sectionTitle: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 120;
                                    };
                                    readonly level: {
                                        readonly type: "integer";
                                        readonly minimum: 1;
                                        readonly maximum: 20;
                                    };
                                    readonly testQuestions: {
                                        readonly minItems: 1;
                                        readonly maxItems: 100;
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly question: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 1000;
                                                };
                                                readonly choices: {
                                                    readonly minItems: 2;
                                                    readonly maxItems: 10;
                                                    readonly type: "array";
                                                    readonly items: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly value: {
                                                                readonly type: "string";
                                                                readonly minLength: 1;
                                                                readonly maxLength: 400;
                                                            };
                                                        };
                                                        readonly required: readonly ["value"];
                                                        readonly additionalProperties: false;
                                                    };
                                                };
                                                readonly answer: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 400;
                                                };
                                                readonly correctResponse: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 1000;
                                                };
                                                readonly incorrectResponse: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 1000;
                                                };
                                            };
                                            readonly required: readonly ["question", "choices", "answer", "correctResponse", "incorrectResponse"];
                                            readonly additionalProperties: false;
                                        };
                                    };
                                };
                                readonly required: readonly ["name", "subject", "level", "testQuestions"];
                                readonly additionalProperties: false;
                            };
                        };
                        readonly required: readonly ["sectionId", "name", "summary", "level", "pages", "labs", "assessment"];
                        readonly additionalProperties: false;
                    };
                };
                readonly required: readonly ["draft"];
                readonly additionalProperties: false;
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "publish_workshop";
            readonly description: "Publish reviewed workshop. Keep requestId for duplicate protection and recovery. Returns completed resource steps on failure.";
            readonly annotations: {
                readonly readOnlyHint: false;
                readonly destructiveHint: true;
                readonly idempotentHint: false;
                readonly openWorldHint: true;
            };
            readonly inputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly requestId: {
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly pattern: "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$";
                    };
                    readonly draft: {
                        readonly type: "object";
                        readonly properties: {
                            readonly sectionId: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 120;
                            };
                            readonly name: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 160;
                            };
                            readonly summary: {
                                readonly type: "string";
                                readonly minLength: 1;
                                readonly maxLength: 20000;
                            };
                            readonly level: {
                                readonly type: "integer";
                                readonly minimum: 1;
                                readonly maximum: 20;
                            };
                            readonly pages: {
                                readonly minItems: 1;
                                readonly maxItems: 20;
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly name: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 160;
                                        };
                                        readonly blocks: {
                                            readonly minItems: 1;
                                            readonly maxItems: 200;
                                            readonly type: "array";
                                            readonly items: {
                                                readonly type: "object";
                                                readonly properties: {
                                                    readonly blockId: {
                                                        readonly type: "string";
                                                        readonly minLength: 1;
                                                        readonly maxLength: 120;
                                                    };
                                                    readonly sortIndex: {
                                                        readonly type: "integer";
                                                        readonly minimum: 0;
                                                        readonly maximum: 9007199254740991;
                                                    };
                                                    readonly componentInstanceName: {
                                                        readonly type: "string";
                                                        readonly enum: readonly ["HeaderBlockComponent", "ParagraphBlockComponent", "NgxEditorJs2BlockquotesComponent", "NgxEditorJs2PanelComponent", "NgxEditorJs2ImageComponent", "NgxEditorJs2CodemirrorComponent", "NgxEditorJs2MermaidjsComponent", "NgxEditorJs2PopQuizComponent"];
                                                    };
                                                    readonly savedAction: {
                                                        readonly type: "string";
                                                        readonly maxLength: 120;
                                                    };
                                                    readonly dataClean: {
                                                        readonly type: "string";
                                                        readonly maxLength: 100000;
                                                    };
                                                };
                                                readonly required: readonly ["blockId", "sortIndex", "componentInstanceName", "savedAction", "dataClean"];
                                                readonly additionalProperties: false;
                                            };
                                        };
                                    };
                                    readonly required: readonly ["name", "blocks"];
                                    readonly additionalProperties: false;
                                };
                            };
                            readonly labs: {
                                readonly minItems: 1;
                                readonly maxItems: 10;
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly metadata: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly title: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 160;
                                                };
                                                readonly slug: {
                                                    readonly type: "string";
                                                    readonly maxLength: 200;
                                                    readonly pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
                                                };
                                                readonly summary: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 20000;
                                                };
                                                readonly difficulty: {
                                                    readonly type: "string";
                                                    readonly enum: readonly ["intro", "easy", "medium", "hard"];
                                                };
                                            };
                                            readonly required: readonly ["title", "slug", "summary", "difficulty"];
                                            readonly additionalProperties: false;
                                        };
                                        readonly version: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly language: {
                                                    readonly type: "string";
                                                    readonly enum: readonly ["javascript", "typescript"];
                                                };
                                                readonly promptMarkdown: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 20000;
                                                };
                                                readonly hints: {
                                                    readonly maxItems: 30;
                                                    readonly type: "array";
                                                    readonly items: {
                                                        readonly type: "string";
                                                        readonly minLength: 1;
                                                        readonly maxLength: 20000;
                                                    };
                                                };
                                                readonly starterCode: {
                                                    readonly type: "string";
                                                    readonly maxLength: 50000;
                                                };
                                                readonly referenceSolution: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly code: {
                                                            readonly type: "string";
                                                            readonly minLength: 1;
                                                            readonly maxLength: 50000;
                                                        };
                                                    };
                                                    readonly required: readonly ["code"];
                                                    readonly additionalProperties: false;
                                                };
                                                readonly sampleTests: {
                                                    readonly minItems: 1;
                                                    readonly maxItems: 50;
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
                                                readonly hiddenTests: {
                                                    readonly minItems: 1;
                                                    readonly maxItems: 50;
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
                                                readonly runner: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly timeoutMs: {
                                                            readonly type: "integer";
                                                            readonly minimum: 100;
                                                            readonly maximum: 10000;
                                                        };
                                                        readonly entryFnName: {
                                                            readonly type: "string";
                                                            readonly pattern: "^[a-zA-Z_$][\\w$]*$";
                                                        };
                                                    };
                                                    readonly required: readonly ["timeoutMs", "entryFnName"];
                                                    readonly additionalProperties: false;
                                                };
                                            };
                                            readonly required: readonly ["language", "promptMarkdown", "hints", "starterCode", "referenceSolution", "sampleTests", "hiddenTests", "runner"];
                                            readonly additionalProperties: false;
                                        };
                                    };
                                    readonly required: readonly ["metadata", "version"];
                                    readonly additionalProperties: false;
                                };
                            };
                            readonly assessment: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly name: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 160;
                                    };
                                    readonly subject: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 120;
                                    };
                                    readonly sectionTitle: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 120;
                                    };
                                    readonly level: {
                                        readonly type: "integer";
                                        readonly minimum: 1;
                                        readonly maximum: 20;
                                    };
                                    readonly testQuestions: {
                                        readonly minItems: 1;
                                        readonly maxItems: 100;
                                        readonly type: "array";
                                        readonly items: {
                                            readonly type: "object";
                                            readonly properties: {
                                                readonly question: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 1000;
                                                };
                                                readonly choices: {
                                                    readonly minItems: 2;
                                                    readonly maxItems: 10;
                                                    readonly type: "array";
                                                    readonly items: {
                                                        readonly type: "object";
                                                        readonly properties: {
                                                            readonly value: {
                                                                readonly type: "string";
                                                                readonly minLength: 1;
                                                                readonly maxLength: 400;
                                                            };
                                                        };
                                                        readonly required: readonly ["value"];
                                                        readonly additionalProperties: false;
                                                    };
                                                };
                                                readonly answer: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 400;
                                                };
                                                readonly correctResponse: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 1000;
                                                };
                                                readonly incorrectResponse: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                    readonly maxLength: 1000;
                                                };
                                            };
                                            readonly required: readonly ["question", "choices", "answer", "correctResponse", "incorrectResponse"];
                                            readonly additionalProperties: false;
                                        };
                                    };
                                };
                                readonly required: readonly ["name", "subject", "level", "testQuestions"];
                                readonly additionalProperties: false;
                            };
                        };
                        readonly required: readonly ["sectionId", "name", "summary", "level", "pages", "labs", "assessment"];
                        readonly additionalProperties: false;
                    };
                };
                readonly required: readonly ["requestId", "draft"];
                readonly additionalProperties: false;
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "get_publishing_run";
            readonly description: "Inspect a publishing receipt owned by the authenticated administrator.";
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
                    readonly requestId: {
                        readonly type: "string";
                        readonly format: "uuid";
                        readonly pattern: "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$";
                    };
                };
                readonly required: readonly ["requestId"];
                readonly additionalProperties: false;
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "manage_document";
            readonly description: "Admin document/workshop CRUD through service-document.";
            readonly annotations: {
                readonly readOnlyHint: false;
                readonly destructiveHint: true;
                readonly idempotentHint: false;
                readonly openWorldHint: true;
            };
            readonly inputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly oneOf: readonly [{
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "sections";
                        };
                    };
                    readonly required: readonly ["operation"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "workshops";
                        };
                        readonly sectionId: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 120;
                        };
                    };
                    readonly required: readonly ["operation", "sectionId"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "read_page";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "create_workshop";
                        };
                        readonly sectionId: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 120;
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 160;
                        };
                        readonly summary: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 20000;
                        };
                        readonly level: {
                            readonly type: "integer";
                            readonly minimum: 1;
                            readonly maximum: 20;
                        };
                    };
                    readonly required: readonly ["operation", "sectionId", "name", "summary", "level"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "update_workshop";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 160;
                        };
                        readonly summary: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 20000;
                        };
                        readonly level: {
                            readonly type: "integer";
                            readonly minimum: 1;
                            readonly maximum: 20;
                        };
                    };
                    readonly required: readonly ["operation", "id", "name", "summary", "level"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "delete_workshop";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "create_page";
                        };
                        readonly workshopId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 160;
                        };
                        readonly blocks: {
                            readonly minItems: 1;
                            readonly maxItems: 200;
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly blockId: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 120;
                                    };
                                    readonly sortIndex: {
                                        readonly type: "integer";
                                        readonly minimum: 0;
                                        readonly maximum: 9007199254740991;
                                    };
                                    readonly componentInstanceName: {
                                        readonly type: "string";
                                        readonly enum: readonly ["HeaderBlockComponent", "ParagraphBlockComponent", "NgxEditorJs2BlockquotesComponent", "NgxEditorJs2PanelComponent", "NgxEditorJs2ImageComponent", "NgxEditorJs2CodemirrorComponent", "NgxEditorJs2MermaidjsComponent", "NgxEditorJs2PopQuizComponent"];
                                    };
                                    readonly savedAction: {
                                        readonly type: "string";
                                        readonly maxLength: 120;
                                    };
                                    readonly dataClean: {
                                        readonly type: "string";
                                        readonly maxLength: 100000;
                                    };
                                };
                                readonly required: readonly ["blockId", "sortIndex", "componentInstanceName", "savedAction", "dataClean"];
                                readonly additionalProperties: false;
                            };
                        };
                    };
                    readonly required: readonly ["operation", "workshopId", "name", "blocks"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "update_page";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly blocks: {
                            readonly minItems: 1;
                            readonly maxItems: 200;
                            readonly type: "array";
                            readonly items: {
                                readonly type: "object";
                                readonly properties: {
                                    readonly blockId: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 120;
                                    };
                                    readonly sortIndex: {
                                        readonly type: "integer";
                                        readonly minimum: 0;
                                        readonly maximum: 9007199254740991;
                                    };
                                    readonly componentInstanceName: {
                                        readonly type: "string";
                                        readonly enum: readonly ["HeaderBlockComponent", "ParagraphBlockComponent", "NgxEditorJs2BlockquotesComponent", "NgxEditorJs2PanelComponent", "NgxEditorJs2ImageComponent", "NgxEditorJs2CodemirrorComponent", "NgxEditorJs2MermaidjsComponent", "NgxEditorJs2PopQuizComponent"];
                                    };
                                    readonly savedAction: {
                                        readonly type: "string";
                                        readonly maxLength: 120;
                                    };
                                    readonly dataClean: {
                                        readonly type: "string";
                                        readonly maxLength: 100000;
                                    };
                                };
                                readonly required: readonly ["blockId", "sortIndex", "componentInstanceName", "savedAction", "dataClean"];
                                readonly additionalProperties: false;
                            };
                        };
                    };
                    readonly required: readonly ["operation", "id", "blocks"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "rename_page";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly workshopId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 160;
                        };
                    };
                    readonly required: readonly ["operation", "id", "workshopId", "name"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "delete_page";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly workshopId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 160;
                        };
                    };
                    readonly required: readonly ["operation", "id", "workshopId", "name"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "add_reference";
                        };
                        readonly workshopId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly kind: {
                            readonly type: "string";
                            readonly enum: readonly ["CODING_LAB", "ASSESSMENT_TEST"];
                        };
                        readonly resourceId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 160;
                        };
                    };
                    readonly required: readonly ["operation", "workshopId", "kind", "resourceId", "name"];
                    readonly additionalProperties: false;
                }];
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "manage_assessment";
            readonly description: "Admin assessment CRUD including answers; never expose through catalog endpoint.";
            readonly annotations: {
                readonly readOnlyHint: false;
                readonly destructiveHint: true;
                readonly idempotentHint: false;
                readonly openWorldHint: true;
            };
            readonly inputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly oneOf: readonly [{
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "list";
                        };
                    };
                    readonly required: readonly ["operation"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "read";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "create";
                        };
                        readonly assessment: {
                            readonly type: "object";
                            readonly properties: {
                                readonly name: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 160;
                                };
                                readonly subject: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 120;
                                };
                                readonly sectionTitle: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 120;
                                };
                                readonly level: {
                                    readonly type: "integer";
                                    readonly minimum: 1;
                                    readonly maximum: 20;
                                };
                                readonly testQuestions: {
                                    readonly minItems: 1;
                                    readonly maxItems: 100;
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly question: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                                readonly maxLength: 1000;
                                            };
                                            readonly choices: {
                                                readonly minItems: 2;
                                                readonly maxItems: 10;
                                                readonly type: "array";
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly value: {
                                                            readonly type: "string";
                                                            readonly minLength: 1;
                                                            readonly maxLength: 400;
                                                        };
                                                    };
                                                    readonly required: readonly ["value"];
                                                    readonly additionalProperties: false;
                                                };
                                            };
                                            readonly answer: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                                readonly maxLength: 400;
                                            };
                                            readonly correctResponse: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                                readonly maxLength: 1000;
                                            };
                                            readonly incorrectResponse: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                                readonly maxLength: 1000;
                                            };
                                        };
                                        readonly required: readonly ["question", "choices", "answer", "correctResponse", "incorrectResponse"];
                                        readonly additionalProperties: false;
                                    };
                                };
                            };
                            readonly required: readonly ["name", "subject", "level", "testQuestions"];
                            readonly additionalProperties: false;
                        };
                    };
                    readonly required: readonly ["operation", "assessment"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "update";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly version: {
                            readonly type: "integer";
                            readonly minimum: 0;
                            readonly maximum: 9007199254740991;
                        };
                        readonly assessment: {
                            readonly type: "object";
                            readonly properties: {
                                readonly name: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 160;
                                };
                                readonly subject: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 120;
                                };
                                readonly sectionTitle: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 120;
                                };
                                readonly level: {
                                    readonly type: "integer";
                                    readonly minimum: 1;
                                    readonly maximum: 20;
                                };
                                readonly testQuestions: {
                                    readonly minItems: 1;
                                    readonly maxItems: 100;
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "object";
                                        readonly properties: {
                                            readonly question: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                                readonly maxLength: 1000;
                                            };
                                            readonly choices: {
                                                readonly minItems: 2;
                                                readonly maxItems: 10;
                                                readonly type: "array";
                                                readonly items: {
                                                    readonly type: "object";
                                                    readonly properties: {
                                                        readonly value: {
                                                            readonly type: "string";
                                                            readonly minLength: 1;
                                                            readonly maxLength: 400;
                                                        };
                                                    };
                                                    readonly required: readonly ["value"];
                                                    readonly additionalProperties: false;
                                                };
                                            };
                                            readonly answer: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                                readonly maxLength: 400;
                                            };
                                            readonly correctResponse: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                                readonly maxLength: 1000;
                                            };
                                            readonly incorrectResponse: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                                readonly maxLength: 1000;
                                            };
                                        };
                                        readonly required: readonly ["question", "choices", "answer", "correctResponse", "incorrectResponse"];
                                        readonly additionalProperties: false;
                                    };
                                };
                            };
                            readonly required: readonly ["name", "subject", "level", "testQuestions"];
                            readonly additionalProperties: false;
                        };
                    };
                    readonly required: readonly ["operation", "id", "version", "assessment"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "delete";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id"];
                    readonly additionalProperties: false;
                }];
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "manage_coding_lab";
            readonly description: "Admin lab CRUD/version verification/publication. Delete archives a lab.";
            readonly annotations: {
                readonly readOnlyHint: false;
                readonly destructiveHint: true;
                readonly idempotentHint: false;
                readonly openWorldHint: true;
            };
            readonly inputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly oneOf: readonly [{
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "list";
                        };
                    };
                    readonly required: readonly ["operation"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "read";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "create";
                        };
                        readonly workshopId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly metadata: {
                            readonly type: "object";
                            readonly properties: {
                                readonly title: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 160;
                                };
                                readonly slug: {
                                    readonly type: "string";
                                    readonly maxLength: 200;
                                    readonly pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
                                };
                                readonly summary: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 20000;
                                };
                                readonly difficulty: {
                                    readonly type: "string";
                                    readonly enum: readonly ["intro", "easy", "medium", "hard"];
                                };
                            };
                            readonly required: readonly ["title", "slug", "summary", "difficulty"];
                            readonly additionalProperties: false;
                        };
                    };
                    readonly required: readonly ["operation", "workshopId", "metadata"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "update";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly metadata: {
                            readonly type: "object";
                            readonly properties: {
                                readonly title: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 160;
                                };
                                readonly slug: {
                                    readonly type: "string";
                                    readonly maxLength: 200;
                                    readonly pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
                                };
                                readonly summary: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 20000;
                                };
                                readonly difficulty: {
                                    readonly type: "string";
                                    readonly enum: readonly ["intro", "easy", "medium", "hard"];
                                };
                            };
                            readonly required: readonly ["title", "slug", "summary", "difficulty"];
                            readonly additionalProperties: false;
                        };
                    };
                    readonly required: readonly ["operation", "id", "metadata"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "delete";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "versions";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "read_version";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly versionId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id", "versionId"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "create_version";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly version: {
                            readonly type: "object";
                            readonly properties: {
                                readonly language: {
                                    readonly type: "string";
                                    readonly enum: readonly ["javascript", "typescript"];
                                };
                                readonly promptMarkdown: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 20000;
                                };
                                readonly hints: {
                                    readonly maxItems: 30;
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 20000;
                                    };
                                };
                                readonly starterCode: {
                                    readonly type: "string";
                                    readonly maxLength: 50000;
                                };
                                readonly referenceSolution: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly code: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 50000;
                                        };
                                    };
                                    readonly required: readonly ["code"];
                                    readonly additionalProperties: false;
                                };
                                readonly sampleTests: {
                                    readonly minItems: 1;
                                    readonly maxItems: 50;
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
                                readonly hiddenTests: {
                                    readonly minItems: 1;
                                    readonly maxItems: 50;
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
                                readonly runner: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly timeoutMs: {
                                            readonly type: "integer";
                                            readonly minimum: 100;
                                            readonly maximum: 10000;
                                        };
                                        readonly entryFnName: {
                                            readonly type: "string";
                                            readonly pattern: "^[a-zA-Z_$][\\w$]*$";
                                        };
                                    };
                                    readonly required: readonly ["timeoutMs", "entryFnName"];
                                    readonly additionalProperties: false;
                                };
                            };
                            readonly required: readonly ["language", "promptMarkdown", "hints", "starterCode", "referenceSolution", "sampleTests", "hiddenTests", "runner"];
                            readonly additionalProperties: false;
                        };
                    };
                    readonly required: readonly ["operation", "id", "version"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "update_version";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly versionId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly expectedContentHash: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 20000;
                        };
                        readonly version: {
                            readonly type: "object";
                            readonly properties: {
                                readonly language: {
                                    readonly type: "string";
                                    readonly enum: readonly ["javascript", "typescript"];
                                };
                                readonly promptMarkdown: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly maxLength: 20000;
                                };
                                readonly hints: {
                                    readonly maxItems: 30;
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                        readonly maxLength: 20000;
                                    };
                                };
                                readonly starterCode: {
                                    readonly type: "string";
                                    readonly maxLength: 50000;
                                };
                                readonly referenceSolution: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly code: {
                                            readonly type: "string";
                                            readonly minLength: 1;
                                            readonly maxLength: 50000;
                                        };
                                    };
                                    readonly required: readonly ["code"];
                                    readonly additionalProperties: false;
                                };
                                readonly sampleTests: {
                                    readonly minItems: 1;
                                    readonly maxItems: 50;
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
                                readonly hiddenTests: {
                                    readonly minItems: 1;
                                    readonly maxItems: 50;
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
                                readonly runner: {
                                    readonly type: "object";
                                    readonly properties: {
                                        readonly timeoutMs: {
                                            readonly type: "integer";
                                            readonly minimum: 100;
                                            readonly maximum: 10000;
                                        };
                                        readonly entryFnName: {
                                            readonly type: "string";
                                            readonly pattern: "^[a-zA-Z_$][\\w$]*$";
                                        };
                                    };
                                    readonly required: readonly ["timeoutMs", "entryFnName"];
                                    readonly additionalProperties: false;
                                };
                            };
                            readonly required: readonly ["language", "promptMarkdown", "hints", "starterCode", "referenceSolution", "sampleTests", "hiddenTests", "runner"];
                            readonly additionalProperties: false;
                        };
                    };
                    readonly required: readonly ["operation", "id", "versionId", "expectedContentHash", "version"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "verify";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly versionId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                    };
                    readonly required: readonly ["operation", "id", "versionId"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "publish";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly versionId: {
                            readonly type: "string";
                            readonly pattern: "^[a-f\\d]{24}$";
                        };
                        readonly expectedContentHash: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 20000;
                        };
                    };
                    readonly required: readonly ["operation", "id", "versionId", "expectedContentHash"];
                    readonly additionalProperties: false;
                }];
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }, {
            readonly name: "workshop_image";
            readonly description: "Find ready image assets, generate and upload a workshop image using server model credentials, or upload base64 bytes. Use returned storageUrl in image dataClean JSON.";
            readonly annotations: {
                readonly readOnlyHint: false;
                readonly destructiveHint: true;
                readonly idempotentHint: false;
                readonly openWorldHint: true;
            };
            readonly inputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly oneOf: readonly [{
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "find";
                        };
                        readonly query: {
                            readonly type: "string";
                            readonly maxLength: 120;
                        };
                    };
                    readonly required: readonly ["operation", "query"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "generate";
                        };
                        readonly prompt: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 4000;
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 120;
                        };
                    };
                    readonly required: readonly ["operation", "prompt", "name"];
                    readonly additionalProperties: false;
                }, {
                    readonly type: "object";
                    readonly properties: {
                        readonly operation: {
                            readonly type: "string";
                            readonly const: "upload";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                            readonly maxLength: 120;
                        };
                        readonly mediaType: {
                            readonly type: "string";
                            readonly enum: readonly ["image/png", "image/jpeg", "image/webp", "image/gif"];
                        };
                        readonly base64: {
                            readonly type: "string";
                            readonly minLength: 4;
                            readonly maxLength: 6291456;
                            readonly pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$";
                        };
                    };
                    readonly required: readonly ["operation", "name", "mediaType", "base64"];
                    readonly additionalProperties: false;
                }];
            };
            readonly outputSchema: {
                readonly $schema: "https://json-schema.org/draft/2020-12/schema";
                readonly type: "object";
                readonly properties: {
                    readonly data: {};
                };
                readonly required: readonly ["data"];
                readonly additionalProperties: false;
            };
        }];
    };
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
