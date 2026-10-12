import {
  Controller,
  Get,
  Inject,
  Header,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { CATALOG_CONFIG, CatalogConfig } from '../mcp/catalog.config';
export class OAuthResourceMetadataDto {
  @ApiProperty() resource!: string;
  @ApiProperty({ type: [String] }) authorization_servers!: string[];
  @ApiProperty({ type: [String] }) scopes_supported!: string[];
  @ApiProperty({ type: [String] }) bearer_methods_supported!: string[];
}
@Controller('.well-known/oauth-protected-resource')
export class OAuthMetadataController {
  constructor(@Inject(CATALOG_CONFIG) private readonly config: CatalogConfig) {}
  @Get('mcp')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'OAuth protected MCP resource metadata' })
  @ApiOkResponse({ type: OAuthResourceMetadataDto })
  metadata(): OAuthResourceMetadataDto {
    const auth = this.config.auth;
    if (auth.mode !== 'oauth') throw new NotFoundException();
    return {
      resource: auth.resource,
      authorization_servers: [auth.issuer],
      scopes_supported: ['catalog:read'],
      bearer_methods_supported: ['header'],
    };
  }
}
