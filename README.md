# 🔧 GitBook Documentation Scraper & MCP Development Tool

> **Professional scraping tool for GitBook sites** - Handles versioned documentation, API discovery, and dynamic content. Built specifically for GitBook's unique architecture.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Why GitBook Scraper?

**GitBook is Different:**
- ✅ JSON-based navigation (manifest.json, summary.json)
- ✅ API-driven content loading
- ✅ Version management and spaces
- ✅ Client-side rendering
- ✅ Different HTML structure than Mintlify

**This Tool Handles:**
1. ✅ Multiple discovery methods (GitBook Content API, API manifest, summary.json, sitemap, crawling)
2. ✅ GitBook-specific selectors (.markdown-section, .page-inner)
3. ✅ Metadata extraction (space ID, page ID, last modified)
4. ✅ Versioned documentation support
5. ✅ MCP tool generation
6. ✅ Code example extraction with filename support

> **Note:** While GitBook offers PDF export (`/~gitbook/pdf?page=...`), this scraper extracts structured markdown, code examples, and metadata - far more useful for AI agents and programmatic access than PDFs.

---

## 🚀 Quick Start

### Installation

```bash
cd tools/gitbook-scraper
npm install
```

### Basic Scraping

```bash
# Scrape Sentry docs
npm run scrape -- https://docs.sentry.io --output ./output/sentry

# Scrape Stripe docs
npm run scrape -- https://docs.stripe.com --output ./output/stripe

# Scrape Gitcoin docs
npm run scrape -- https://docs.gitcoin.co --output ./output/gitcoin
```

### Advanced Usage

```bash
# Conservative rate limiting for large sites
npm run scrape -- https://docs.sentry.io \
  --output ./output/sentry \
  --concurrent 2 \
  --delay 2000

# Use headless browser for JavaScript-heavy sites
npm run scrape -- https://docs.stripe.com \
  --output ./output/stripe \
  --use-browser

# Scrape specific version
npm run scrape -- https://docs.api.com \
  --output ./output/api-v2 \
  --version v2
```

---

## 📁 Output Structure

```
output/sentry/
├── COMPLETE.md                 # All docs in one file (AI-optimized!)
├── INDEX.md                    # Navigation index
├── metadata.json               # Structured metadata with GitBook IDs
├── mcp-tools.json             # Auto-generated MCP tools
├── examples/                   # Extracted code examples
│   ├── javascript-examples.md
│   ├── python-examples.md
│   ├── curl-examples.md
│   └── INDEX.md
└── api/                        # Individual API pages
    ├── events.md
    ├── projects.md
    └── ...
```

### Metadata Format

```json
{
  "baseUrl": "https://docs.sentry.io",
  "scrapedAt": "2025-11-24T...",
  "totalPages": 234,
  "sections": ["api", "platforms", "product"],
  "pages": [
    {
      "title": "Event Ingestion",
      "url": "https://docs.sentry.io/api/events/",
      "section": "api",
      "hasApi": true,
      "metadata": {
        "spaceId": "xxx",
        "pageId": "yyy",
        "lastModified": "2025-11-20T..."
      }
    }
  ]
}
```

---

## 🎯 Use Cases

### 1. **Build MCP Servers from GitBook APIs**

```bash
# 1. Scrape Sentry documentation
npm run scrape -- https://docs.sentry.io --output ./output/sentry

# 2. Generate MCP tools
npm run generate-mcp -- ./output/sentry

# 3. Review generated tools
cat ./output/sentry/mcp-tools/mcp-tools.json

# 4. Implement MCP server using the definitions
# (All API signatures, parameters, and examples are ready!)
```

### 2. **Extract Code Examples**

```bash
# Extract all code examples
npm run extract-examples -- ./output/sentry

# Filter by language
npm run extract-examples -- ./output/sentry --language python

# Output: organized by language in examples/
```

### 3. **Offline Documentation**

```bash
# Scrape complete docs for offline use
npm run scrape -- https://docs.stripe.com --output ./offline/stripe

# Use COMPLETE.md for full-text search
grep -i "webhook" ./offline/stripe/COMPLETE.md
```

### 4. **AI Agent Context**

```bash
# Load into AI context
cat output/sentry/COMPLETE.md

# Perfect for:
# - Asking questions about the API
# - Generating integration code
# - Understanding authentication flows
# - Building MCP tools
```

---

## 🔄 GitBook vs Mintlify Comparison

| Feature | GitBook | Mintlify |
|---------|---------|----------|
| **Navigation** | manifest.json, summary.json | sitemap.xml |
| **Content** | API-driven, client-side | Server-rendered |
| **Versioning** | Built-in spaces/versions | URL-based |
| **Metadata** | spaceId, pageId | Basic |
| **Rendering** | Dynamic (may need browser) | Static HTML |
| **Rate Limits** | More conservative needed | Standard |

