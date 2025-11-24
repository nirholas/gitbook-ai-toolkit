# GitBook Scraper Output Formats

**Different users, different needs.** This scraper generates multiple output formats optimized for various use cases.

---

## 🎯 Use Case Matrix

| User Type | Primary Need | Best Output Format |
|-----------|-------------|-------------------|
| **AI Agents** | Full context, single file | `COMPLETE.md` |
| **MCP Servers** | Tool definitions, API schemas | `mcp-tools.json` |
| **Developers** | Searchable docs, code examples | `INDEX.md` + sections |
| **RAG Systems** | Chunked content, embeddings | `chunks/` (JSON) |
| **API Clients** | Endpoints, parameters, schemas | `api-spec.json` |
| **Data Scientists** | Structured data, analytics | `metadata.json` |
| **Documentation Sites** | Static site generation | `docusaurus/` |
| **LLM Fine-tuning** | Q&A pairs, conversations | `training-data.jsonl` |

---

## 📦 Current Outputs (v1.0)

### 1. **COMPLETE.md** - AI Agent Optimized
**For:** Claude, GPT, AI agents needing full context

**Format:**
```markdown
# Complete Documentation

> All pages in one file for easy context loading

## Section: Getting Started
### Page: Installation
Content here...

## Section: API Reference
### Page: Authentication
Content here...
```

**Use Cases:**
- Load entire docs into AI context
- Semantic search across all content
- Complete offline reference

---

### 2. **INDEX.md** - Human Navigation
**For:** Developers browsing documentation

**Format:**
```markdown
# Documentation Index

## Table of Contents

### API Reference
- [Authentication](api/authentication.md)
- [Endpoints](api/endpoints.md)

### Guides
- [Quick Start](guides/quick-start.md)
```

**Use Cases:**
- Browse documentation structure
- Find specific pages quickly
- Link to individual files

---

### 3. **metadata.json** - Structured Data
**For:** Analytics, dashboards, data processing

**Format:**
```json
{
  "baseUrl": "https://docs.example.com",
  "scrapedAt": "2025-11-24T...",
  "totalPages": 42,
  "sections": ["api", "guides"],
  "pages": [
    {
      "title": "Authentication",
      "url": "https://...",
      "section": "api",
      "hasApi": true,
      "codeExamplesCount": 5,
      "metadata": {
        "spaceId": "xxx",
        "pageId": "yyy"
      }
    }
  ]
}
```

**Use Cases:**
- Generate analytics dashboards
- Track documentation changes
- Build documentation graphs

---

### 4. **Individual Markdown Files** - Modular Content
**For:** Static site generators, version control

**Format:**
```
output/
├── api/
│   ├── authentication.md
│   └── endpoints.md
└── guides/
    └── quick-start.md
```

**Use Cases:**
- Import into Docusaurus/MkDocs
- Track changes with git
- Selective content loading

---

### 5. **mcp-tools.json** - MCP Tool Definitions
**For:** Building MCP servers

**Format:**
```json
[
  {
    "name": "api_create_resource",
    "description": "Create a new resource",
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": { "type": "string" }
      },
      "required": ["name"]
    }
  }
]
```

**Use Cases:**
- Auto-generate MCP servers
- API client generation
- Type-safe tool definitions

---

## 🚀 Proposed New Outputs (v2.0)

### 6. **chunks.json** - RAG Optimized
**For:** Vector databases, semantic search, embeddings

**Format:**
```json
[
  {
    "id": "auth_001",
    "section": "api",
    "title": "Authentication",
    "chunk": "Authentication uses OAuth 2.0...",
    "metadata": {
      "url": "https://...",
      "type": "concept",
      "keywords": ["auth", "oauth", "security"]
    },
    "embedding": null
  }
]
```

**Size:** 500-1000 tokens per chunk (optimal for embeddings)

**Use Cases:**
- Load into Pinecone/Weaviate
- Semantic search
- RAG applications

**Generation:**
```bash
npm run generate-chunks -- ./output/sentry --size 800
```

---

### 7. **api-spec.json** - OpenAPI Style
**For:** API client generators, Postman, testing

