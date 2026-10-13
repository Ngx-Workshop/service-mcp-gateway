// Generated from catalog.schemas.ts; do not edit.
export const mcpCatalogContract = {
  "name": "ngx-workshop-catalog",
  "version": "0.1.0",
  "tools": [
    {
      "name": "list_workshops",
      "description": "List public workshop summaries in a section. This catalog does not determine learner eligibility.",
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "idempotentHint": true,
        "openWorldHint": true
      },
      "inputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "sectionId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          }
        },
        "required": [
          "sectionId"
        ],
        "additionalProperties": false
      },
      "outputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "workshops": {
            "maxItems": 500,
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 120
                },
                "sectionId": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 120
                },
                "title": {
                  "type": "string",
                  "maxLength": 2000
                },
                "summary": {
                  "type": "string",
                  "maxLength": 20000
                },
                "level": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 20
                }
              },
              "required": [
                "id",
                "sectionId",
                "title",
                "summary",
                "level"
              ],
              "additionalProperties": false
            }
          }
        },
        "required": [
          "workshops"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "get_workshop",
      "description": "Get public workshop metadata and its ordered learning outline within a section. Does not return document bodies or learner progress.",
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "idempotentHint": true,
        "openWorldHint": true
      },
      "inputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "sectionId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "workshopId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          }
        },
        "required": [
          "sectionId",
          "workshopId"
        ],
        "additionalProperties": false
      },
      "outputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "workshop": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120
              },
              "sectionId": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120
              },
              "title": {
                "type": "string",
                "maxLength": 2000
              },
              "summary": {
                "type": "string",
                "maxLength": 20000
              },
              "level": {
                "type": "integer",
                "minimum": 1,
                "maximum": 20
              },
              "outline": {
                "maxItems": 500,
                "type": "array",
                "items": {
                  "oneOf": [
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 120
                        },
                        "title": {
                          "type": "string",
                          "maxLength": 2000
                        },
                        "kind": {
                          "type": "string",
                          "const": "PAGE"
                        },
                        "resourceId": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 120
                        }
                      },
                      "required": [
                        "id",
                        "title",
                        "kind",
                        "resourceId"
                      ],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 120
                        },
                        "title": {
                          "type": "string",
                          "maxLength": 2000
                        },
                        "kind": {
                          "type": "string",
                          "const": "CODING_LAB"
                        },
                        "resourceId": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 120
                        }
                      },
                      "required": [
                        "id",
                        "title",
                        "kind",
                        "resourceId"
                      ],
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 120
                        },
                        "title": {
                          "type": "string",
                          "maxLength": 2000
                        },
                        "kind": {
                          "type": "string",
                          "const": "ASSESSMENT_TEST"
                        },
                        "resourceId": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 120
                        }
                      },
                      "required": [
                        "id",
                        "title",
                        "kind",
                        "resourceId"
                      ],
                      "additionalProperties": false
                    }
                  ]
                }
              }
            },
            "required": [
              "id",
              "sectionId",
              "title",
              "summary",
              "level",
              "outline"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "workshop"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "get_coding_lab",
      "description": "Get a published coding challenge, starter code, hints and public sample tests. Optionally select a published version; no solutions or hidden tests.",
      "annotations": {
        "readOnlyHint": true,
        "destructiveHint": false,
        "idempotentHint": true,
        "openWorldHint": true
      },
      "inputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "labId": {
            "type": "string",
            "pattern": "^[a-f\\d]{24}$"
          },
          "versionId": {
            "type": "string",
            "pattern": "^[a-f\\d]{24}$"
          }
        },
        "required": [
          "labId"
        ],
        "additionalProperties": false
      },
      "outputSchema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "lab": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "pattern": "^[a-f\\d]{24}$"
              },
              "versionId": {
                "type": "string",
                "pattern": "^[a-f\\d]{24}$"
              },
              "versionNumber": {
                "type": "integer",
                "exclusiveMinimum": 0,
                "maximum": 9007199254740991
              },
              "title": {
                "type": "string",
                "maxLength": 2000
              },
              "difficulty": {
                "type": "string",
                "enum": [
                  "intro",
                  "easy",
                  "medium",
                  "hard"
                ]
              },
              "language": {
                "type": "string",
                "enum": [
                  "javascript",
                  "typescript"
                ]
              },
              "promptMarkdown": {
                "type": "string",
                "maxLength": 100000
              },
              "hints": {
                "maxItems": 100,
                "type": "array",
                "items": {
                  "type": "string",
                  "maxLength": 20000
                }
              },
              "starterCode": {
                "type": "string",
                "maxLength": 100000
              },
              "sampleTests": {
                "maxItems": 100,
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "maxLength": 2000
                    },
                    "kind": {
                      "type": "string",
                      "enum": [
                        "io",
                        "unit"
                      ]
                    },
                    "input": {},
                    "expected": {},
                    "comparator": {
                      "type": "object",
                      "properties": {
                        "kind": {
                          "type": "string",
                          "enum": [
                            "deepEqual",
                            "strictEqual",
                            "numberTolerance",
                            "stringNormalized",
                            "custom"
                          ]
                        },
                        "tolerance": {
                          "type": "number"
                        },
                        "normalizeWhitespace": {
                          "type": "boolean"
                        },
                        "ignoreCase": {
                          "type": "boolean"
                        },
                        "customComparatorId": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "kind"
                      ],
                      "additionalProperties": false
                    },
                    "testCode": {
                      "type": "string",
                      "maxLength": 50000
                    },
                    "framework": {
                      "type": "string",
                      "enum": [
                        "jest",
                        "vitest"
                      ]
                    }
                  },
                  "required": [
                    "name",
                    "kind"
                  ],
                  "additionalProperties": false
                }
              },
              "entryFnName": {
                "type": "string",
                "maxLength": 200
              }
            },
            "required": [
              "id",
              "versionId",
              "versionNumber",
              "title",
              "language",
              "promptMarkdown",
              "hints",
              "starterCode",
              "sampleTests"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "lab"
        ],
        "additionalProperties": false
      }
    }
  ],
  "publishing": {
    "endpoint": "/mcp/publishing",
    "authentication": "platform administrator bearer",
    "tools": [
      {
        "name": "generate_workshop_draft",
        "description": "Generate documentation, labs and assessment from a brief; no owner writes. Review before publish.",
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "inputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "brief": {
              "type": "string",
              "minLength": 1,
              "maxLength": 20000
            },
            "sectionId": {
              "type": "string",
              "minLength": 1,
              "maxLength": 120
            },
            "level": {
              "type": "integer",
              "minimum": 1,
              "maximum": 20
            }
          },
          "required": [
            "brief",
            "sectionId",
            "level"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "data": {}
          },
          "required": [
            "data"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "validate_workshop_draft",
        "description": "Validate and normalize Ngx-EditorJs2 workshop draft without writing.",
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "inputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "draft": {
              "type": "object",
              "properties": {
                "sectionId": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 120
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 160
                },
                "summary": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 20000
                },
                "level": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 20
                },
                "pages": {
                  "minItems": 1,
                  "maxItems": 20,
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 160
                      },
                      "blocks": {
                        "minItems": 1,
                        "maxItems": 200,
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "blockId": {
                              "type": "string",
                              "minLength": 1,
                              "maxLength": 120
                            },
                            "sortIndex": {
                              "type": "integer",
                              "minimum": 0,
                              "maximum": 9007199254740991
                            },
                            "componentInstanceName": {
                              "type": "string",
                              "enum": [
                                "HeaderBlockComponent",
                                "ParagraphBlockComponent",
                                "NgxEditorJs2BlockquotesComponent",
                                "NgxEditorJs2PanelComponent",
                                "NgxEditorJs2ImageComponent",
                                "NgxEditorJs2CodemirrorComponent",
                                "NgxEditorJs2MermaidjsComponent",
                                "NgxEditorJs2PopQuizComponent"
                              ]
                            },
                            "savedAction": {
                              "type": "string",
                              "maxLength": 120
                            },
                            "dataClean": {
                              "type": "string",
                              "maxLength": 100000
                            }
                          },
                          "required": [
                            "blockId",
                            "sortIndex",
                            "componentInstanceName",
                            "savedAction",
                            "dataClean"
                          ],
                          "additionalProperties": false
                        }
                      }
                    },
                    "required": [
                      "name",
                      "blocks"
                    ],
                    "additionalProperties": false
                  }
                },
                "labs": {
                  "minItems": 1,
                  "maxItems": 10,
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "metadata": {
                        "type": "object",
                        "properties": {
                          "title": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 160
                          },
                          "slug": {
                            "type": "string",
                            "maxLength": 200,
                            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
                          },
                          "summary": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 20000
                          },
                          "difficulty": {
                            "type": "string",
                            "enum": [
                              "intro",
                              "easy",
                              "medium",
                              "hard"
                            ]
                          }
                        },
                        "required": [
                          "title",
                          "slug",
                          "summary",
                          "difficulty"
                        ],
                        "additionalProperties": false
                      },
                      "version": {
                        "type": "object",
                        "properties": {
                          "language": {
                            "type": "string",
                            "enum": [
                              "javascript",
                              "typescript"
                            ]
                          },
                          "promptMarkdown": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 20000
                          },
                          "hints": {
                            "maxItems": 30,
                            "type": "array",
                            "items": {
                              "type": "string",
                              "minLength": 1,
                              "maxLength": 20000
                            }
                          },
                          "starterCode": {
                            "type": "string",
                            "maxLength": 50000
                          },
                          "referenceSolution": {
                            "type": "object",
                            "properties": {
                              "code": {
                                "type": "string",
                                "minLength": 1,
                                "maxLength": 50000
                              }
                            },
                            "required": [
                              "code"
                            ],
                            "additionalProperties": false
                          },
                          "sampleTests": {
                            "minItems": 1,
                            "maxItems": 50,
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "name": {
                                  "type": "string",
                                  "maxLength": 2000
                                },
                                "kind": {
                                  "type": "string",
                                  "enum": [
                                    "io",
                                    "unit"
                                  ]
                                },
                                "input": {},
                                "expected": {},
                                "comparator": {
                                  "type": "object",
                                  "properties": {
                                    "kind": {
                                      "type": "string",
                                      "enum": [
                                        "deepEqual",
                                        "strictEqual",
                                        "numberTolerance",
                                        "stringNormalized",
                                        "custom"
                                      ]
                                    },
                                    "tolerance": {
                                      "type": "number"
                                    },
                                    "normalizeWhitespace": {
                                      "type": "boolean"
                                    },
                                    "ignoreCase": {
                                      "type": "boolean"
                                    },
                                    "customComparatorId": {
                                      "type": "string"
                                    }
                                  },
                                  "required": [
                                    "kind"
                                  ],
                                  "additionalProperties": false
                                },
                                "testCode": {
                                  "type": "string",
                                  "maxLength": 50000
                                },
                                "framework": {
                                  "type": "string",
                                  "enum": [
                                    "jest",
                                    "vitest"
                                  ]
                                }
                              },
                              "required": [
                                "name",
                                "kind"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "hiddenTests": {
                            "minItems": 1,
                            "maxItems": 50,
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "name": {
                                  "type": "string",
                                  "maxLength": 2000
                                },
                                "kind": {
                                  "type": "string",
                                  "enum": [
                                    "io",
                                    "unit"
                                  ]
                                },
                                "input": {},
                                "expected": {},
                                "comparator": {
                                  "type": "object",
                                  "properties": {
                                    "kind": {
                                      "type": "string",
                                      "enum": [
                                        "deepEqual",
                                        "strictEqual",
                                        "numberTolerance",
                                        "stringNormalized",
                                        "custom"
                                      ]
                                    },
                                    "tolerance": {
                                      "type": "number"
                                    },
                                    "normalizeWhitespace": {
                                      "type": "boolean"
                                    },
                                    "ignoreCase": {
                                      "type": "boolean"
                                    },
                                    "customComparatorId": {
                                      "type": "string"
                                    }
                                  },
                                  "required": [
                                    "kind"
                                  ],
                                  "additionalProperties": false
                                },
                                "testCode": {
                                  "type": "string",
                                  "maxLength": 50000
                                },
                                "framework": {
                                  "type": "string",
                                  "enum": [
                                    "jest",
                                    "vitest"
                                  ]
                                }
                              },
                              "required": [
                                "name",
                                "kind"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "runner": {
                            "type": "object",
                            "properties": {
                              "timeoutMs": {
                                "type": "integer",
                                "minimum": 100,
                                "maximum": 10000
                              },
                              "entryFnName": {
                                "type": "string",
                                "pattern": "^[a-zA-Z_$][\\w$]*$"
                              }
                            },
                            "required": [
                              "timeoutMs",
                              "entryFnName"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "language",
                          "promptMarkdown",
                          "hints",
                          "starterCode",
                          "referenceSolution",
                          "sampleTests",
                          "hiddenTests",
                          "runner"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "required": [
                      "metadata",
                      "version"
                    ],
                    "additionalProperties": false
                  }
                },
                "assessment": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 160
                    },
                    "subject": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "sectionTitle": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "level": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 20
                    },
                    "testQuestions": {
                      "minItems": 1,
                      "maxItems": 100,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "question": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          },
                          "choices": {
                            "minItems": 2,
                            "maxItems": 10,
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "value": {
                                  "type": "string",
                                  "minLength": 1,
                                  "maxLength": 400
                                }
                              },
                              "required": [
                                "value"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "answer": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 400
                          },
                          "correctResponse": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          },
                          "incorrectResponse": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          }
                        },
                        "required": [
                          "question",
                          "choices",
                          "answer",
                          "correctResponse",
                          "incorrectResponse"
                        ],
                        "additionalProperties": false
                      }
                    }
                  },
                  "required": [
                    "name",
                    "subject",
                    "level",
                    "testQuestions"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "sectionId",
                "name",
                "summary",
                "level",
                "pages",
                "labs",
                "assessment"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "draft"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "data": {}
          },
          "required": [
            "data"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "publish_workshop",
        "description": "Publish reviewed workshop. Keep requestId for duplicate protection and recovery. Returns completed resource steps on failure.",
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "inputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "requestId": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            },
            "draft": {
              "type": "object",
              "properties": {
                "sectionId": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 120
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 160
                },
                "summary": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 20000
                },
                "level": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 20
                },
                "pages": {
                  "minItems": 1,
                  "maxItems": 20,
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 160
                      },
                      "blocks": {
                        "minItems": 1,
                        "maxItems": 200,
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "blockId": {
                              "type": "string",
                              "minLength": 1,
                              "maxLength": 120
                            },
                            "sortIndex": {
                              "type": "integer",
                              "minimum": 0,
                              "maximum": 9007199254740991
                            },
                            "componentInstanceName": {
                              "type": "string",
                              "enum": [
                                "HeaderBlockComponent",
                                "ParagraphBlockComponent",
                                "NgxEditorJs2BlockquotesComponent",
                                "NgxEditorJs2PanelComponent",
                                "NgxEditorJs2ImageComponent",
                                "NgxEditorJs2CodemirrorComponent",
                                "NgxEditorJs2MermaidjsComponent",
                                "NgxEditorJs2PopQuizComponent"
                              ]
                            },
                            "savedAction": {
                              "type": "string",
                              "maxLength": 120
                            },
                            "dataClean": {
                              "type": "string",
                              "maxLength": 100000
                            }
                          },
                          "required": [
                            "blockId",
                            "sortIndex",
                            "componentInstanceName",
                            "savedAction",
                            "dataClean"
                          ],
                          "additionalProperties": false
                        }
                      }
                    },
                    "required": [
                      "name",
                      "blocks"
                    ],
                    "additionalProperties": false
                  }
                },
                "labs": {
                  "minItems": 1,
                  "maxItems": 10,
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "metadata": {
                        "type": "object",
                        "properties": {
                          "title": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 160
                          },
                          "slug": {
                            "type": "string",
                            "maxLength": 200,
                            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
                          },
                          "summary": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 20000
                          },
                          "difficulty": {
                            "type": "string",
                            "enum": [
                              "intro",
                              "easy",
                              "medium",
                              "hard"
                            ]
                          }
                        },
                        "required": [
                          "title",
                          "slug",
                          "summary",
                          "difficulty"
                        ],
                        "additionalProperties": false
                      },
                      "version": {
                        "type": "object",
                        "properties": {
                          "language": {
                            "type": "string",
                            "enum": [
                              "javascript",
                              "typescript"
                            ]
                          },
                          "promptMarkdown": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 20000
                          },
                          "hints": {
                            "maxItems": 30,
                            "type": "array",
                            "items": {
                              "type": "string",
                              "minLength": 1,
                              "maxLength": 20000
                            }
                          },
                          "starterCode": {
                            "type": "string",
                            "maxLength": 50000
                          },
                          "referenceSolution": {
                            "type": "object",
                            "properties": {
                              "code": {
                                "type": "string",
                                "minLength": 1,
                                "maxLength": 50000
                              }
                            },
                            "required": [
                              "code"
                            ],
                            "additionalProperties": false
                          },
                          "sampleTests": {
                            "minItems": 1,
                            "maxItems": 50,
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "name": {
                                  "type": "string",
                                  "maxLength": 2000
                                },
                                "kind": {
                                  "type": "string",
                                  "enum": [
                                    "io",
                                    "unit"
                                  ]
                                },
                                "input": {},
                                "expected": {},
                                "comparator": {
                                  "type": "object",
                                  "properties": {
                                    "kind": {
                                      "type": "string",
                                      "enum": [
                                        "deepEqual",
                                        "strictEqual",
                                        "numberTolerance",
                                        "stringNormalized",
                                        "custom"
                                      ]
                                    },
                                    "tolerance": {
                                      "type": "number"
                                    },
                                    "normalizeWhitespace": {
                                      "type": "boolean"
                                    },
                                    "ignoreCase": {
                                      "type": "boolean"
                                    },
                                    "customComparatorId": {
                                      "type": "string"
                                    }
                                  },
                                  "required": [
                                    "kind"
                                  ],
                                  "additionalProperties": false
                                },
                                "testCode": {
                                  "type": "string",
                                  "maxLength": 50000
                                },
                                "framework": {
                                  "type": "string",
                                  "enum": [
                                    "jest",
                                    "vitest"
                                  ]
                                }
                              },
                              "required": [
                                "name",
                                "kind"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "hiddenTests": {
                            "minItems": 1,
                            "maxItems": 50,
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "name": {
                                  "type": "string",
                                  "maxLength": 2000
                                },
                                "kind": {
                                  "type": "string",
                                  "enum": [
                                    "io",
                                    "unit"
                                  ]
                                },
                                "input": {},
                                "expected": {},
                                "comparator": {
                                  "type": "object",
                                  "properties": {
                                    "kind": {
                                      "type": "string",
                                      "enum": [
                                        "deepEqual",
                                        "strictEqual",
                                        "numberTolerance",
                                        "stringNormalized",
                                        "custom"
                                      ]
                                    },
                                    "tolerance": {
                                      "type": "number"
                                    },
                                    "normalizeWhitespace": {
                                      "type": "boolean"
                                    },
                                    "ignoreCase": {
                                      "type": "boolean"
                                    },
                                    "customComparatorId": {
                                      "type": "string"
                                    }
                                  },
                                  "required": [
                                    "kind"
                                  ],
                                  "additionalProperties": false
                                },
                                "testCode": {
                                  "type": "string",
                                  "maxLength": 50000
                                },
                                "framework": {
                                  "type": "string",
                                  "enum": [
                                    "jest",
                                    "vitest"
                                  ]
                                }
                              },
                              "required": [
                                "name",
                                "kind"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "runner": {
                            "type": "object",
                            "properties": {
                              "timeoutMs": {
                                "type": "integer",
                                "minimum": 100,
                                "maximum": 10000
                              },
                              "entryFnName": {
                                "type": "string",
                                "pattern": "^[a-zA-Z_$][\\w$]*$"
                              }
                            },
                            "required": [
                              "timeoutMs",
                              "entryFnName"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "required": [
                          "language",
                          "promptMarkdown",
                          "hints",
                          "starterCode",
                          "referenceSolution",
                          "sampleTests",
                          "hiddenTests",
                          "runner"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "required": [
                      "metadata",
                      "version"
                    ],
                    "additionalProperties": false
                  }
                },
                "assessment": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 160
                    },
                    "subject": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "sectionTitle": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "level": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 20
                    },
                    "testQuestions": {
                      "minItems": 1,
                      "maxItems": 100,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "question": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          },
                          "choices": {
                            "minItems": 2,
                            "maxItems": 10,
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "value": {
                                  "type": "string",
                                  "minLength": 1,
                                  "maxLength": 400
                                }
                              },
                              "required": [
                                "value"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "answer": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 400
                          },
                          "correctResponse": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          },
                          "incorrectResponse": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          }
                        },
                        "required": [
                          "question",
                          "choices",
                          "answer",
                          "correctResponse",
                          "incorrectResponse"
                        ],
                        "additionalProperties": false
                      }
                    }
                  },
                  "required": [
                    "name",
                    "subject",
                    "level",
                    "testQuestions"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "sectionId",
                "name",
                "summary",
                "level",
                "pages",
                "labs",
                "assessment"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "requestId",
            "draft"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "data": {}
          },
          "required": [
            "data"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "get_publishing_run",
        "description": "Inspect a publishing receipt owned by the authenticated administrator.",
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "inputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "requestId": {
              "type": "string",
              "format": "uuid",
              "pattern": "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$"
            }
          },
          "required": [
            "requestId"
          ],
          "additionalProperties": false
        },
        "outputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "data": {}
          },
          "required": [
            "data"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "manage_document",
        "description": "Admin document/workshop CRUD through service-document.",
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "inputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "sections"
                }
              },
              "required": [
                "operation"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "workshops"
                },
                "sectionId": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 120
                }
              },
              "required": [
                "operation",
                "sectionId"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "read_page"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "create_workshop"
                },
                "sectionId": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 120
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 160
                },
                "summary": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 20000
                },
                "level": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 20
                }
              },
              "required": [
                "operation",
                "sectionId",
                "name",
                "summary",
                "level"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "update_workshop"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 160
                },
                "summary": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 20000
                },
                "level": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 20
                }
              },
              "required": [
                "operation",
                "id",
                "name",
                "summary",
                "level"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "delete_workshop"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "create_page"
                },
                "workshopId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 160
                },
                "blocks": {
                  "minItems": 1,
                  "maxItems": 200,
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "blockId": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 120
                      },
                      "sortIndex": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "componentInstanceName": {
                        "type": "string",
                        "enum": [
                          "HeaderBlockComponent",
                          "ParagraphBlockComponent",
                          "NgxEditorJs2BlockquotesComponent",
                          "NgxEditorJs2PanelComponent",
                          "NgxEditorJs2ImageComponent",
                          "NgxEditorJs2CodemirrorComponent",
                          "NgxEditorJs2MermaidjsComponent",
                          "NgxEditorJs2PopQuizComponent"
                        ]
                      },
                      "savedAction": {
                        "type": "string",
                        "maxLength": 120
                      },
                      "dataClean": {
                        "type": "string",
                        "maxLength": 100000
                      }
                    },
                    "required": [
                      "blockId",
                      "sortIndex",
                      "componentInstanceName",
                      "savedAction",
                      "dataClean"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "operation",
                "workshopId",
                "name",
                "blocks"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "update_page"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "blocks": {
                  "minItems": 1,
                  "maxItems": 200,
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "blockId": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 120
                      },
                      "sortIndex": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "componentInstanceName": {
                        "type": "string",
                        "enum": [
                          "HeaderBlockComponent",
                          "ParagraphBlockComponent",
                          "NgxEditorJs2BlockquotesComponent",
                          "NgxEditorJs2PanelComponent",
                          "NgxEditorJs2ImageComponent",
                          "NgxEditorJs2CodemirrorComponent",
                          "NgxEditorJs2MermaidjsComponent",
                          "NgxEditorJs2PopQuizComponent"
                        ]
                      },
                      "savedAction": {
                        "type": "string",
                        "maxLength": 120
                      },
                      "dataClean": {
                        "type": "string",
                        "maxLength": 100000
                      }
                    },
                    "required": [
                      "blockId",
                      "sortIndex",
                      "componentInstanceName",
                      "savedAction",
                      "dataClean"
                    ],
                    "additionalProperties": false
                  }
                }
              },
              "required": [
                "operation",
                "id",
                "blocks"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "rename_page"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "workshopId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 160
                }
              },
              "required": [
                "operation",
                "id",
                "workshopId",
                "name"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "delete_page"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "workshopId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 160
                }
              },
              "required": [
                "operation",
                "id",
                "workshopId",
                "name"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "add_reference"
                },
                "workshopId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "kind": {
                  "type": "string",
                  "enum": [
                    "CODING_LAB",
                    "ASSESSMENT_TEST"
                  ]
                },
                "resourceId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 160
                }
              },
              "required": [
                "operation",
                "workshopId",
                "kind",
                "resourceId",
                "name"
              ],
              "additionalProperties": false
            }
          ]
        },
        "outputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "data": {}
          },
          "required": [
            "data"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "manage_assessment",
        "description": "Admin assessment CRUD including answers; never expose through catalog endpoint.",
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "inputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "list"
                }
              },
              "required": [
                "operation"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "read"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "create"
                },
                "assessment": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 160
                    },
                    "subject": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "sectionTitle": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "level": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 20
                    },
                    "testQuestions": {
                      "minItems": 1,
                      "maxItems": 100,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "question": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          },
                          "choices": {
                            "minItems": 2,
                            "maxItems": 10,
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "value": {
                                  "type": "string",
                                  "minLength": 1,
                                  "maxLength": 400
                                }
                              },
                              "required": [
                                "value"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "answer": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 400
                          },
                          "correctResponse": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          },
                          "incorrectResponse": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          }
                        },
                        "required": [
                          "question",
                          "choices",
                          "answer",
                          "correctResponse",
                          "incorrectResponse"
                        ],
                        "additionalProperties": false
                      }
                    }
                  },
                  "required": [
                    "name",
                    "subject",
                    "level",
                    "testQuestions"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "operation",
                "assessment"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "update"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "version": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 9007199254740991
                },
                "assessment": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 160
                    },
                    "subject": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "sectionTitle": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 120
                    },
                    "level": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 20
                    },
                    "testQuestions": {
                      "minItems": 1,
                      "maxItems": 100,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "question": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          },
                          "choices": {
                            "minItems": 2,
                            "maxItems": 10,
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "value": {
                                  "type": "string",
                                  "minLength": 1,
                                  "maxLength": 400
                                }
                              },
                              "required": [
                                "value"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "answer": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 400
                          },
                          "correctResponse": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          },
                          "incorrectResponse": {
                            "type": "string",
                            "minLength": 1,
                            "maxLength": 1000
                          }
                        },
                        "required": [
                          "question",
                          "choices",
                          "answer",
                          "correctResponse",
                          "incorrectResponse"
                        ],
                        "additionalProperties": false
                      }
                    }
                  },
                  "required": [
                    "name",
                    "subject",
                    "level",
                    "testQuestions"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "operation",
                "id",
                "version",
                "assessment"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "delete"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id"
              ],
              "additionalProperties": false
            }
          ]
        },
        "outputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "data": {}
          },
          "required": [
            "data"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "manage_coding_lab",
        "description": "Admin lab CRUD/version verification/publication. Delete archives a lab.",
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "inputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "list"
                }
              },
              "required": [
                "operation"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "read"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "create"
                },
                "workshopId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "metadata": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 160
                    },
                    "slug": {
                      "type": "string",
                      "maxLength": 200,
                      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
                    },
                    "summary": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    },
                    "difficulty": {
                      "type": "string",
                      "enum": [
                        "intro",
                        "easy",
                        "medium",
                        "hard"
                      ]
                    }
                  },
                  "required": [
                    "title",
                    "slug",
                    "summary",
                    "difficulty"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "operation",
                "workshopId",
                "metadata"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "update"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "metadata": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 160
                    },
                    "slug": {
                      "type": "string",
                      "maxLength": 200,
                      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
                    },
                    "summary": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    },
                    "difficulty": {
                      "type": "string",
                      "enum": [
                        "intro",
                        "easy",
                        "medium",
                        "hard"
                      ]
                    }
                  },
                  "required": [
                    "title",
                    "slug",
                    "summary",
                    "difficulty"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "operation",
                "id",
                "metadata"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "delete"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "versions"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "read_version"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "versionId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id",
                "versionId"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "create_version"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "version": {
                  "type": "object",
                  "properties": {
                    "language": {
                      "type": "string",
                      "enum": [
                        "javascript",
                        "typescript"
                      ]
                    },
                    "promptMarkdown": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    },
                    "hints": {
                      "maxItems": 30,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 20000
                      }
                    },
                    "starterCode": {
                      "type": "string",
                      "maxLength": 50000
                    },
                    "referenceSolution": {
                      "type": "object",
                      "properties": {
                        "code": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 50000
                        }
                      },
                      "required": [
                        "code"
                      ],
                      "additionalProperties": false
                    },
                    "sampleTests": {
                      "minItems": 1,
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "name": {
                            "type": "string",
                            "maxLength": 2000
                          },
                          "kind": {
                            "type": "string",
                            "enum": [
                              "io",
                              "unit"
                            ]
                          },
                          "input": {},
                          "expected": {},
                          "comparator": {
                            "type": "object",
                            "properties": {
                              "kind": {
                                "type": "string",
                                "enum": [
                                  "deepEqual",
                                  "strictEqual",
                                  "numberTolerance",
                                  "stringNormalized",
                                  "custom"
                                ]
                              },
                              "tolerance": {
                                "type": "number"
                              },
                              "normalizeWhitespace": {
                                "type": "boolean"
                              },
                              "ignoreCase": {
                                "type": "boolean"
                              },
                              "customComparatorId": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "kind"
                            ],
                            "additionalProperties": false
                          },
                          "testCode": {
                            "type": "string",
                            "maxLength": 50000
                          },
                          "framework": {
                            "type": "string",
                            "enum": [
                              "jest",
                              "vitest"
                            ]
                          }
                        },
                        "required": [
                          "name",
                          "kind"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "hiddenTests": {
                      "minItems": 1,
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "name": {
                            "type": "string",
                            "maxLength": 2000
                          },
                          "kind": {
                            "type": "string",
                            "enum": [
                              "io",
                              "unit"
                            ]
                          },
                          "input": {},
                          "expected": {},
                          "comparator": {
                            "type": "object",
                            "properties": {
                              "kind": {
                                "type": "string",
                                "enum": [
                                  "deepEqual",
                                  "strictEqual",
                                  "numberTolerance",
                                  "stringNormalized",
                                  "custom"
                                ]
                              },
                              "tolerance": {
                                "type": "number"
                              },
                              "normalizeWhitespace": {
                                "type": "boolean"
                              },
                              "ignoreCase": {
                                "type": "boolean"
                              },
                              "customComparatorId": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "kind"
                            ],
                            "additionalProperties": false
                          },
                          "testCode": {
                            "type": "string",
                            "maxLength": 50000
                          },
                          "framework": {
                            "type": "string",
                            "enum": [
                              "jest",
                              "vitest"
                            ]
                          }
                        },
                        "required": [
                          "name",
                          "kind"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "runner": {
                      "type": "object",
                      "properties": {
                        "timeoutMs": {
                          "type": "integer",
                          "minimum": 100,
                          "maximum": 10000
                        },
                        "entryFnName": {
                          "type": "string",
                          "pattern": "^[a-zA-Z_$][\\w$]*$"
                        }
                      },
                      "required": [
                        "timeoutMs",
                        "entryFnName"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "required": [
                    "language",
                    "promptMarkdown",
                    "hints",
                    "starterCode",
                    "referenceSolution",
                    "sampleTests",
                    "hiddenTests",
                    "runner"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "operation",
                "id",
                "version"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "update_version"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "versionId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "expectedContentHash": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 20000
                },
                "version": {
                  "type": "object",
                  "properties": {
                    "language": {
                      "type": "string",
                      "enum": [
                        "javascript",
                        "typescript"
                      ]
                    },
                    "promptMarkdown": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 20000
                    },
                    "hints": {
                      "maxItems": 30,
                      "type": "array",
                      "items": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 20000
                      }
                    },
                    "starterCode": {
                      "type": "string",
                      "maxLength": 50000
                    },
                    "referenceSolution": {
                      "type": "object",
                      "properties": {
                        "code": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 50000
                        }
                      },
                      "required": [
                        "code"
                      ],
                      "additionalProperties": false
                    },
                    "sampleTests": {
                      "minItems": 1,
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "name": {
                            "type": "string",
                            "maxLength": 2000
                          },
                          "kind": {
                            "type": "string",
                            "enum": [
                              "io",
                              "unit"
                            ]
                          },
                          "input": {},
                          "expected": {},
                          "comparator": {
                            "type": "object",
                            "properties": {
                              "kind": {
                                "type": "string",
                                "enum": [
                                  "deepEqual",
                                  "strictEqual",
                                  "numberTolerance",
                                  "stringNormalized",
                                  "custom"
                                ]
                              },
                              "tolerance": {
                                "type": "number"
                              },
                              "normalizeWhitespace": {
                                "type": "boolean"
                              },
                              "ignoreCase": {
                                "type": "boolean"
                              },
                              "customComparatorId": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "kind"
                            ],
                            "additionalProperties": false
                          },
                          "testCode": {
                            "type": "string",
                            "maxLength": 50000
                          },
                          "framework": {
                            "type": "string",
                            "enum": [
                              "jest",
                              "vitest"
                            ]
                          }
                        },
                        "required": [
                          "name",
                          "kind"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "hiddenTests": {
                      "minItems": 1,
                      "maxItems": 50,
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "name": {
                            "type": "string",
                            "maxLength": 2000
                          },
                          "kind": {
                            "type": "string",
                            "enum": [
                              "io",
                              "unit"
                            ]
                          },
                          "input": {},
                          "expected": {},
                          "comparator": {
                            "type": "object",
                            "properties": {
                              "kind": {
                                "type": "string",
                                "enum": [
                                  "deepEqual",
                                  "strictEqual",
                                  "numberTolerance",
                                  "stringNormalized",
                                  "custom"
                                ]
                              },
                              "tolerance": {
                                "type": "number"
                              },
                              "normalizeWhitespace": {
                                "type": "boolean"
                              },
                              "ignoreCase": {
                                "type": "boolean"
                              },
                              "customComparatorId": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "kind"
                            ],
                            "additionalProperties": false
                          },
                          "testCode": {
                            "type": "string",
                            "maxLength": 50000
                          },
                          "framework": {
                            "type": "string",
                            "enum": [
                              "jest",
                              "vitest"
                            ]
                          }
                        },
                        "required": [
                          "name",
                          "kind"
                        ],
                        "additionalProperties": false
                      }
                    },
                    "runner": {
                      "type": "object",
                      "properties": {
                        "timeoutMs": {
                          "type": "integer",
                          "minimum": 100,
                          "maximum": 10000
                        },
                        "entryFnName": {
                          "type": "string",
                          "pattern": "^[a-zA-Z_$][\\w$]*$"
                        }
                      },
                      "required": [
                        "timeoutMs",
                        "entryFnName"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "required": [
                    "language",
                    "promptMarkdown",
                    "hints",
                    "starterCode",
                    "referenceSolution",
                    "sampleTests",
                    "hiddenTests",
                    "runner"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "operation",
                "id",
                "versionId",
                "expectedContentHash",
                "version"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "verify"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "versionId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                }
              },
              "required": [
                "operation",
                "id",
                "versionId"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "publish"
                },
                "id": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "versionId": {
                  "type": "string",
                  "pattern": "^[a-f\\d]{24}$"
                },
                "expectedContentHash": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 20000
                }
              },
              "required": [
                "operation",
                "id",
                "versionId",
                "expectedContentHash"
              ],
              "additionalProperties": false
            }
          ]
        },
        "outputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "data": {}
          },
          "required": [
            "data"
          ],
          "additionalProperties": false
        }
      },
      {
        "name": "workshop_image",
        "description": "Find ready images in service-uploader or upload base64 bytes; use returned storageUrl in image dataClean JSON.",
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "inputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "find"
                },
                "query": {
                  "type": "string",
                  "maxLength": 120
                }
              },
              "required": [
                "operation",
                "query"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "operation": {
                  "type": "string",
                  "const": "upload"
                },
                "name": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 120
                },
                "mediaType": {
                  "type": "string",
                  "enum": [
                    "image/png",
                    "image/jpeg",
                    "image/webp",
                    "image/gif"
                  ]
                },
                "base64": {
                  "type": "string",
                  "minLength": 4,
                  "maxLength": 6291456,
                  "pattern": "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$"
                }
              },
              "required": [
                "operation",
                "name",
                "mediaType",
                "base64"
              ],
              "additionalProperties": false
            }
          ]
        },
        "outputSchema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "object",
          "properties": {
            "data": {}
          },
          "required": [
            "data"
          ],
          "additionalProperties": false
        }
      }
    ]
  },
  "errorSchema": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
      "error": {
        "type": "object",
        "properties": {
          "code": {
            "type": "string",
            "enum": [
              "NOT_FOUND",
              "FORBIDDEN",
              "UPSTREAM_TIMEOUT",
              "UPSTREAM_UNAVAILABLE",
              "UPSTREAM_INVALID_RESPONSE",
              "INTERNAL_ERROR"
            ]
          },
          "message": {
            "type": "string"
          }
        },
        "required": [
          "code",
          "message"
        ],
        "additionalProperties": false
      }
    },
    "required": [
      "error"
    ],
    "additionalProperties": false
  }
} as const;
