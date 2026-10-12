import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { AppModule } from './app.module';
import { catalogDefinitions, contractSchemas } from './tools/catalog.schemas';

async function generate() {
  // Generation has no network/database effects and uses explicit placeholder configuration.
  process.env.RUNTIME_PROFILE = 'local';
  process.env.NODE_ENV = 'development';
  process.env.MCP_AUTH_MODE = 'local-public';
  process.env.MCP_LOCAL_DEV = 'true';
  process.env.DOCUMENT_BASE_URL ??= 'http://127.0.0.1:4001';
  process.env.CODING_LABS_BASE_URL ??= 'http://127.0.0.1:4002';
  const app = await NestFactory.create(AppModule, {
    logger: false,
    bodyParser: false,
  });
  try {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('NGX Workshop catalog MCP contracts')
        .setDescription(
          'MCP runs at /mcp. Components describe tool arguments/results; there are no REST CRUD endpoints. See mcp-tools.json for protocol tool definitions.'
        )
        .setVersion('0.1.0')
        .build()
    );
    const schemas = Object.fromEntries(
      Object.entries(contractSchemas).map(([name, schema]) => [
        name,
        z.toJSONSchema(schema, { target: 'openapi-3.0' }),
      ])
    );
    const artifact = {
      name: 'ngx-workshop-catalog',
      version: '0.1.0',
      tools: Object.entries(catalogDefinitions).map(([name, definition]) => ({
        name,
        description: definition.description,
        annotations: definition.annotations,
        inputSchema: z.toJSONSchema(definition.inputSchema),
        outputSchema: z.toJSONSchema(definition.outputSchema),
      })),
      errorSchema: z.toJSONSchema(contractSchemas.ToolError),
    };
    writeFileSync(
      'openapi.json',
      JSON.stringify(
        {
          ...document,
          components: {
            ...document.components,
            schemas: { ...document.components?.schemas, ...schemas },
          },
        },
        null,
        2
      ) + '\n'
    );
    writeFileSync('mcp-tools.json', JSON.stringify(artifact, null, 2) + '\n');
  } finally {
    await app.close();
  }
}
void generate().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Contract generation failed'
  );
  process.exitCode = 1;
});