**Key Differences:**
- GitBook uses slower rate limits (2 concurrent, 1500ms default)
- GitBook may require `--use-browser` for JavaScript-rendered content
- GitBook provides richer metadata (space IDs, page IDs, versioning)
- GitBook has different content selectors (`.markdown-section` vs `main`)

---

## 🌍 Supported GitBook Sites

### Developer Tools
- [Sentry](https://docs.sentry.io) - Error tracking
- [Stripe](https://docs.stripe.com) - Payment APIs
- [Gitcoin](https://docs.gitcoin.co) - Web3 grants
- [Linear](https://developers.linear.app) - Issue tracking
- [Zapier](https://docs.zapier.com) - Automation

### Web3 & Blockchain
- [Alchemy](https://docs.alchemy.com) - Web3 infrastructure
- [Infura](https://docs.infura.io) - Ethereum node
- [Moralis](https://docs.moralis.io) - Web3 APIs

### Infrastructure
- [Railway](https://docs.railway.app) - Deployment
- [Render](https://render.com/docs) - Cloud platform
- [Fly.io](https://fly.io/docs) - App hosting

*And hundreds more GitBook sites...*

---

## ⚙️ Configuration

### Rate Limiting

```bash
# Light rate limiting (small sites)
npm run scrape -- <url> --concurrent 3 --delay 1000

# Medium rate limiting (default)
npm run scrape -- <url> --concurrent 2 --delay 1500

# Heavy rate limiting (large sites, respectful)
npm run scrape -- <url> --concurrent 1 --delay 3000
```

### Browser Mode

```bash
# Use when JavaScript rendering is required
npm run scrape -- <url> --use-browser

# When to use:
# - Content doesn't load without JavaScript
# - Navigation is dynamically rendered
# - API calls are made client-side
```

---

## 📚 Generated MCP Tools

Example generated tool:

```json
{
  "name": "api_create_event",
  "description": "Create Event",
  "inputSchema": {
    "type": "object",
    "properties": {
      "project_id": {
        "type": "string",
        "description": "The ID of the project"
      },
      "event_type": {
        "type": "string",
        "description": "Type of event (error, transaction)"
      }
    },
    "required": ["project_id", "event_type"]
  }
}
```

---

## 🔧 Development

### Project Structure

```
tools/gitbook-scraper/
├── src/
│   ├── scraper.ts           # Main GitBook scraper
│   ├── mcp-generator.ts     # MCP tool generator
│   └── example-extractor.ts # Code example extractor
├── examples/
│   ├── sentry.md            # Sentry workflow
│   └── stripe.md            # Stripe workflow
├── templates/
│   ├── mcp-tool-rest-api.md
│   └── mcp-server-template.md
├── output/                   # Scraped docs go here
├── package.json
└── README.md
```

### Running Tests

```bash
# Test with Sentry docs
npm test

# Custom test
npm run scrape -- https://docs.your-gitbook.com --output ./test-output
```

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

1. **Puppeteer Integration** - Full browser-based scraping
2. **Version Detection** - Auto-detect and scrape all versions
3. **Authentication** - Support for private GitBook spaces
4. **Incremental Updates** - Only scrape changed pages
5. **PDF Export** - Generate PDF from scraped docs

---

## 📄 License

MIT © nirholas

---

## 🔗 Related Tools

- **[Mintlify Scraper](../mintlify-scraper/)** - For Mintlify documentation sites
- **Docusaurus Scraper** - Coming soon
- **ReadTheDocs Scraper** - Coming soon

---

## 🚨 Responsible Use

**Please respect the sites you scrape:**

- ✅ Use reasonable rate limits (default: 2 concurrent, 1500ms delay)
- ✅ Only scrape publicly accessible documentation
- ✅ Respect robots.txt
- ✅ Cache results to avoid re-scraping
- ✅ Use longer delays for large scraping jobs
- ❌ Don't scrape private or paywalled content
- ❌ Don't overload servers with aggressive scraping

**Example: Respectful large-scale scraping**

```bash
# Scrape 500+ pages with conservative settings
npm run scrape -- https://docs.large-site.com \
  --output ./output \
  --concurrent 1 \
  --delay 3000
```

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



This tool exists to make documentation more accessible for AI agents and developers. Use it responsibly!

---

**Questions?** Open an issue or reach out!

**Built with** ❤️ **by** [nich](https://github.com/nirholas) 👉 [nich on X](https://x.com/nichxbt) 
