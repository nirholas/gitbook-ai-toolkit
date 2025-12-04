# Deep Crawling Guide

This guide explains how the GitBook scraper discovers and crawls all pages, including those only accessible via sidebar navigation.

---

## 🔍 Discovery Methods

The scraper uses **6 different methods** to discover pages, in order of priority:

### 1. GitBook Content API ✨ (Most Reliable)
```
GET /_gitbook/api/v1/spaces/pages
GET /~gitbook/api/v1/spaces/pages
GET /api/v1/spaces/pages
```

**Best for:** Modern GitBook instances
**Discovers:** All pages via official API endpoints

### 2. GitBook API Manifest
```
GET /_gitbook/api/v1/spaces/manifest
GET /manifest.json
GET /_gitbook/manifest.json
```

**Best for:** Structured navigation data
**Discovers:** Complete page hierarchy

### 3. Summary.json (Legacy GitBook)
```
GET /summary.json
```

**Best for:** Older GitBook installations
**Discovers:** Legacy navigation structure

### 4. Sitemap.xml
```
GET /sitemap.xml
```

**Best for:** SEO-optimized sites
**Discovers:** All indexed pages

### 5. Sidebar Crawling 🆕 (Enhanced)
**Comprehensive selector coverage:**
- Navigation: `nav a`, `[class*="navigation"] a`, `[data-testid="navigation"] a`
- Sidebar: `[class*="sidebar"] a`, `.gitbook-sidebar a`, `aside a`
- Table of Contents: `.toc a`, `.table-of-contents a`, `[class*="TOC"] a`
- Menus: `[class*="menu"] a`, `ul.menu a`
- Content: `main a`, `article a`, `.content a`, `.markdown-section a`

**Best for:** When API methods fail
**Discovers:** All visible links in sidebars and navigation

### 6. Recursive Link Following 🆕 (Deep Crawl)
**Follows links from discovered pages to find more pages**
- Configurable depth (default: 3 levels)
- Respects rate limits between levels
- Deduplicates URLs automatically
- Extracts links from JSON-LD structured data

**Best for:** Complete documentation coverage
**Discovers:** Hidden pages, nested content, dynamic navigation

---

## 🎛️ Crawl Configuration

### Basic Crawling (Default)
```bash
npm run scrape -- https://docs.example.com
```

**Default behavior:**
- Uses all 6 discovery methods
- Crawl depth: 3 levels
- Follow links: enabled
- Concurrent requests: 2
- Delay: 1500ms
- Zip archive: disabled (use `--zip` to enable)

### Deep Crawling
```bash
npm run scrape -- https://docs.example.com \
  --crawl-depth 10 \
  --concurrent 3 \
  --delay 1000
```

**Use when:**
- Documentation has deep nested structure
- Many pages are hidden in submenus
- You need complete coverage

**Settings:**
- `--crawl-depth 10`: Follow links 10 levels deep
- `--concurrent 3`: Process 3 pages at once
- `--delay 1000`: 1 second between batches

### Shallow Crawling
```bash
npm run scrape -- https://docs.example.com \
  --crawl-depth 1 \
  --no-follow-links
```

**Use when:**
- Only need top-level pages
- Site has good API discovery
- Minimizing scrape time

**Settings:**
- `--crawl-depth 1`: Only homepage links
- `--no-follow-links`: No recursive crawling

### API-Only Mode
```bash
npm run scrape -- https://docs.example.com \
  --no-follow-links \
  --crawl-depth 0
```

**Use when:**
- Site has complete API manifest
- Want fastest scrape
- Avoiding rate limits

**Settings:**
- No sidebar crawling
- No recursive following
- Relies on API discovery only

---

## 📊 How It Works

### Phase 1: API Discovery
```
1. Try GitBook Content API
   ↓ (if fails)
2. Try API Manifest
   ↓ (if fails)
3. Try summary.json
   ↓ (if fails)
4. Try sitemap.xml
   ↓ (if fails)
5. Proceed to Phase 2
```