**Format:**
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Sentry API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/0/projects/{id}/": {
      "get": {
        "summary": "Retrieve Project",
        "parameters": [...],
        "responses": {...}
      }
    }
  }
}
```

**Use Cases:**
- Generate SDK clients
- Import to Postman
- API testing tools

**Generation:**
```bash
npm run generate-api-spec -- ./output/stripe
```

---

### 8. **training-data.jsonl** - LLM Training
**For:** Fine-tuning language models

**Format:**
```jsonl
{"prompt": "How do I authenticate?", "completion": "Authentication uses OAuth 2.0. First, obtain a client ID..."}
{"prompt": "What are rate limits?", "completion": "Rate limits are 100 requests per second..."}
```

**Use Cases:**
- Fine-tune GPT models
- Train domain-specific chatbots
- Q&A dataset creation

**Generation:**
```bash
npm run generate-training-data -- ./output/sentry --pairs 1000
```

---

### 9. **docusaurus/** - Static Site Ready
**For:** Publishing documentation sites

**Structure:**
```
docusaurus/
├── docs/
│   ├── intro.md
│   ├── api/
│   └── guides/
├── sidebars.js
└── docusaurus.config.js
```

**Use Cases:**
- Deploy to Netlify/Vercel
- Custom documentation site
- Offline documentation

**Generation:**
```bash
npm run generate-docusaurus -- ./output/stripe
```

---

### 10. **examples/** - Code Examples Library
**For:** Developers learning APIs

**Format:**
```
examples/
├── javascript/
│   ├── authentication.js
│   └── create-resource.js
├── python/
│   ├── authentication.py
│   └── create_resource.py
└── INDEX.md
```

**Use Cases:**
- Copy-paste examples
- IDE snippets
- Tutorial creation

**Already implemented!**
```bash
npm run extract-examples -- ./output/sentry
```

---

## 🎨 Custom Output Generators

### Priority Order (Based on User Demand)

1. ✅ **COMPLETE.md** - Implemented
2. ✅ **metadata.json** - Implemented
3. ✅ **mcp-tools.json** - Implemented
4. ✅ **Individual files** - Implemented
5. ✅ **examples/** - Implemented
6. 🔜 **chunks.json** - High priority (RAG use case)
7. 🔜 **api-spec.json** - Medium priority (API clients)
8. 🔜 **training-data.jsonl** - Medium priority (LLM training)
9. 🔜 **docusaurus/** - Low priority (manual setup easy)

---

## 💡 Implementation Plan

### Phase 1: RAG Optimization (chunks.json)
```typescript
class ChunkGenerator {
  async generateChunks(docsPath: string, chunkSize: number = 800) {
    // Split content into semantic chunks
    // Add metadata and keywords
    // Optimize for embeddings
    // Generate chunks.json
  }
}
```

### Phase 2: API Specification (api-spec.json)
```typescript
class ApiSpecGenerator {
  async generateOpenApiSpec(docsPath: string) {
    // Parse API endpoints from metadata
    // Extract parameters and responses
    // Generate OpenAPI 3.0 spec
  }
}
```

### Phase 3: Training Data (training-data.jsonl)
```typescript
class TrainingDataGenerator {
  async generateQAPairs(docsPath: string) {
    // Extract headings as questions
    // Use content as answers
    // Generate conversation pairs
  }
}
```

---

## 🔧 Usage Examples

### For AI Agents
```bash
# Get everything in one file
cat output/sentry/COMPLETE.md
```

### For MCP Servers
```bash
# Generate tools, then build server
npm run generate-mcp -- ./output/stripe
```

### For RAG Systems
```bash
# Generate embeddings-ready chunks
npm run generate-chunks -- ./output/sentry --size 800
```

### For API Clients
```bash
# Generate OpenAPI spec, then use with codegen
npm run generate-api-spec -- ./output/stripe
openapi-generator generate -i api-spec.json -g typescript-axios
```

### For LLM Training
```bash
# Generate Q&A pairs for fine-tuning
npm run generate-training-data -- ./output/sentry --pairs 1000
```

---

## 📊 Output Size Comparison

| Format | Size (Sentry) | Size (Stripe) | Use Case |
|--------|---------------|---------------|----------|
| COMPLETE.md | ~2.5 MB | ~4.2 MB | AI context |
| metadata.json | ~45 KB | ~78 KB | Analytics |
| mcp-tools.json | ~120 KB | ~215 KB | MCP servers |
| Individual files | ~2.8 MB | ~4.5 MB | Static sites |
| chunks.json | ~3.2 MB* | ~5.1 MB* | RAG (estimated) |
| api-spec.json | ~85 KB* | ~145 KB* | API clients (estimated) |
| training-data.jsonl | ~1.8 MB* | ~3.0 MB* | LLM training (estimated) |

*Estimated based on content analysis

---

## 🎯 Recommendation by Use Case

### Building an MCP Server
```bash
npm run scrape -- <url> --output ./docs
npm run generate-mcp -- ./docs
# Use mcp-tools.json + examples/
```

### RAG/Semantic Search
```bash
npm run scrape -- <url> --output ./docs
npm run generate-chunks -- ./docs --size 800
# Use chunks.json with vector DB
```

### API Client Library
```bash
npm run scrape -- <url> --output ./docs
npm run generate-api-spec -- ./docs
# Use api-spec.json with codegen
```

### AI Agent Context
```bash
npm run scrape -- <url> --output ./docs
# Use COMPLETE.md directly
```

### Documentation Website
```bash
npm run scrape -- <url> --output ./docs
npm run generate-docusaurus -- ./docs
cd docusaurus && npm run build
```

---

**Which output format should we prioritize next?**
