#!/usr/bin/env node
/**
 * OpenAPI Specification Generator for GitBook Documentation
 * 
 * Built with ❤️ by nich (https://github.com/nirholas) 👉 nich on X (https://x.com/nichxbt)
 * 
 * Generates OpenAPI 3.0 specs from scraped GitBook documentation
 * Perfect for API client generation, Postman imports, and testing
 * 
 * Usage:
 *   tsx src/api-spec-generator.ts ./output/sentry
 *   tsx src/api-spec-generator.ts ./output/stripe --output ./api-spec.json
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface ApiEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  parameters: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  tags: string[];
}

interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description: string;
  required: boolean;
  schema: Schema;
}

interface RequestBody {
  description: string;
  required: boolean;
  content: {
    'application/json': {
      schema: Schema;
    };
  };
}

interface Response {
  description: string;
  content?: {
    'application/json': {
      schema: Schema;
      examples?: Record<string, any>;
    };
  };
}

interface Schema {
  type: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  example?: any;
  enum?: string[];
  format?: string;
}

class ApiSpecGenerator {
  private docsPath: string;
  private outputPath: string;

  constructor(docsPath: string, outputPath?: string) {
    this.docsPath = docsPath;
    this.outputPath = outputPath || path.join(docsPath, 'api-spec.json');
  }

  async generate(): Promise<void> {
    console.log('🔧 Generating OpenAPI 3.0 specification...');

    // Read metadata
    const metadataPath = path.join(this.docsPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
    const baseUrl = metadata.baseUrl || metadata.url;
    const pages = (metadata.pageList || metadata.pages || []) as Array<{
      title: string;
      url: string;
      section: string;
      meta?: any;
    }>;

    const spec = {
      openapi: '3.0.0',
      info: {
        title: `${new URL(baseUrl).hostname} API`,
        description: `Auto-generated from ${baseUrl}`,
        version: '1.0.0',
        contact: {
          name: 'API Documentation',
          url: baseUrl,
        },
      },
      servers: [
        {
          url: baseUrl,
          description: 'Production server',
        },
      ],
      paths: {} as Record<string, any>,
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
      tags: [] as Array<{ name: string; description: string }>,
    };

    // Extract endpoints from pages with API info
    const endpoints: ApiEndpoint[] = [];
    const tags = new Set<string>();

    for (const page of pages) {
      const section = page.section || 'root';
      const pagePath = path.join(
        this.docsPath,
        section,
        `${this.sanitizeFilename(page.title)}.md`
      );

      try {
        const content = await fs.readFile(pagePath, 'utf-8');

        if (!this.looksLikeApiDoc(content)) {
          continue;
        }

        const endpoint = this.parseEndpoint(content, { ...page, section });

        if (endpoint) {
          endpoints.push(endpoint);
          endpoint.tags.forEach((tag) => tags.add(tag));
          console.log(`✓ ${endpoint.method} ${endpoint.path}`);
        }
      } catch (error) {
        console.warn(`⚠️  Could not process ${page.title}`);
      }
    }

    // Build paths from endpoints
    for (const endpoint of endpoints) {
      const pathKey = endpoint.path;

      if (!spec.paths[pathKey]) {
        spec.paths[pathKey] = {};
      }

      spec.paths[pathKey][endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters,
        requestBody: endpoint.requestBody,
        responses: endpoint.responses,
        security: [{ bearerAuth: [] }],
      };
    }

    // Add tags
    spec.tags = Array.from(tags).map((tag) => ({
      name: tag,
      description: `${tag} operations`,
    }));

    // Save spec
    await fs.writeFile(this.outputPath, JSON.stringify(spec, null, 2));

    console.log(`\n✅ Generated OpenAPI spec with ${endpoints.length} endpoints`);
    console.log(`📁 Saved to: ${this.outputPath}`);
    console.log(`\n💡 Use with:`);
    console.log(`   - Postman: Import > OpenAPI 3.0`);
    console.log(`   - Swagger UI: https://editor.swagger.io`);
    console.log(`   - Codegen: openapi-generator generate -i ${this.outputPath}`);
  }

  private parseEndpoint(markdown: string, page: any): ApiEndpoint | null {
    // Extract method
    const methodMatch = markdown.match(/\*\*Method:\*\*\s*`?(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)`?/i);
    if (!methodMatch) return null;

    const method = methodMatch[1].toUpperCase();

    // Extract endpoint path
    const endpointMatch = markdown.match(/\*\*Endpoint:\*\*\s*`([^`]+)`/);
    if (!endpointMatch) return null;

    let endpointPath = endpointMatch[1];

    // Convert to OpenAPI path format
    endpointPath = endpointPath.replace(/\{([^}]+)\}/g, '{$1}');
    endpointPath = endpointPath.replace(/:\w+/g, (match) => `{${match.slice(1)}}`);

    // Extract description
    const descMatch = markdown.match(/##\s+Documentation\n\n([^\n]+)/);
    const description = descMatch ? descMatch[1] : page.title;

    // Extract parameters
    const parameters: Parameter[] = [];
    const paramTableMatch = markdown.match(/### Parameters\n\n\|([^#]+)/s);

    if (paramTableMatch) {
      const rows = paramTableMatch[1].split('\n').slice(2);

      for (const row of rows) {
        const cells = row
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);

        if (cells.length >= 4) {
          const paramName = cells[0];
          const paramType = cells[1].toLowerCase();
          const required = cells[2].toLowerCase() === 'yes';
          const paramDesc = cells[3];

          // Determine parameter location
          let paramIn: 'path' | 'query' | 'header' | 'cookie' = 'query';
          if (endpointPath.includes(`{${paramName}}`)) {
            paramIn = 'path';
          } else if (
            paramName.toLowerCase().includes('header') ||
            paramName.toLowerCase().includes('authorization')
          ) {
            paramIn = 'header';
          }

          parameters.push({
            name: paramName,
            in: paramIn,
            description: paramDesc,
            required: required || paramIn === 'path',
            schema: this.mapTypeToSchema(paramType),
          });
        }
      }
    }

    // Build request body for POST/PUT/PATCH
    let requestBody: RequestBody | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const bodyParams = parameters.filter((p) => p.in === 'query');
      if (bodyParams.length > 0) {
        const properties: Record<string, Schema> = {};
        const required: string[] = [];

        for (const param of bodyParams) {
          properties[param.name] = param.schema;
          if (param.required) required.push(param.name);
        }

        requestBody = {
          description: `${method} request body`,
          required: required.length > 0,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties,
                required,
              },
            },
          },
        };

        // Remove body params from parameters (they're in requestBody now)
        parameters.splice(
          0,
          parameters.length,
          ...parameters.filter((p) => p.in !== 'query')
        );
      }
    }

    // Build responses
    const responses: Record<string, Response> = {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
      '400': {
        description: 'Bad request',
      },
      '401': {
        description: 'Unauthorized',
      },
      '404': {
        description: 'Not found',
      },
      '500': {
        description: 'Internal server error',
      },
    };

    return {
      method,
      path: endpointPath,
      summary: page.title,
      description,
      parameters,
      requestBody,
      responses,
      tags: [page.section],
    };
  }

  private mapTypeToSchema(type: string): Schema {
    const typeMap: Record<string, Schema> = {
      string: { type: 'string' },
      integer: { type: 'integer', format: 'int32' },
      number: { type: 'number' },
      boolean: { type: 'boolean' },
      array: { type: 'array', items: { type: 'string' } },
      object: { type: 'object' },
    };

    return typeMap[type.toLowerCase()] || { type: 'string' };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);
  }

  private looksLikeApiDoc(markdown: string): boolean {
    return /\*\*Method:\*\*\s*`?(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)`?/i.test(markdown) &&
           /\*\*Endpoint:\*\*\s*`[^`]+`/i.test(markdown);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
OpenAPI Spec Generator for GitBook
===================================

Generate OpenAPI 3.0 specifications from scraped GitBook documentation

Usage:
  tsx src/api-spec-generator.ts <docs-path> [options]

Examples:
  tsx src/api-spec-generator.ts ./output/sentry
  tsx src/api-spec-generator.ts ./output/stripe --output ./custom-spec.json

Options:
  --output <file>   Output file path (default: <docs-path>/api-spec.json)
  --help           Show this help
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  const generator = new ApiSpecGenerator(docsPath, outputPath);

  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { ApiSpecGenerator };
