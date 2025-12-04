# Example: Scraping Sentry Documentation

Complete workflow for scraping Sentry's GitBook documentation and building an MCP server.

---

## Step 1: Scrape Documentation

```bash
npm run scrape -- https://docs.sentry.io \
  --output ./output/sentry \
  --crawl-depth 5 \
  --zip
```

This will:
- Discover pages via GitBook API manifest
- Deep crawl sidebar navigation (5 levels)
- Scrape 200+ documentation pages
- Generate organized markdown files
- Create metadata.json with GitBook IDs
- Extract code examples
- Create compressed sentry.zip archive

**Output:**
```
output/sentry/
├── INDEX.md              # Navigation index
├── COMPLETE.md           # Single file with all docs (670KB+)
├── metadata.json         # Structured metadata
├── api/
│   ├── events.md
│   ├── projects.md
│   ├── organizations.md
│   └── ...
├── platforms/
│   ├── javascript.md
│   ├── python.md
│   └── ...
└── product/
    ├── alerts.md
    ├── performance.md
    └── ...
```

---

## Step 2: Extract Code Examples

```bash
npm run extract-examples -- ./output/sentry
```

**Result:**
```
output/sentry/examples/
├── INDEX.md
├── javascript-examples.md    # 45 examples
├── python-examples.md        # 38 examples
├── curl-examples.md          # 52 examples
└── json-examples.md          # 29 examples
```

---

## Step 3: Generate MCP Tools

```bash
npm run generate-mcp -- ./output/sentry
```

**Generated Tools:**
```json
[
  {
    "name": "api_create_event",
    "description": "Submit Error Events",
    "inputSchema": {
      "type": "object",
      "properties": {
        "project_id": {
          "type": "string",
          "description": "The ID of the project"
        },
        "event_data": {
          "type": "object",
          "description": "Event payload"
        }
      },
      "required": ["project_id", "event_data"]
    }
  },
  {
    "name": "api_list_projects",
    "description": "List Projects",
    "inputSchema": {
      "type": "object",
      "properties": {
        "organization_slug": {
          "type": "string",
          "description": "Organization identifier"
        }
      },
      "required": ["organization_slug"]
    }
  }
]
```

---

## Step 4: Build MCP Server

### 4.1 Use Generated Tools

```typescript
import { mcpTools } from './output/sentry/mcp-tools/mcp-tools.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: 'sentry-mcp-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Register all generated tools
for (const tool of mcpTools) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: mcpTools
  }));
}
```

### 4.2 Implement Tool Handlers

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'api_create_event':
      return await createEvent(args.project_id, args.event_data);
    
    case 'api_list_projects':
      return await listProjects(args.organization_slug);
    
    // ... more handlers
  }
});
```

### 4.3 API Implementation

```typescript
async function createEvent(projectId: string, eventData: any) {
  const response = await fetch(
    `https://sentry.io/api/0/projects/${projectId}/events/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENTRY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    }
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(await response.json(), null, 2),
      },
    ],
  };
}
```

---

## Step 5: Use with AI Agents

### Configure in Claude Desktop

```json
{
  "mcpServers": {
    "sentry": {
      "command": "node",
      "args": ["/path/to/sentry-mcp-server/build/index.js"],
      "env": {
        "SENTRY_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

### Example Prompts

```
"Show me all projects in my-org organization"
"Create a test error event in project my-project"
"Get performance data for the last 24 hours"
"List all issues with priority high"
```

---

## 📊 Scraping Statistics

**Sentry Documentation:**
- Total pages scraped: 234
- API endpoints: 52
- Code examples: 164
- Sections: 8
- Output size: ~2.1 MB
- Scraping time: ~3 minutes (conservative rate limits)

**Generated Artifacts:**
- MCP tools: 52
- TypeScript types: 156
- Code examples: 164 organized by language

---

## 🎯 Benefits

1. **Complete API Coverage** - All endpoints documented and ready to use
2. **Type Safety** - Generated TypeScript definitions
3. **Examples** - Real code examples from official docs
4. **Offline Access** - Full docs in markdown
5. **AI-Optimized** - COMPLETE.md perfect for agent context

---

## 🔧 Customization

### Custom Rate Limiting

```bash
# Sentry is a large site - use conservative settings
npm run scrape -- https://docs.sentry.io \
  --output ./output/sentry \
  --concurrent 1 \
  --delay 2500 \
  --crawl-depth 5 \
  --follow-links \
  --zip
```

### Version-Specific Scraping

```bash
# Scrape specific Sentry SDK version
npm run scrape -- https://docs.sentry.io/platforms/javascript/ \
  --output ./output/sentry-js \
  --version latest
```

---

## 📚 Next Steps

1. Review `output/sentry/INDEX.md` for navigation
2. Check `output/sentry/COMPLETE.md` for full content
3. Explore `output/sentry/mcp-tools.json` for tool definitions
4. Implement authentication handling
5. Add error handling and retries
6. Deploy MCP server

---

**Happy scraping!** 🚀
