# Plan

Baseline HEAD: `28971eec28068f26c04147b0a7b22afca6b64f16`. Audit found jobs validate, publish, deploy;
deploy prerequisites were `['validate', 'publish']`.
Use the central Node CLI policy and reviewed service-specific job profile. Separate
validation from publication, make deploy need validate only, preserve transport
steps and existing contract/version semantics. Main-only guards protect mutation;
OIDC write permission belongs only to manual publish. Preserve domain/access rules;
no application/schema changes. Verify YAML parsing, event gates, source transport
comparison and CLI drift check. No live deployment verification is requested.
