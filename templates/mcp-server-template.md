# MCP Server Template for GitBook APIs

Use this template to build an MCP server from scraped GitBook documentation.

---

## 📋 Prerequisites

1. Scraped documentation in `./output/<service-name>/`
2. Generated MCP tools in `./output/<service-name>/mcp-tools/`
3. API key or authentication credentials

---

## 🏗️ Project Structure

```
<service-name>-mcp-server/
├── src/
│   ├── index.ts           # Main server file
│   ├── tools/             # Tool implementations
│   │   ├── resource1.ts
│   │   ├── resource2.ts
│   │   └── index.ts
│   ├── client.ts          # API client wrapper
│   ├── types.ts           # TypeScript types
│   └── utils/
│       ├── errors.ts
│       ├── validation.ts
│       └── cache.ts
├── generated/
│   └── mcp-tools.ts       # From generator
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📦 package.json

```json
{
  "name": "<service-name>-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "<service-name>-mcp": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod +x build/index.js",
    "dev": "tsx watch src/index.ts",
    "prepare": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "axios": "^1.7.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.20.0",
    "typescript": "^5.9.0"
  }
}
```

---

## 🔧 src/index.ts

```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { mcpTools } from '../generated/mcp-tools.js';
import { APIClient } from './client.js';
import * as tools from './tools/index.js';

// Initialize API client
const apiClient = new APIClient({
  apiKey: process.env.API_KEY!,
  baseUrl: process.env.API_BASE_URL || 'https://api.service.com',
});

// Create MCP server
const server = new Server(
  {
    name: '<service-name>-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List all tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: mcpTools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Route to appropriate tool handler
    let result;

    if (name.startsWith('resource1_')) {
      result = await tools.handleResource1Tool(name, args, apiClient);
    } else if (name.startsWith('resource2_')) {
      result = await tools.handleResource2Tool(name, args, apiClient);
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('<Service Name> MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

---

## 🌐 src/client.ts

```typescript
import axios, { AxiosInstance } from 'axios';

export interface APIClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

export class APIClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: APIClientConfig) {
    this.apiKey = config.apiKey;
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': '<Service Name> MCP Server/1.0',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new Error(
            `API Error (${error.response.status}): ${
              error.response.data?.message || error.message
            }`
          );
        }
        throw error;
      }
    );
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.client.delete<T>(endpoint);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data);
    return response.data;
  }
}
```

---

## 🔨 src/tools/resource1.ts

```typescript
import { APIClient } from '../client.js';

export async function handleResource1Tool(
  toolName: string,
  args: Record<string, any>,
  client: APIClient
): Promise<any> {
  switch (toolName) {
    case 'resource1_list':
      return await client.get('/resource1', {
        limit: args.limit || 10,
        offset: args.offset || 0,
      });

    case 'resource1_get':
      if (!args.id) throw new Error('id is required');
      return await client.get(`/resource1/${args.id}`);

    case 'resource1_create':
      return await client.post('/resource1', {
        name: args.name,
        description: args.description,
        metadata: args.metadata,
      });

    case 'resource1_update':
      if (!args.id) throw new Error('id is required');
      return await client.patch(`/resource1/${args.id}`, {
        name: args.name,
        description: args.description,
      });

    case 'resource1_delete':
      if (!args.id) throw new Error('id is required');
      return await client.delete(`/resource1/${args.id}`);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
```

---

## 🔒 src/utils/validation.ts

```typescript
import { z } from 'zod';

export function validateArgs<T>(
  schema: z.ZodSchema<T>,
  args: unknown
): T {
  try {
    return schema.parse(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      throw new Error(`Validation error: ${messages.join(', ')}`);
    }
    throw error;
  }
}

// Example schema
export const CreateResource1Schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});
```

---

## ⚙️ Configuration

### Claude Desktop

```json
{
  "mcpServers": {
    "<service-name>": {
      "command": "node",
      "args": ["/path/to/<service-name>-mcp-server/build/index.js"],
      "env": {
        "API_KEY": "your-api-key-here",
        "API_BASE_URL": "https://api.service.com"
      }
    }
  }
}
```

### Environment Variables

```bash
# .env
API_KEY=your-api-key
API_BASE_URL=https://api.service.com
NODE_ENV=production
LOG_LEVEL=info
```

---

## 🧪 Testing

### test/tools.test.ts

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { APIClient } from '../src/client.js';
import { handleResource1Tool } from '../src/tools/resource1.js';

describe('Resource1 Tools', () => {
  let client: APIClient;

  beforeAll(() => {
    client = new APIClient({
      apiKey: process.env.TEST_API_KEY!,
      baseUrl: 'https://api-test.service.com',
    });
  });

  it('should list resources', async () => {
    const result = await handleResource1Tool(
      'resource1_list',
      { limit: 5 },
      client
    );
    
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should create resource', async () => {
    const result = await handleResource1Tool(
      'resource1_create',
      { name: 'Test Resource' },
      client
    );
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test Resource');
  });
});
```

---

## 📚 Documentation

### README.md

```markdown
# <Service Name> MCP Server

MCP server for <Service Name> API.

## Installation

```bash
npm install
npm run build
```

## Usage

Configure in Claude Desktop:

```json
{
  "mcpServers": {
    "<service-name>": {
      "command": "node",
      "args": ["./build/index.js"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

## Available Tools

- `resource1_list` - List all resources
- `resource1_get` - Get resource by ID
- `resource1_create` - Create new resource
- `resource1_update` - Update existing resource
- `resource1_delete` - Delete resource

See `generated/mcp-tools.ts` for full list.
```

---

## 🚀 Build & Deploy

```bash
# Build
npm run build

# Test locally
npm run dev

# Deploy (example for npm)
npm publish
```

---

**This template provides a complete foundation for your GitBook-based MCP server!**