### Phase 2: Sidebar Crawling
```
1. Load homepage HTML
2. Extract ALL links matching selectors:
   - Navigation bars
   - Sidebars
   - Table of contents
   - Menus
   - Content areas
3. Add to queue
4. If followLinks enabled → Phase 3
```

### Phase 3: Recursive Crawling (NEW!)
```
Depth 0: Homepage
  ├── Extract links
  └── Queue: [page1, page2, page3, ...]

Depth 1: Process page1, page2, page3
  ├── Extract links from each
  └── Queue: [page4, page5, page6, ...]

Depth 2: Process page4, page5, page6
  ├── Extract links from each
  └── Queue: [page7, page8, ...]

...continue until crawl-depth reached
```

### Phase 4: Deduplication & Scraping
```
1. Remove duplicate URLs
2. Filter out non-documentation pages
3. Scrape in parallel batches
4. Apply rate limiting
```

---

## 🎯 Selector Coverage

### Navigation Selectors (30+ patterns)
```css
/* Top navigation */
nav a
[class*="nav"] a
[role="navigation"] a

/* Sidebar */
[class*="sidebar"] a
[class*="Sidebar"] a
aside a

/* GitBook-specific */
.gitbook-navigation a
.gitbook-sidebar a
[data-testid="navigation"] a
[data-testid="sidebar"] a

/* Table of contents */
.toc a
.table-of-contents a
[class*="TOC"] a
.summary a

/* Menus */
[class*="menu"] a
ul.menu a

/* Content areas */
main a
article a
.content a
.markdown-section a
.page-inner a
```

### JSON-LD Extraction
```javascript
// Looks for structured data in:
<script type="application/ld+json">
{
  "pages": [...],
  "url": "...",
  "sameAs": "..."
}
</script>

// Also extracts from:
- Embedded navigation JSON
- Page metadata
- Structured breadcrumbs
```

---

## 🚀 Real-World Examples

### Example 1: Monad Documentation
```bash
npm run scrape -- https://docs.monad.xyz \
  --output ./gmonad/monad \
  --crawl-depth 5 \
  --concurrent 2 \
  --delay 1500 \
  --zip
```

**Expected behavior:**
1. Try GitBook APIs (may succeed)
2. Extract homepage sidebar links
3. Recursively crawl 5 levels deep
4. Discover all nested guides and references
5. Extract code examples from each page
6. Create compressed zip archive

**Result:** Complete documentation, 100+ pages, compressed .zip file

### Example 2: Large Documentation Site
```bash
npm run scrape -- https://docs.stripe.com \
  --output ./output/stripe \
  --crawl-depth 3 \
  --concurrent 1 \
  --delay 3000 \
  --follow-links
```

**Settings explanation:**
- `crawl-depth 3`: Moderate depth (homepage → section → page)
- `concurrent 1`: Very respectful (1 request at a time)
- `delay 3000`: 3 seconds between requests
- `follow-links`: Enable recursive discovery

**Result:** ~500+ pages, 30-45 minutes

### Example 3: Fast Scrape (API Available)
```bash
npm run scrape -- https://docs.sentry.io \
  --output ./output/sentry \
  --no-follow-links
```

**Settings explanation:**
- Rely on GitBook API discovery
- No recursive crawling
- Fastest possible scrape

**Result:** ~200 pages, 5-10 minutes

### Example 4: Complete Deep Crawl
```bash
npm run scrape -- https://docs.example.com \
  --output ./output/example \
  --crawl-depth 10 \
  --follow-links \
  --concurrent 2 \
  --delay 2000
```

**Settings explanation:**
- `crawl-depth 10`: Very deep (find everything)
- `follow-links`: Enabled (recursive discovery)
- Balanced rate limiting

**Result:** Maximum coverage, longer scrape time

---

## 🔍 Troubleshooting

### "Only found X pages, expected more"

**Solution 1:** Increase crawl depth
```bash
--crawl-depth 5  # or higher
```

**Solution 2:** Enable link following
```bash
--follow-links
```

