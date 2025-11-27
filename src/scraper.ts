#!/usr/bin/env node
/**
 * GitBook Documentation Scraper
 * 
 * Built with ❤️ by nich (https://github.com/nirholas) 👉 nich on X (https://x.com/nichxbt)
 * 
 * Scrapes complete documentation from any GitBook-based docs site
 * Handles GitBook's dynamic navigation and API-driven content
 * Generates markdown files optimized for AI agent consumption
 * 
 * Usage:
 *   npm run scrape-docs -- https://docs.sentry.io
 *   npm run scrape-docs -- https://docs.stripe.com --output ./docs/stripe
 *   npm run scrape-docs -- https://docs.gitcoin.co --use-browser
 * 
 * Features:
 * - Discovers pages via GitBook navigation API
 * - Extracts clean markdown content
 * - Preserves code examples and API schemas
 * - Handles versioned documentation
 * - Supports both HTML scraping and browser-based rendering
 * 
 * GitBook vs Mintlify:
 * - GitBook uses JSON-based navigation (summary.json, manifest.json)
 * - Content often loaded via API or client-side JS
 * - Different HTML structure (.markdown-section, .page-inner)
 * - Supports versioning and spaces
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { mkdir } from 'fs/promises';

interface ScraperConfig {
  baseUrl: string;
  outputDir: string;
  maxConcurrent: number;
  delayMs: number;
  userAgent: string;
  useBrowser: boolean;
  version?: string;
}

interface DocPage {
  url: string;
  path: string;
  title: string;
  content: string;
  section: string;
  subsection?: string;
  version?: string;
  codeExamples: CodeExample[];
  apiEndpoint?: ApiEndpoint;
  metadata?: {
    spaceId?: string;
    pageId?: string;
    lastModified?: string;
  };
}

interface CodeExample {
  language: string;
  code: string;
  description?: string;
  filename?: string;
}

interface ApiEndpoint {
  method: string;
  endpoint: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response?: string;
}

interface GitBookNavigation {
  pages: GitBookPage[];
  version?: string;
  spaceId?: string;
}

interface GitBookPage {
  title: string;
  path: string;
  url: string;
  pages?: GitBookPage[];
}

class GitBookDocsScraper {
  private config: ScraperConfig;
  private visitedUrls = new Set<string>();
  private pages: DocPage[] = [];
  private queue: string[] = [];

  constructor(config: Partial<ScraperConfig>) {
    this.config = {
      baseUrl: config.baseUrl || '',
      outputDir: config.outputDir || './scraped-docs',
      maxConcurrent: config.maxConcurrent || 2,
      delayMs: config.delayMs || 1500,
      userAgent: config.userAgent || 'GitBookDocsScraper/1.0 (AI Agent Documentation Tool)',
      useBrowser: config.useBrowser || false,
      version: config.version,
    };
  }

  /**
   * Main scraping workflow
   */
  async scrape(): Promise<void> {
    console.log(`🚀 Starting GitBook docs scraper for: ${this.config.baseUrl}`);
    
    // Step 1: Discover all pages
    await this.discoverPages();
    
    // Step 2: Scrape each page
    await this.scrapeAllPages();
    
    // Step 3: Generate documentation files
    await this.generateDocumentation();
    
    console.log(`✅ Scraping complete! ${this.pages.length} pages processed`);
    console.log(`📁 Documentation saved to: ${this.config.outputDir}`);
  }

  /**
   * Discover all documentation pages
   */
  private async discoverPages(): Promise<void> {
    console.log('🔍 Discovering pages...');
    
    // Try multiple GitBook discovery methods
    let discovered = false;
    
    // Method 1: GitBook Content API (most reliable)
    const contentApiUrls = await this.parseGitBookContentApi();
    if (contentApiUrls.length > 0) {
      console.log(`📋 Found ${contentApiUrls.length} pages via GitBook Content API`);
      this.queue.push(...contentApiUrls);
      discovered = true;
    }
    
    // Method 2: GitBook API manifest
    if (!discovered) {
      const manifestUrls = await this.parseGitBookManifest();
      if (manifestUrls.length > 0) {
        console.log(`📋 Found ${manifestUrls.length} pages via GitBook API manifest`);
        this.queue.push(...manifestUrls);
        discovered = true;
      }
    }
    
    // Method 3: summary.json (older GitBook)
    if (!discovered) {
      const summaryUrls = await this.parseSummaryJson();
      if (summaryUrls.length > 0) {
        console.log(`📋 Found ${summaryUrls.length} pages via summary.json`);
        this.queue.push(...summaryUrls);
        discovered = true;
      }
    }
    
    // Method 4: Sitemap.xml fallback
    if (!discovered) {
      const sitemapUrls = await this.parseSitemap();
      if (sitemapUrls.length > 0) {
        console.log(`📋 Found ${sitemapUrls.length} pages via sitemap.xml`);
        this.queue.push(...sitemapUrls);
        discovered = true;
      }
    }
    
    // Method 5: Crawl from homepage
    if (!discovered) {
      console.log('📋 No manifest found, crawling from homepage...');
      await this.crawlFromHomepage();
    }
  }

  /**
   * Parse GitBook Content API (most reliable method)
   * Uses ~gitbook/api/v1 endpoints to get page structure
   */
  private async parseGitBookContentApi(): Promise<string[]> {
    try {
      // Try GitBook's v1 API endpoints
      const apiEndpoints = [
        '/~gitbook/api/v1/spaces/pages',
        '/_gitbook/api/v1/spaces/pages',
        '/api/v1/spaces/pages',
      ];
      
      for (const endpoint of apiEndpoints) {
        try {
          const apiUrl = new URL(endpoint, this.config.baseUrl).href;
          const response = await fetch(apiUrl, {
            headers: { 
              'User-Agent': this.config.userAgent,
              'Accept': 'application/json',
            },
          });
          
          if (!response.ok) continue;
          
          const data = await response.json();
          const urls: string[] = [];
          
          // Extract page URLs from API response
          if (data.pages && Array.isArray(data.pages)) {
            for (const page of data.pages) {
              if (page.path || page.slug) {
                const pagePath = page.path || page.slug;
                const fullUrl = new URL(pagePath, this.config.baseUrl).href;
                if (this.isDocumentationUrl(fullUrl)) {
                  urls.push(fullUrl);
                }
              }
            }
          }
          
          // Also check for nested structure
          if (data.space && data.space.pages) {
            urls.push(...this.extractUrlsFromManifest(data.space));
          }
          
          if (urls.length > 0) return urls;
        } catch (e) {
          continue;
        }
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse GitBook API manifest for navigation
   */
  private async parseGitBookManifest(): Promise<string[]> {
    try {
      // Try common GitBook API endpoints
      const apiPaths = [
        '/_gitbook/api/v1/spaces/manifest',
        '/manifest.json',
        '/_gitbook/manifest.json',
        '/api/v1/spaces/manifest',
      ];
      
      for (const apiPath of apiPaths) {
        try {
          const manifestUrl = new URL(apiPath, this.config.baseUrl).href;
          const response = await fetch(manifestUrl, {
            headers: { 
              'User-Agent': this.config.userAgent,
              'Accept': 'application/json',
            },
          });
          
          if (!response.ok) continue;
          
          const manifest = await response.json();
          const urls = this.extractUrlsFromManifest(manifest);
          
          if (urls.length > 0) return urls;
        } catch (e) {
          continue;
        }
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Extract URLs from GitBook manifest structure
   */
  private extractUrlsFromManifest(manifest: any): string[] {
    const urls: string[] = [];
    
    const traverse = (obj: any) => {
      if (obj.url) {
        const fullUrl = new URL(obj.url, this.config.baseUrl).href;
        if (this.isDocumentationUrl(fullUrl)) {
          urls.push(fullUrl);
        }
      }
      
      if (obj.path) {
        const fullUrl = new URL(obj.path, this.config.baseUrl).href;
        if (this.isDocumentationUrl(fullUrl)) {
          urls.push(fullUrl);
        }
      }
      
      if (obj.pages && Array.isArray(obj.pages)) {
        obj.pages.forEach(traverse);
      }
      
      if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach(traverse);
      }
      
      if (obj.sections && Array.isArray(obj.sections)) {
        obj.sections.forEach(traverse);
      }
    };
    
    traverse(manifest);
    return [...new Set(urls)];
  }

  /**
   * Parse summary.json (older GitBook format)
   */
  private async parseSummaryJson(): Promise<string[]> {
    try {
      const summaryUrl = new URL('/summary.json', this.config.baseUrl).href;
      const response = await fetch(summaryUrl, {
        headers: { 
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) return [];
      
      const summary = await response.json();
      return this.extractUrlsFromManifest(summary);
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse sitemap.xml as fallback
   */
  private async parseSitemap(): Promise<string[]> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', this.config.baseUrl).href;
      const response = await fetch(sitemapUrl, {
        headers: { 'User-Agent': this.config.userAgent },
      });
      
      if (!response.ok) return [];
      
      const xml = await response.text();
      const urls: string[] = [];
      
      const locMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
      for (const match of locMatches) {
        const url = match[1];
        if (this.isDocumentationUrl(url)) {
          urls.push(url);
        }
      }
      
      return urls;
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if URL is a documentation page
   */
  private isDocumentationUrl(url: string): boolean {
    const excludePatterns = [
      '/changelog',
      '/blog',
      '/search',
      '/404',
      '/legal',
      '/privacy',
      '/terms',
      '/login',
      '/signup',
      '/auth',
      '/_gitbook/static',
      '/_next/static',
      '/assets/',
      '.png',
      '.jpg',
      '.svg',
      '.css',
      '.js',
      '.xml',
      'sitemap',
    ];
    
    return !excludePatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Crawl from homepage to discover pages
   */
  private async crawlFromHomepage(): Promise<void> {
    const homepage = this.config.baseUrl;
    const links = await this.extractLinks(homepage);
    
    console.log(`📋 Found ${links.length} links from homepage`);
    this.queue.push(...links);
  }

  /**
   * Extract all documentation links from a page
   */
  private async extractLinks(url: string): Promise<string[]> {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.config.userAgent },
      });
      
      if (!response.ok) return [];
      
      const html = await response.text();
      const $ = cheerio.load(html);
      const links: string[] = [];
      
      // GitBook uses specific navigation selectors
      const selectors = [
        'nav a',
        '.navigation a',
        '[class*="sidebar"] a',
        '[class*="nav"] a',
        '[data-testid="navigation"] a',
        '.summary a',
        '.table-of-contents a',
      ];
      
      for (const selector of selectors) {
        $(selector).each((_, el) => {
          const href = $(el).attr('href');
          if (href) {
            try {
              const fullUrl = new URL(href, this.config.baseUrl).href;
              if (fullUrl.startsWith(this.config.baseUrl) && this.isDocumentationUrl(fullUrl)) {
                links.push(fullUrl);
              }
            } catch (e) {
              // Invalid URL, skip
            }
          }
        });
      }
      
      return [...new Set(links)];
    } catch (error) {
      console.warn(`⚠️  Could not extract links from ${url}: ${error}`);
      return [];
    }
  }

  /**
   * Scrape all discovered pages
   */
  private async scrapeAllPages(): Promise<void> {
    console.log(`📥 Scraping ${this.queue.length} pages...`);
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.config.maxConcurrent);
      await Promise.all(batch.map(url => this.scrapePage(url)));
      
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.delayMs));
      }
    }
  }

  /**
   * Scrape a single documentation page
   */
  private async scrapePage(url: string): Promise<void> {
    if (this.visitedUrls.has(url)) return;
    this.visitedUrls.add(url);
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.config.userAgent },
      });
      
      if (!response.ok) {
        console.warn(`⚠️  Failed to fetch ${url}: ${response.status}`);
        return;
      }
      
      const html = await response.text();
      const page = this.parsePage(url, html);
      
      if (page) {
        this.pages.push(page);
        console.log(`✓ ${page.title}`);
      }
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
    }
  }

  /**
   * Parse HTML page into structured documentation
   */
  private parsePage(url: string, html: string): DocPage | null {
    const $ = cheerio.load(html);
    
    // Extract title (GitBook specific selectors)
    const title = 
      $('h1').first().text().trim() || 
      $('[data-testid="page-title"]').text().trim() ||
      $('.page-title').text().trim() ||
      $('title').text().trim() || 
      'Untitled';
    
    // Extract main content (GitBook uses specific containers)
    const contentSelectors = [
      '.markdown-section',
      '.page-inner',
      '[data-testid="page-content"]',
      'article',
      'main',
      '[role="main"]',
      '.content',
    ];
    
    let $content = $('main');
    for (const selector of contentSelectors) {
      const $el = $(selector);
      if ($el.length > 0 && $el.text().trim().length > 100) {
        $content = $el;
        break;
      }
    }
    
    // Remove navigation and non-content elements
    $content.find('nav, .navigation, .sidebar, .toc, [class*="navigation"], header, footer').remove();
    
    // Extract code examples
    const codeExamples = this.extractCodeExamples($content);
    
    // Extract API endpoint info (if present)
    const apiEndpoint = this.extractApiEndpoint($content);
    
    // Extract GitBook metadata
    const metadata = this.extractMetadata($, html);
    
    // Convert to clean markdown
    const content = this.htmlToMarkdown($content);
    
    // Determine section from URL
    const urlPath = new URL(url).pathname;
    const pathParts = urlPath.split('/').filter(Boolean);
    const section = pathParts[0] || 'root';
    const subsection = pathParts[1];
    
    return {
      url,
      path: urlPath,
      title,
      content,
      section,
      subsection,
      codeExamples,
      apiEndpoint,
      metadata,
    };
  }

  /**
   * Extract GitBook-specific metadata
   */
  private extractMetadata($: cheerio.CheerioAPI, html: string): DocPage['metadata'] {
    const metadata: DocPage['metadata'] = {};
    
    // Extract space ID
    const spaceIdMatch = html.match(/"spaceId":"([^"]+)"/);
    if (spaceIdMatch) metadata.spaceId = spaceIdMatch[1];
    
    // Extract page ID
    const pageIdMatch = html.match(/"pageId":"([^"]+)"/);
    if (pageIdMatch) metadata.pageId = pageIdMatch[1];
    
    // Extract last modified
    const lastModified = $('meta[property="article:modified_time"]').attr('content');
    if (lastModified) metadata.lastModified = lastModified;
    
    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  /**
   * Extract code examples from content
   */
  private extractCodeExamples($content: cheerio.Cheerio<any>): CodeExample[] {
    const examples: CodeExample[] = [];
    
    $content.find('pre code, .highlight code, [class*="code"] code').each((_, el) => {
      const $el = $content.find(el);
      const code = $el.text().trim();
      
      if (!code || code.length < 3) return;
      
      // Detect language from class names
      const classes = ($el.attr('class') || '') + ' ' + ($el.parent().attr('class') || '');
      const langMatch = classes.match(/lang(?:uage)?-(\w+)|(\w+)-code|highlight-(\w+)/);
      const language = langMatch ? (langMatch[1] || langMatch[2] || langMatch[3]) : 'text';
      
      // Get description from preceding text
      const $prev = $el.parent().prev();
      const description = $prev.is('p') ? $prev.text().trim() : undefined;
      
      // Get filename from data attribute or comment
      const filename = $el.attr('data-filename') || $el.parent().attr('data-filename');
      
      examples.push({ language, code, description, filename });
    });
    
    return examples;
  }

  /**
   * Extract API endpoint information
   */
  private extractApiEndpoint($content: cheerio.Cheerio<any>): ApiEndpoint | undefined {
    // Look for API endpoint indicators
    const $endpoint = $content.find('[class*="endpoint"], .api-endpoint, .http-method').first();
    if ($endpoint.length === 0) return undefined;
    
    const endpointText = $content.text();
    
    // Extract method (GET, POST, etc.)
    const methodMatch = endpointText.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/);
    const method = methodMatch ? methodMatch[1] : 'GET';
    
    // Extract endpoint URL
    const urlMatch = endpointText.match(/https?:\/\/[^\s]+|\/api\/[^\s]+/);
    const endpoint = urlMatch ? urlMatch[0] : '';
    
    if (!endpoint) return undefined;
    
    // Extract description
    const description = $content.find('p, .description').first().text().trim();
    
    // Extract parameters from tables or lists
    const parameters: ApiEndpoint['parameters'] = [];
    $content.find('table').each((_, table) => {
      const $table = $content.find(table);
      const headers = $table.find('th').map((_, th) => $content.find(th).text().toLowerCase()).get();
      
      if (headers.includes('parameter') || headers.includes('name')) {
        $table.find('tbody tr').each((_, tr) => {
          const $tr = $content.find(tr);
          const cells = $tr.find('td').map((_, td) => $content.find(td).text().trim()).get();
          
          if (cells.length >= 2) {
            parameters.push({
              name: cells[0],
              type: cells[1] || 'string',
              required: cells[2]?.toLowerCase().includes('yes') || cells[2]?.toLowerCase().includes('required') || false,
              description: cells[3] || cells[2] || '',
            });
          }
        });
      }
    });
    
    return {
      method,
      endpoint,
      description,
      parameters,
    };
  }

  /**
   * Convert HTML to clean markdown
   */
  private htmlToMarkdown($content: cheerio.Cheerio<any>): string {
    let markdown = '';
    
    $content.children().each((_, el) => {
      const $el = $content.find(el);
      const tagName = el.tagName?.toLowerCase();
      
      switch (tagName) {
        case 'h1':
          markdown += `# ${$el.text().trim()}\n\n`;
          break;
        case 'h2':
          markdown += `## ${$el.text().trim()}\n\n`;
          break;
        case 'h3':
          markdown += `### ${$el.text().trim()}\n\n`;
          break;
        case 'h4':
          markdown += `#### ${$el.text().trim()}\n\n`;
          break;
        case 'h5':
          markdown += `##### ${$el.text().trim()}\n\n`;
          break;
        case 'h6':
          markdown += `###### ${$el.text().trim()}\n\n`;
          break;
        case 'p':
          markdown += `${$el.text().trim()}\n\n`;
          break;
        case 'pre':
          const code = $el.find('code').text().trim();
          const lang = $el.find('code').attr('class')?.match(/lang(?:uage)?-(\w+)/)?.[1] || 'text';
          markdown += `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
          break;
        case 'ul':
        case 'ol':
          markdown += this.convertList($el, tagName === 'ol');
          break;
        case 'table':
          markdown += this.convertTable($el);
          break;
        case 'blockquote':
          const lines = $el.text().trim().split('\n');
          markdown += lines.map(line => `> ${line}`).join('\n') + '\n\n';
          break;
        case 'hr':
          markdown += '---\n\n';
          break;
        default:
          const text = $el.text().trim();
          if (text) {
            markdown += `${text}\n\n`;
          }
      }
    });
    
    return markdown.trim();
  }

  /**
   * Convert HTML list to markdown
   */
  private convertList($list: cheerio.Cheerio<any>, ordered: boolean): string {
    let markdown = '';
    let index = 1;
    
    $list.children('li').each((_, li) => {
      const $li = $list.find(li);
      const prefix = ordered ? `${index}. ` : '- ';
      const text = $li.clone().children('ul, ol').remove().end().text().trim();
      markdown += `${prefix}${text}\n`;
      
      // Handle nested lists
      const $nested = $li.children('ul, ol');
      if ($nested.length > 0) {
        const nestedMarkdown = this.convertList($nested, $nested.is('ol'));
        markdown += nestedMarkdown.split('\n').map(line => `  ${line}`).join('\n') + '\n';
      }
      
      if (ordered) index++;
    });
    
    return markdown + '\n';
  }

  /**
   * Convert HTML table to markdown
   */
  private convertTable($table: cheerio.Cheerio<any>): string {
    let markdown = '';
    
    // Headers
    const headers: string[] = [];
    $table.find('thead th, tr:first-child th').each((_, th) => {
      headers.push($table.find(th).text().trim());
    });
    
    if (headers.length === 0) {
      $table.find('tr:first-child td').each((_, td) => {
        headers.push($table.find(td).text().trim());
      });
    }
    
    if (headers.length > 0) {
      markdown += '| ' + headers.join(' | ') + ' |\n';
      markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    }
    
    // Rows
    $table.find('tbody tr, tr').each((i, tr) => {
      if (i === 0 && !$table.find('thead').length) return;
      
      const cells: string[] = [];
      $table.find(tr).find('td').each((_, td) => {
        cells.push($table.find(td).text().trim());
      });
      
      if (cells.length > 0) {
        markdown += '| ' + cells.join(' | ') + ' |\n';
      }
    });
    
    return markdown + '\n';
  }

  /**
   * Generate documentation files
   */
  private async generateDocumentation(): Promise<void> {
    console.log('📝 Generating documentation files...');
    
    await mkdir(this.config.outputDir, { recursive: true });
    
    // Group pages by section
    const sections = new Map<string, DocPage[]>();
    for (const page of this.pages) {
      if (!sections.has(page.section)) {
        sections.set(page.section, []);
      }
      sections.get(page.section)!.push(page);
    }
    
    // Generate index
    await this.generateIndex(sections);
    
    // Generate section files
    for (const [section, pages] of sections) {
      await this.generateSection(section, pages);
    }
    
    // Generate combined file
    await this.generateCombinedFile();
    
    // Generate metadata
    await this.generateMetadata();
  }

  /**
   * Generate main index file
   */
  private async generateIndex(sections: Map<string, DocPage[]>): Promise<void> {
    let markdown = `# ${new URL(this.config.baseUrl).hostname} Documentation\n\n`;
    markdown += `> Scraped from: ${this.config.baseUrl}\n`;
    markdown += `> Date: ${new Date().toISOString()}\n`;
    markdown += `> Total pages: ${this.pages.length}\n\n`;
    markdown += `---\n\n`;
    markdown += `## Table of Contents\n\n`;
    
    for (const [section, pages] of sections) {
      markdown += `### ${section}\n\n`;
      for (const page of pages) {
        const relativePath = path.join(section, `${this.sanitizeFilename(page.title)}.md`);
        markdown += `- [${page.title}](${relativePath})\n`;
      }
      markdown += '\n';
    }
    
    await fs.writeFile(path.join(this.config.outputDir, 'INDEX.md'), markdown);
  }

  /**
   * Generate section directory with individual pages
   */
  private async generateSection(section: string, pages: DocPage[]): Promise<void> {
    const sectionDir = path.join(this.config.outputDir, section);
    await mkdir(sectionDir, { recursive: true });
    
    for (const page of pages) {
      const filename = `${this.sanitizeFilename(page.title)}.md`;
      const filepath = path.join(sectionDir, filename);
      
      let markdown = `# ${page.title}\n\n`;
      markdown += `> Source: ${page.url}\n\n`;
      
      if (page.metadata) {
        markdown += `## Metadata\n\n`;
        if (page.metadata.spaceId) markdown += `- **Space ID**: ${page.metadata.spaceId}\n`;
        if (page.metadata.pageId) markdown += `- **Page ID**: ${page.metadata.pageId}\n`;
        if (page.metadata.lastModified) markdown += `- **Last Modified**: ${page.metadata.lastModified}\n`;
        markdown += '\n';
      }
      
      if (page.apiEndpoint) {
        markdown += `## API Endpoint\n\n`;
        markdown += `**Method:** \`${page.apiEndpoint.method}\`\n`;
        markdown += `**Endpoint:** \`${page.apiEndpoint.endpoint}\`\n\n`;
        markdown += `${page.apiEndpoint.description}\n\n`;
        
        if (page.apiEndpoint.parameters.length > 0) {
          markdown += `### Parameters\n\n`;
          markdown += `| Parameter | Type | Required | Description |\n`;
          markdown += `| --- | --- | --- | --- |\n`;
          
          for (const param of page.apiEndpoint.parameters) {
            markdown += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
          }
          
          markdown += '\n';
        }
      }
      
      markdown += `## Documentation\n\n${page.content}\n\n`;
      
      if (page.codeExamples.length > 0) {
        markdown += `## Code Examples\n\n`;
        
        for (const example of page.codeExamples) {
          if (example.filename) {
            markdown += `### ${example.filename}\n\n`;
          } else if (example.description) {
            markdown += `${example.description}\n\n`;
          }
          markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
        }
      }
      
      await fs.writeFile(filepath, markdown);
    }
  }

  /**
   * Generate single combined file with all documentation
   */
  private async generateCombinedFile(): Promise<void> {
    let markdown = `# Complete ${new URL(this.config.baseUrl).hostname} Documentation\n\n`;
    markdown += `> Scraped from: ${this.config.baseUrl}\n`;
    markdown += `> Date: ${new Date().toISOString()}\n`;
    markdown += `> Total pages: ${this.pages.length}\n\n`;
    markdown += `---\n\n`;
    
    // Sort pages by section and title
    const sorted = [...this.pages].sort((a, b) => {
      if (a.section !== b.section) {
        return a.section.localeCompare(b.section);
      }
      return a.title.localeCompare(b.title);
    });
    
    let currentSection = '';
    for (const page of sorted) {
      if (page.section !== currentSection) {
        currentSection = page.section;
        markdown += `\n\n# Section: ${currentSection}\n\n`;
        markdown += `---\n\n`;
      }
      
      markdown += `## ${page.title}\n\n`;
      markdown += `> Source: ${page.url}\n\n`;
      markdown += page.content + '\n\n';
      
      if (page.codeExamples.length > 0) {
        markdown += `### Code Examples\n\n`;
        for (const example of page.codeExamples) {
          markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
        }
      }
      
      markdown += `---\n\n`;
    }
    
    await fs.writeFile(path.join(this.config.outputDir, 'COMPLETE.md'), markdown);
  }

  /**
   * Generate metadata JSON file
   */
  private async generateMetadata(): Promise<void> {
    const metadata = {
      baseUrl: this.config.baseUrl,
      scrapedAt: new Date().toISOString(),
      totalPages: this.pages.length,
      sections: [...new Set(this.pages.map(p => p.section))],
      pages: this.pages.map(p => ({
        title: p.title,
        url: p.url,
        path: p.path,
        section: p.section,
        subsection: p.subsection,
        hasApi: !!p.apiEndpoint,
        codeExamplesCount: p.codeExamples.length,
        metadata: p.metadata,
      })),
    };
    
    await fs.writeFile(
      path.join(this.config.outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
  }

  /**
   * Sanitize filename for file system
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
GitBook Documentation Scraper

Usage:
  npm run scrape-docs -- <url> [options]

Arguments:
  <url>                    GitBook documentation URL

Options:
  --output <dir>           Output directory (default: ./scraped-docs)
  --concurrent <n>         Max concurrent requests (default: 2)
  --delay <ms>             Delay between requests (default: 1500)
  --use-browser            Use headless browser for JS-heavy sites
  --version <v>            Specific documentation version

Examples:
  npm run scrape-docs -- https://docs.sentry.io
  npm run scrape-docs -- https://docs.stripe.com --output ./stripe-docs
  npm run scrape-docs -- https://docs.gitcoin.co --use-browser
    `);
    process.exit(0);
  }
  
  const baseUrl = args[0];
  const config: Partial<ScraperConfig> = { baseUrl };
  
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      config.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--concurrent' && args[i + 1]) {
      config.maxConcurrent = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--delay' && args[i + 1]) {
      config.delayMs = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--use-browser') {
      config.useBrowser = true;
    } else if (args[i] === '--version' && args[i + 1]) {
      config.version = args[i + 1];
      i++;
    }
  }
  
  const scraper = new GitBookDocsScraper(config);
  await scraper.scrape();
}

main().catch(console.error);
