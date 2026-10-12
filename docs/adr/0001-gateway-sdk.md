# ADR 0001: Dedicated gateway and official SDK
Status: Accepted · 2026-10-12

## Context
NGX Workshop services already own domain rules and REST contracts. MCP needs a
stable protocol boundary without duplicating logic or adding agent infrastructure.

## Decision
Use NestJS for dependency injection and lifecycle, official MCP server 2.3.1 and
Node adapter 2.1.1 for Streamable HTTP. Register exactly three tools from injected
adapters. Use the SDK's stateless modern and legacy handling; no sessions or
community Nest wrapper. Use RxJS in HTTP clients and firstValueFrom at callbacks.
No MongoDB module, domain writes, resources/prompts or agent runtime.

## Alternatives and consequences
Per-service MCP would duplicate protocol/security work and expose internal
release changes. Community wrappers add an unnecessary compatibility owner. The
central gateway adds a network hop and shared availability dependency; its small
scope and bounded upstream requests limit that cost. Modern and legacy official
SDK round-trip tests protect transport compatibility. Sources:
https://github.com/modelcontextprotocol/typescript-sdk and
https://ts.sdk.modelcontextprotocol.io/v2/serving/legacy-clients.html.
