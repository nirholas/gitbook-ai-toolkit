# Creating Zip Archives

This guide shows how to use the `--zip` flag to automatically create compressed archives of scraped documentation.

---

## 🎯 Quick Start

### Basic Zip Creation

```bash
npm run scrape -- https://docs.example.com \
  --output ./docs \
  --zip
```

**What happens:**
1. Scrapes all documentation to `./docs/`
2. Creates `docs.zip` in the same parent directory
3. Displays archive size after creation

---

## 📦 Use Cases

### 1. Share Documentation with Team

```bash
# Scrape and zip in one command
npm run scrape -- https://docs.stripe.com \
  --output ./stripe-docs \
  --zip

# Result: stripe-docs.zip ready to share
# Send via email, Slack, or upload to cloud storage
```

### 2. Archive Multiple Documentation Versions

```bash
# Version 1
npm run scrape -- https://docs.api.com/v1 \
  --output ./api-v1 \
  --zip

# Version 2
npm run scrape -- https://docs.api.com/v2 \
  --output ./api-v2 \
  --zip

# Result: api-v1.zip and api-v2.zip for comparison
```

### 3. Offline Documentation Package

```bash
# Complete deep crawl with zip
npm run scrape -- https://docs.example.com \
  --output ./offline-docs \
  --crawl-depth 10 \
  --follow-links \
  --zip

# Result: Comprehensive offline documentation package
# Extract and use anywhere without internet
```

### 4. CI/CD Documentation Backups

```bash
#!/bin/bash
# backup-docs.sh - Daily documentation backup

DATE=$(date +%Y-%m-%d)
npm run scrape -- https://docs.yourcompany.com \
  --output ./docs-backup-$DATE \
  --zip

# Result: docs-backup-2025-12-04.zip
# Automated daily backups
```

---

## 🔧 Advanced Examples

### Complete Documentation Package with Zip

```bash
npm run scrape -- https://docs.sentry.io \
  --output ./sentry-complete \
  --crawl-depth 5 \
  --concurrent 2 \
  --delay 1500 \
  --zip
```

**Output:**
```
./sentry-complete/          # Documentation directory
  ├── COMPLETE.md
  ├── INDEX.md
  ├── metadata.json
  └── api/
      └── ...

./sentry-complete.zip       # Compressed archive (created automatically)
```

### Fast Scrape with Zip

```bash
npm run scrape -- https://docs.example.com \
  --output ./quick-docs \
  --no-follow-links \
  --crawl-depth 1 \
  --zip
```

**Use when:**
- Need quick documentation snapshot
- Limited time or bandwidth
- Only need top-level pages

---

## 📊 Compression Stats

Typical compression ratios for GitBook documentation:

| Content Type | Original Size | Compressed Size | Ratio |
|-------------|---------------|-----------------|-------|
| **Markdown files** | 10 MB | 2-3 MB | 70-80% |
| **JSON metadata** | 500 KB | 50-100 KB | 80-90% |
| **Complete package** | 15 MB | 3-5 MB | 65-75% |

**Example:**
```
Sentry docs (234 pages):
- Directory: 12.5 MB
- Zip archive: 3.2 MB
- Compression: 74%
```

---

## 🚀 Workflow Examples

### Developer Onboarding

```bash
# 1. Scrape company's internal docs
npm run scrape -- https://internal-docs.company.com \
  --output ./onboarding-docs \
  --zip

# 2. Share onboarding-docs.zip with new hires
# 3. They extract and have complete offline reference
```

### Documentation Analysis

```bash
# Scrape competitor documentation for research
npm run scrape -- https://competitor-docs.com \
  --output ./competitor-analysis \
  --crawl-depth 3 \
  --zip

# Result: Compressed archive for analysis
# Easy to store and compare multiple competitors
```

### AI Training Data Preparation

```bash
# Scrape multiple documentation sources
npm run scrape -- https://docs.react.dev --output ./react --zip
npm run scrape -- https://docs.vue.js --output ./vue --zip
npm run scrape -- https://angular.io/docs --output ./angular --zip

# Result: Multiple compressed packages
# Easy to organize and process for AI training
```

---

## 💡 Tips & Best Practices

### 1. Naming Convention

```bash
# Use descriptive output directory names
npm run scrape -- https://docs.stripe.com \
  --output ./stripe-api-2025-12-04 \
  --zip

# Result: stripe-api-2025-12-04.zip
# Easy to identify and organize
```

### 2. Automate Regular Backups

```bash
# cron job: daily at 2am
0 2 * * * cd /home/user/scraper && npm run scrape -- https://docs.example.com --output ./backup-$(date +\%Y-\%m-\%d) --zip
```

### 3. Storage Optimization

```bash
# For archival, use maximum crawl depth
npm run scrape -- https://docs.example.com \
  --output ./archive \
  --crawl-depth 10 \
  --zip

# Then remove uncompressed directory to save space
rm -rf ./archive
# Keep only archive.zip
```

### 4. Verify Archive Integrity

```bash
# After scraping with --zip
unzip -t docs.zip

# Output shows if archive is valid
# Archive:  docs.zip
#     testing: docs/                    OK
#     testing: docs/INDEX.md            OK
#     ...
```

---

## 🔍 Troubleshooting

### "zip command not found"

**Solution:** Install zip utility

```bash
# Ubuntu/Debian
sudo apt-get install zip

# macOS (usually pre-installed)
# If not: brew install zip

# Alpine Linux (Docker)
apk add zip
```

### Archive Too Large

**Solutions:**

1. **Exclude unnecessary files** (edit source if needed)
2. **Use selective crawling**
   ```bash
   npm run scrape -- https://docs.example.com \
     --output ./docs \
     --crawl-depth 2 \
     --no-follow-links \
     --zip
   ```

3. **Use external compression**
   ```bash
   # Scrape without --zip
   npm run scrape -- https://docs.example.com --output ./docs
   
   # Use higher compression
   tar -czf docs.tar.gz docs/
   ```

### Permission Denied

**Solution:** Check write permissions

```bash
# Make sure you have write access to parent directory
ls -la ./

# If needed, adjust permissions
chmod 755 ./
```

---

## 📝 Summary

**When to Use `--zip`:**
- ✅ Sharing documentation with others
- ✅ Creating backups
- ✅ Archiving documentation versions
- ✅ Preparing data for transfer/upload
- ✅ Saving storage space
- ✅ Offline documentation packages

**When NOT to Use `--zip`:**
- ❌ When you need to immediately browse files
- ❌ When doing development/testing (faster without)
- ❌ When git tracking the output (track source, not zip)

**Default Command (Recommended):**
```bash
npm run scrape -- https://docs.example.com \
  --output ./docs \
  --crawl-depth 3 \
  --zip
```

This provides a good balance of completeness, speed, and convenience with automatic archiving.

---

**Questions?** Open an issue or reach out!

Built with ❤️ by [nich](https://github.com/nirholas)
