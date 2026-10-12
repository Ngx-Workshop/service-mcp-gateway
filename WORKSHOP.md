# service-mcp-gateway integration checklist

Native API: /mcp-gateway; browser API: /api/mcp-gateway.
Default port: 3011. Confirm this port is available on your service host.
Contracts: @tmdjr/service-mcp-gateway-contracts; directory: contracts/service-mcp-gateway.
The gateway snippet below strips /api and preserves /mcp-gateway. Replace the example host with your actual private service host.
MongoDB and auth are external prerequisites. Compose requires the external ngx-net network.
The inherited example CRUD endpoints remain unguarded; only auth-test uses RemoteAuthGuard. Choose access policy and adapt example DTOs/schema/tests before production use.

Scaffolding saves seed deployment examples in .ngx-workshop/workflows. Run ngx-workshop deploy . to publish and deploy this project. For services, the CLI updates/pushes Nginx and waits for its deployment to succeed before dispatching service deployment. Configure Actions secrets first; see the CLI deployment guide. Contracts publishing and MFE registration remain separate operations.

The inherited architecture/development docs describe example behavior; the identity, port, and route settings in this file take precedence. Update those docs and AGENTS.md after implementing the product. Existing source-baseline commits refer to the seed, not this new repository.
