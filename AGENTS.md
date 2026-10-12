# Agent entry point — service-mcp-gateway

This repository is the local NestJS MCP catalog gateway. It owns protocol/tool
contracts and typed service adapters, not persistence or domain business logic.
Do not require sibling checkouts to work locally.

## Read before implementation

1. [Constitution](.specify/memory/constitution.md).
2. [Architecture](docs/architecture.md).
3. [Development](docs/development.md).
4. [Workflow](.specify/README.md): specify → plan → tasks → implement → verify.
5. Relevant feature in [specs](specs/README.md).

## Working rules

- Inspect relevant source and git status; preserve unrelated changes.
- Maintain local spec, plan, tasks and handoff for features and behavior changes.
- OAuth is authorized and implemented locally; require bearer access by default.
  Explicit local-public is for local regression tests only. Do not
  weaken local loopback binding or the explicit production profile checks.
- Exactly three read-only tools currently exist. Do not confuse catalog metadata
  with learner eligibility or expose authoring models, solutions or hidden tests.
- Use owning service APIs and published types; never access another service's DB.
- Keep protocol, tools, service validation and projections separate. Incoming
  credentials must not pass through to public owner reads.
- MCP schemas in src/tools/catalog.schemas.ts are the source of truth. Regenerate
  OpenAPI, mcp-tools.json and package exports after contract changes; never
  hand-edit generated files.
- Run behavior tests, strict build, contract build and non-mutating lint as
  appropriate. Distinguish disposable HTTP doubles from live external integration.
- Update context docs and external consumer handoff for compatibility changes.
- Production is deployed after explicit user authorization. Actions validates;
  package publication is a separate manual action after validation. Never
  reintroduce automatic rollout.

The lightweight Markdown workflow requires no installed Spec Kit or slash commands.