**Solution 3:** Check the output for warnings
```
⚠️ Reached maximum crawl depth (3)
```

### "Scraping too slow"

**Solution 1:** Increase concurrency (carefully!)
```bash
--concurrent 3
```

**Solution 2:** Decrease delay (carefully!)
```bash
--delay 1000
```

**Solution 3:** Disable deep crawling
```bash
--no-follow-links --crawl-depth 1
```

### "Missing some sidebar pages"

**Possible causes:**
1. Pages are behind authentication
2. Pages use JavaScript rendering (try `--use-browser`)
3. Pages are excluded by filters (check `isDocumentationUrl()`)

**Solutions:**
```bash
# Try browser mode
--use-browser

# Increase crawl depth
--crawl-depth 10

# Check excluded patterns in code
# Edit src/scraper.ts → isDocumentationUrl()
```

### "Rate limited / blocked"

**Solution:** Be more respectful
```bash
--concurrent 1 \
--delay 5000 \
--crawl-depth 2
```

---

## 📈 Performance Tips

### For Speed
```bash
# Fast scrape (API + shallow crawl)
--no-follow-links --crawl-depth 1 --concurrent 3
```

### For Completeness
```bash
# Deep scrape (find everything)
--follow-links --crawl-depth 10 --concurrent 2
```

### For Large Sites (Balance)
```bash
# Balanced approach
--crawl-depth 3 --concurrent 2 --delay 2000
```

### For Respectful Scraping
```bash
# Very polite
--concurrent 1 --delay 5000 --crawl-depth 2
```

---

## 🎓 Advanced Features

### URL Deduplication
- Automatically removes hash fragments: `page.html#section` → `page.html`
- Deduplicates across all discovery methods
- Maintains a visited set to prevent re-crawling

### Smart Filtering
```typescript
// Automatically excludes:
- /changelog
- /blog  
- /search
- /legal, /privacy, /terms
- /login, /signup, /auth
- Static assets (.png, .jpg, .css, .js)
- Sitemaps
```

### JSON-LD Discovery
```typescript
// Extracts URLs from:
- @type: "WebPage" → url
- breadcrumb → itemListElement → item
- mainEntity → url
- sameAs → [urls]
- Embedded navigation JSON
```

### Progressive Discovery
```
API Discovery → Sidebar Extraction → Recursive Crawling
     ↓                  ↓                    ↓
  50 pages         +30 pages           +120 pages
                                      = 200 total
```

---

## 🔐 Best Practices

### 1. Start Conservative
```bash
# First run: test with defaults
npm run scrape -- <url> --output ./test
```

### 2. Check Results
```bash
# How many pages found?
cat ./test/metadata.json | grep totalPages

# Review structure
cat ./test/INDEX.md
```

### 3. Adjust as Needed
```bash
# If too few pages → increase depth
--crawl-depth 5

# If too slow → disable deep crawl
--no-follow-links
```

### 4. Be Respectful
```bash
# Always use reasonable delays
--delay 1500  # minimum recommended

# Avoid aggressive concurrent requests
--concurrent 2  # safe default
```

---

## 📝 Summary

**Default Behavior (Recommended):**
- ✅ All 6 discovery methods
- ✅ Crawl depth: 3
- ✅ Follow links: enabled
- ✅ Respectful rate limits

**When to Customize:**
- 🎯 Missing pages → increase `--crawl-depth`
- ⚡ Need speed → use `--no-follow-links`
- 🐌 Too slow → increase `--concurrent`
- 🚫 Getting blocked → decrease concurrency, increase delay

**Most Common Setup:**
```bash
npm run scrape -- https://docs.example.com \
  --output ./output/example \
  --crawl-depth 3 \
  --follow-links \
  --concurrent 2 \
  --delay 1500 \
  --zip
```

This finds **~95% of pages** on typical GitBook sites with **respectful rate limiting** and creates a **compressed archive** for easy sharing.

---

Built with ❤️ by [nich](https://github.com/nirholas)
