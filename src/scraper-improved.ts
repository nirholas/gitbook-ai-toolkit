#!/usr/bin/env node
/**
 * Improved GitBook Documentation Scraper v2
 * 
 * Specifically optimized for modern GitBook v5+ sites
 * Addresses issues with incomplete page discovery and poor markdown conversion
 * 
 * Features:
 * - Better modern GitBook API detection
 * - Improved HTML to Markdown conversion preserving formatting
 * - Handles dynamic content loading
 * - Better link discovery from navigation
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { mkdir } from 'fs/promises';

interface PageContent {
  url: string;
  title: string;
  markdown: string;
  section: string;
  depth: number;
  meta?: {
    description?: string;
    keywords?: string[];
    lastModified?: string | null;
  };
}

type ScraperOptions = {
  outputDir?: string;
  maxDepth?: number;
  delayMs?: number;
  maxConcurrent?: number;
  includeSource?: boolean;
  downloadImages?: boolean;
  imageDir?: string;
  excludeSelectors?: string[];
  excludeTextPatterns?: string[];
  sectionDepth?: number;
  retryCount?: number;
  retryDelayMs?: number;
  incremental?: boolean;
  rewriteLinks?: boolean;
  excludeExternalImages?: boolean;
};

class ImprovedGitBookScraper {
  private baseUrl: string;
  private outputDir: string;
  private visited = new Set<string>();
  private queue: { url: string; depth: number }[] = [];
  private pages: PageContent[] = [];
  private maxDepth: number;
  private delayMs: number;
  private maxConcurrent: number;
  private includeSource: boolean;
  private downloadImages: boolean;
  private imageDir: string;
  private excludeSelectors: string[];
  private excludeTextPatterns: RegExp[];
  private sectionDepth: number;
  private retryCount: number;
  private retryDelayMs: number;
  private incremental: boolean;
  private rewriteLinks: boolean;
  private excludeExternalImages: boolean;
  private urlToLocalPath = new Map<string, string>();
  private imageMap = new Map<string, string>();
  private imageDownloads: Promise<void>[] = [];

  constructor(baseUrl: string, options: ScraperOptions = {}) {
    this.baseUrl = baseUrl;
    this.outputDir = options.outputDir || './scraped-docs';
    this.maxDepth = options.maxDepth || 5;
    this.delayMs = options.delayMs || 1500;
    this.maxConcurrent = options.maxConcurrent || 2;
    this.includeSource = options.includeSource || false;
    this.downloadImages = options.downloadImages || false;
    this.imageDir = options.imageDir || 'assets';
    this.sectionDepth = options.sectionDepth || 1;
    this.retryCount = options.retryCount ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 1500;
    this.incremental = options.incremental || false;
    this.rewriteLinks = options.rewriteLinks !== false;
    this.excludeExternalImages = options.excludeExternalImages || false;

    const defaultSelectors = [
      'nav',
      'footer',
      '.sidebar',
      '.navigation',
      '.toc',
      'aside',
      'script',
      'style',
      'iframe',
      '.cookie',
      '[id*="cookie" i]',
      '[class*="cookie" i]',
      '[class*="banner" i]',
      '[class*="feedback" i]',
      '[class*="newsletter" i]',
      '[class*="announcement" i]',
      '[class*="ads" i]'
    ];
    this.excludeSelectors = Array.from(new Set([...(options.excludeSelectors || []), ...defaultSelectors]));

    const defaultTextPatterns = [
      /last updated .+/gi,
      /was this helpful\??/gi,
      /cookie settings?/gi,
      /accept (all )?cookies/gi,
      /powered by gitbook/gi
    ];
    this.excludeTextPatterns = [...defaultTextPatterns, ...(options.excludeTextPatterns || []).map(p => new RegExp(p, 'gi'))];
  }

  /**
   * Main scraping entry point
   */
  async scrape(): Promise<void> {
    console.log(`🚀 Starting improved GitBook scraper for: ${this.baseUrl}`);
    
    // Discover pages
    await this.discoverPages();
    
    console.log(`📄 Found ${this.queue.length} pages to scrape`);
    
    // Scrape pages
    await this.scrapePages();
    
    // Generate output
    await this.generateOutput();
    
    console.log(`✅ Complete! Scraped ${this.pages.length} pages`);
    console.log(`📁 Output: ${this.outputDir}`);
  }

  /**
   * Discover all documentation pages
   */
  private async discoverPages(): Promise<void> {
    console.log('🔍 Discovering pages...');
    
    this.queue.push({ url: this.baseUrl, depth: 0 });
    
    // Use breadth-first search to discover all pages
    while (this.queue.length > 0 && this.queue[0].depth <= this.maxDepth) {
      const batch = this.queue.splice(0, this.maxConcurrent);
      
      await Promise.all(batch.map(({ url, depth }) => 
        this.discoverFromPage(url, depth)
      ));
      
      if (this.queue.length > 0) {
        await this.delay(this.delayMs);
      }
    }
  }

  /**
   * Extract links from a single page
   */
  private async discoverFromPage(url: string, depth: number): Promise<void> {
    const normalizedUrl = this.normalizeUrl(url);
    if (this.visited.has(normalizedUrl)) return;
    this.visited.add(normalizedUrl);
    
    try {
      const response = await this.fetchWithRetry(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract all links from the page
      const links = new Set<string>();
      
      // Look for navigation links (sidebar)
      $('nav a, aside a, [role="navigation"] a').each((_: number, el: any) => {
        const href = $(el).attr('href');
        if (href) {
          const fullUrl = this.resolveUrl(href);
          if (this.isValidDocUrl(fullUrl)) {
            links.add(this.normalizeUrl(fullUrl));
          }
        }
      });
      
      // Look for content links
      $('main a, article a, .content a, [role="main"] a').each((_: number, el: any) => {
        const href = $(el).attr('href');
        if (href && !href.includes('#') && !href.startsWith('http')) {
          const fullUrl = this.resolveUrl(href);
          if (this.isValidDocUrl(fullUrl)) {
            links.add(this.normalizeUrl(fullUrl));
          }
        }
      });
      
      // Add discovered links to queue
      for (const link of links) {
        if (!this.visited.has(link)) {
          this.queue.push({ url: link, depth: depth + 1 });
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error discovering pages from ${url}: ${error}`);
    }
  }

  /**
   * Scrape all discovered pages
   */
  private async scrapePages(): Promise<void> {
    console.log(`📥 Scraping ${this.visited.size} pages...`);
    
    const urlsToScrape = Array.from(this.visited);
    
    for (let i = 0; i < urlsToScrape.length; i += this.maxConcurrent) {
      const batch = urlsToScrape.slice(i, i + this.maxConcurrent);
      
      await Promise.all(batch.map(url => this.scrapePage(url)));
      
      console.log(`✓ Scraped ${Math.min(i + this.maxConcurrent, urlsToScrape.length)}/${urlsToScrape.length}`);
      
      if (i + this.maxConcurrent < urlsToScrape.length) {
        await this.delay(this.delayMs);
      }
    }
  }

  /**
   * Scrape a single page
   */
  private async scrapePage(url: string): Promise<void> {
    try {
      const response = await this.fetchWithRetry(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract title
      let title = $('h1').first().text().trim() ||
                 $('meta[property="og:title"]').attr('content') ||
                 $('title').text() ||
                 'Untitled';
      
      // Clean up title
      title = title.replace(/\|.*$/, '').trim();
      
      // Extract content from main content area
      let $content = $('main, article, [role="main"]').first();
      
      if ($content.length === 0) {
        $content = $('.content, .page-content, [class*="content"]').first();
      }
      
      if ($content.length === 0) {
        return; // No content found
      }

      // Remove navigation/boilerplate via selectors
      this.excludeSelectors.forEach(selector => {
        $content.find(selector).remove();
      });
      
      // Convert to markdown
      const markdown = this.htmlToMarkdown($, $content, url);
      
      // Determine section from URL
      const section = this.computeSection(url);

      const meta = {
        description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'),
        keywords: ($('meta[name="keywords"]').attr('content') || '').split(',').map(s => s.trim()).filter(Boolean),
        lastModified: response.headers.get('last-modified')
      };
      
      if (markdown.trim().length > 0) {
        this.pages.push({
          url,
          title,
          markdown,
          section,
          depth: 0,
          meta
        });
      }
    } catch (error) {
      console.warn(`⚠️  Error scraping ${url}: ${error}`);
    }
  }

  /**
   * Convert HTML to clean Markdown
   */
  private htmlToMarkdown($: cheerio.CheerioAPI, $content: cheerio.Cheerio<any>, pageUrl: string): string {
    let markdown = '';
    const processNode = (element: any): string => {
      const $el = $(element);
      const tagName = element.name?.toLowerCase();
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const level = parseInt(tagName[1]);
          const headText = $el.text().trim();
          return headText ? `${'#'.repeat(level)} ${headText}\n\n` : '';
          
        case 'p':
          const pText = this.extractTextWithFormatting($, $el);
          return pText ? `${pText}\n\n` : '';
          
        case 'ul':
        case 'ol':
          return this.convertList($, $el, tagName === 'ol');
          
        case 'li':
          return '';  // Handled by convertList
          
        case 'table':
          return this.convertTable($, $el);
          
        case 'pre':
        case 'code':
          return this.extractCode($, $el);
          
        case 'blockquote':
          const quoteText = $el.text().trim();
          return quoteText ? quoteText.split('\n').map(line => `> ${line.trim()}`).join('\n') + '\n\n' : '';
          
        case 'img':
          const src =
            $el.attr('src') ||
            $el.attr('data-src') ||
            $el.attr('data-original') ||
            $el.attr('data-lazy-src') ||
            $el.attr('data-zoom-src');
          const alt = $el.attr('alt') || 'image';
          if (!src) return '';
          const resolved = this.handleImageSrc(src, pageUrl);
          return resolved ? `![${alt}](${resolved})\n\n` : '';
          
        case 'a':
          // Shouldn't encounter raw links
          return '';
          
        case 'br':
          return '\n';
          
        case 'hr':
          return '---\n\n';
          
        default:
          // Process children
          let result = '';
          $el.children().each((_: number, child: any) => {
            result += processNode(child);
          });
          return result;
      }
    };
    
    $content.children().each((_: number, el: any) => {
      markdown += processNode(el);
    });

    // Remove GitBook/common boilerplate lines
    this.excludeTextPatterns.forEach(pattern => {
      markdown = markdown.replace(pattern, '\n');
    });

    // Clean up excessive whitespace
    return markdown
      .replace(/\n\n\n+/g, '\n\n')
      .replace(/^ +| +$/gm, '')
      .trim();
  }

  /**
   * Extract text with inline formatting (bold, italic, code, links)
   */
  private extractTextWithFormatting($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): string {
    let text = '';
    
    $el.contents().each((_: number, node: any) => {
      if (node.type === 'text') {
        text += node.data;
      } else {
        const $node = $(node);
        const tagName = node.name?.toLowerCase();
        
        switch (tagName) {
          case 'strong':
          case 'b':
            text += `**${$node.text()}**`;
            break;
          case 'em':
          case 'i':
            text += `*${$node.text()}*`;
            break;
          case 'code':
            text += `\`${$node.text()}\``;
            break;
          case 'a':
            const href = $node.attr('href');
            const linkText = $node.text();
            text += href ? `[${linkText}](${href})` : linkText;
            break;
          default:
            text += $node.text();
        }
      }
    });
    
    return text.trim();
  }

  /**
   * Convert HTML list to Markdown
   */
  private convertList($: cheerio.CheerioAPI, $list: cheerio.Cheerio<any>, ordered: boolean): string {
    let markdown = '';
    let index = 1;
    
    $list.children('li').each((_: number, li: any) => {
      const $li = $(li);
      const prefix = ordered ? `${index}. ` : '- ';
      
      // Get text content (excluding nested lists)
      const $clone = $li.clone();
      $clone.find('ul, ol').remove();
      const text = $clone.text().trim();
      
      markdown += `${prefix}${text}\n`;
      
      // Handle nested lists
      $li.children('ul, ol').each((_: number, nested: any) => {
        const isOL = $(nested).is('ol');
        const nested_md = this.convertList($, $(nested), isOL);
        markdown += nested_md.split('\n')
          .filter(l => l.trim())
          .map(l => `  ${l}`)
          .join('\n') + '\n';
      });
      
      if (ordered) index++;
    });
    
    return markdown + '\n';
  }

  /**
   * Convert HTML table to Markdown
   */
  private convertTable($: cheerio.CheerioAPI, $table: cheerio.Cheerio<any>): string {
    let markdown = '';
    
    const rows: string[][] = [];
    
    // Extract rows
    $table.find('tr').each((_: number, tr: any) => {
      const cells: string[] = [];
      $(tr).find('th, td').each((_: number, cell: any) => {
        cells.push($(cell).text().trim());
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });
    
    if (rows.length === 0) return '';
    
    // Format as markdown table
    const colCount = rows[0].length;
    markdown += '| ' + rows[0].join(' | ') + ' |\n';
    markdown += '| ' + Array(colCount).fill('---').join(' | ') + ' |\n';
    
    for (let i = 1; i < rows.length; i++) {
      markdown += '| ' + rows[i].join(' | ') + ' |\n';
    }
    
    return markdown + '\n';
  }

  /**
   * Extract code blocks
   */
  private extractCode($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): string {
    const isPreTag = $el.is('pre');
    
    if (isPreTag) {
      const $code = $el.find('code').length > 0 ? $el.find('code') : $el;
      const code = $code.text().trim();
      const classLang = $code.attr('class')?.match(/lang(?:uage)?-(\w+)/)?.[1];
      const dataLang = $code.attr('data-language');
      const lang = this.detectLanguage(code, classLang || dataLang || '');
      
      return code ? `\`\`\`${lang}\n${code}\n\`\`\`\n\n` : '';
    } else {
      // Inline code (shouldn't happen here)
      return '';
    }
  }

  private detectLanguage(code: string, hint: string): string {
    const hintLower = hint.toLowerCase();
    if (hintLower) return hintLower;
    const trimmed = code.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) return 'json';
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return 'json';
    if (/\b(import|export|const|let|function)\b/.test(code)) return 'javascript';
    if (/\basync def\b|\bdef\b/.test(code)) return 'python';
    if (/\bSELECT\b|\bFROM\b/.test(code)) return 'sql';
    if (/^#!/.test(trimmed) || /\bmkdir\b|\bgrep\b|\bchmod\b/.test(code)) return 'bash';
    return 'text';
  }

  private pathToPosix(p: string): string {
    return p.split(path.sep).join(path.posix.sep);
  }

  private normalizeUrl(u: string): string {
    try {
      const parsed = new URL(u);
      parsed.hash = '';
      parsed.search = '';
      let href = parsed.href;
      if (href.endsWith('/')) href = href.slice(0, -1);
      return href;
    } catch {
      return u;
    }
  }

  private async maybeWriteFile(filepath: string, content: string): Promise<void> {
    if (this.incremental) {
      try {
        const existing = await fs.readFile(filepath, 'utf8');
        if (existing === content) return;
      } catch {
        // file missing, proceed
      }
    }
    await fs.writeFile(filepath, content);
  }

  private resolveResourceUrl(href: string, pageUrl: string): string {
    if (!href) return '';
    if (href.startsWith('data:')) return href;
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    try {
      return new URL(href, pageUrl).href;
    } catch {
      return '';
    }
  }

  private async downloadAndSave(src: string, targetPath: string): Promise<void> {
    try {
      if (this.incremental) {
        try {
          await fs.access(targetPath);
          return;
        } catch {
          // not present, proceed
        }
      }
      const res = await this.fetchWithRetry(src);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, buf);
    } catch (err) {
      console.warn(`⚠️  Failed to download image ${src}: ${err}`);
    }
  }

  private handleImageSrc(src: string, pageUrl: string): string | null {
    const resolved = this.resolveResourceUrl(src, pageUrl);
    if (!resolved) return null;

    const isExternal = !resolved.startsWith(this.baseUrl);
    if (this.excludeExternalImages && isExternal) {
      return null;
    }

    if (!this.downloadImages) {
      return resolved;
    }

    if (this.imageMap.has(resolved)) {
      return this.imageMap.get(resolved)!;
    }

    const cleanPath = resolved.split('?')[0].split('#')[0];
    const ext = path.extname(cleanPath) || '.img';
    const hash = createHash('md5').update(resolved).digest('hex').slice(0, 12);
    const assetRel = path.posix.join(this.imageDir, `${hash}${ext}`);
    this.imageMap.set(resolved, assetRel);

    const targetPath = path.join(this.outputDir, assetRel);
    const downloadPromise = this.downloadAndSave(resolved, targetPath);
    this.imageDownloads.push(downloadPromise);

    return assetRel;
  }

  private rewriteLinksForFile(markdown: string, currentFilePath: string): string {
    if (!this.rewriteLinks) return markdown;

    const currentDir = this.pathToPosix(path.dirname(currentFilePath));
    const outputRoot = this.pathToPosix(this.outputDir);
    const baseNormalized = this.normalizeUrl(this.baseUrl);

    return markdown.replace(/(!)?\[(.+?)\]\((.+?)\)/g, (match, bang, text, href) => {
      const isImage = !!bang;
      const cleanHref = href.trim();

      if (cleanHref.startsWith('#')) {
        return match;
      }

      // Handle downloaded images stored under imageDir
      if (isImage && (cleanHref.startsWith(this.imageDir) || cleanHref.startsWith(`./${this.imageDir}`))) {
        const normalizedAsset = cleanHref.startsWith('./') ? cleanHref.slice(2) : cleanHref;
        const absAsset = path.posix.join(outputRoot, normalizedAsset);
        const rel = path.posix.relative(currentDir, absAsset);
        return `![${text}](${rel})`;
      }

      // External links remain untouched
      if (/^https?:\/\//i.test(cleanHref)) {
        // But rewrite if they point to an internal doc page we have
        const normalized = this.normalizeUrl(cleanHref);
        const anchor = cleanHref.includes('#') ? cleanHref.substring(cleanHref.indexOf('#')) : '';
        if (this.urlToLocalPath.has(normalized)) {
          const relTarget = path.posix.join(outputRoot, this.urlToLocalPath.get(normalized)!);
          const rel = path.posix.relative(currentDir, relTarget) + anchor;
          return `${isImage ? '!' : ''}[${text}](${rel})`;
        }
        return match;
      }

      // Relative or root-based links
      let targetUrl = '';
      try {
        if (cleanHref.startsWith('/')) {
          targetUrl = this.normalizeUrl(baseNormalized + cleanHref);
        } else {
          targetUrl = this.normalizeUrl(new URL(cleanHref, baseNormalized + '/').href);
        }
      } catch {
        return match;
      }

      const anchor = cleanHref.includes('#') ? cleanHref.substring(cleanHref.indexOf('#')) : '';
      const withoutAnchor = targetUrl.replace(/#.*$/, '');

      if (this.urlToLocalPath.has(withoutAnchor)) {
        const relTarget = path.posix.join(outputRoot, this.urlToLocalPath.get(withoutAnchor)!);
        const rel = path.posix.relative(currentDir, relTarget) + anchor;
        return `${isImage ? '!' : ''}[${text}](${rel})`;
      }

      return match;
    });
  }

  /**
   * Resolve relative URLs
   */
  private resolveUrl(href: string): string {
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('#')) return this.baseUrl + href;
    
    try {
      return new URL(href, this.baseUrl).href;
    } catch {
      return '';
    }
  }

  /**
   * Check if URL is valid documentation
   */
  private isValidDocUrl(url: string): boolean {
    const normalizedBase = this.normalizeUrl(this.baseUrl);
    const normalizedUrl = this.normalizeUrl(url);
    if (!normalizedUrl.startsWith(normalizedBase)) return false;
    if (normalizedUrl.includes('#') && normalizedUrl.split('#')[0] === normalizedBase) return false;
    
    const path = new URL(url).pathname;
    const exclude = ['.css', '.js', '.json', '.xml', '.md', '.pdf', 'sitemap'];
    
    return !exclude.some(ext => path.includes(ext));
  }

  private computeSection(url: string): string {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const chosen = segments.slice(0, this.sectionDepth);
    return chosen.length > 0 ? chosen.join('-') : 'root';
  }

  private async fetchWithRetry(url: string): Promise<Response> {
    let lastError: any = null;
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'GitBook Scraper v2.0'
          }
        });
        if (res.ok) return res;
        lastError = new Error(`HTTP ${res.status}`);
      } catch (err) {
        lastError = err;
      }
      if (attempt < this.retryCount - 1) {
        await this.delay(this.retryDelayMs);
      }
    }
    throw lastError ?? new Error('Unknown fetch error');
  }

  /**
   * Generate output files
   */
  private async generateOutput(): Promise<void> {
    await mkdir(this.outputDir, { recursive: true });

    // Build URL -> local path map for link rewriting
    this.urlToLocalPath.clear();
    for (const page of this.pages) {
      const filename = this.sanitizeFilename(page.title) + '.md';
      const relPath = path.posix.join(page.section, filename);
      this.urlToLocalPath.set(this.normalizeUrl(page.url), relPath);
    }

    if (this.downloadImages) {
      await mkdir(path.join(this.outputDir, this.imageDir), { recursive: true });
    }

    // Wait for queued image downloads
    if (this.imageDownloads.length > 0) {
      await Promise.allSettled(this.imageDownloads);
    }
    
    // Group by section
    const bySection = new Map<string, PageContent[]>();
    
    for (const page of this.pages) {
      if (!bySection.has(page.section)) {
        bySection.set(page.section, []);
      }
      bySection.get(page.section)!.push(page);
    }
    
    // Write individual files
    for (const [section, pages] of bySection) {
      for (const page of pages) {
        const filename = this.sanitizeFilename(page.title) + '.md';
        const filepath = path.join(this.outputDir, section, filename);
        await mkdir(path.dirname(filepath), { recursive: true });

        const rewrittenBody = this.rewriteLinksForFile(page.markdown, filepath);

        let content = `# ${page.title}\n\n`;
        if (this.includeSource) {
          content += `> Source: ${page.url}\n\n`;
        }
        content += rewrittenBody;

        await this.maybeWriteFile(filepath, content);
      }
    }
    
    // Write combined file
    let combined = '# Complete Documentation\n\n';
    combined += `Generated: ${new Date().toISOString()}\n\n`;
    
    for (const [section, pages] of bySection) {
      combined += `\n## Section: ${section}\n\n`;
      for (const page of pages) {
        const rewritten = this.rewriteLinksForFile(page.markdown, path.join(this.outputDir, 'COMPLETE.md'));
        combined += `### ${page.title}\n\n`;
        combined += rewritten + '\n\n';
        combined += '---\n\n';
      }
    }
    
    await this.maybeWriteFile(path.join(this.outputDir, 'COMPLETE.md'), combined);
    
    // Write metadata
    const metadata = {
      url: this.baseUrl,
      timestamp: new Date().toISOString(),
      pages: this.pages.length,
      sections: Array.from(bySection.keys()),
      pageList: this.pages.map(p => ({
        title: p.title,
        url: p.url,
        section: p.section,
        meta: p.meta || {}
      }))
    };
    
    await this.maybeWriteFile(
      path.join(this.outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sanitize filename
   */
  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);
  }
}

// CLI
async function main() {
  // @ts-ignore - available in Node.js
  const args = (globalThis as any).process?.argv?.slice(2) || [];
  
  if (args.length === 0) {
    console.log(`
Usage: scraper-improved.ts <url> [options]

Options:
  --output <dir>                Output directory (default: ./scraped-docs)
  --depth <n>                   Max crawl depth (default: 5)
  --delay <ms>                  Delay between requests (default: 1500)
  --concurrent <n>              Concurrent requests (default: 2)
  --include-source              Include source URLs in markdown output
  --remove-source               Exclude source URLs (default behavior)
  --download-images             Download images locally
  --no-download-images          Keep remote image URLs (default)
  --image-dir <dir>             Directory for downloaded images (default: assets)
  --exclude-external-images     Skip downloading/including images outside base URL
  --exclude-selector <css>      Additional selectors to remove (repeatable)
  --exclude-text <pattern>      Additional text patterns/regex to strip (repeatable)
  --section-depth <n>           Path depth for section grouping (default: 1)
  --retry <n>                   Max retries for requests (default: 3)
  --retry-delay <ms>            Delay between retries (default: 1500)
  --incremental                 Skip writing unchanged files & existing assets
  --no-rewrite-links            Keep original links instead of local rewrites
  --config <file>               Load options from JSON config

Examples:
  npx tsx src/scraper-improved.ts https://docs.stripe.com
  npx tsx src/scraper-improved.ts https://docs.sentry.io --output ./sentry-docs --depth 10
    `);
    return;
  }

  // First pass: find config path if provided
  let configPath: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      configPath = args[i + 1];
      break;
    }
  }

  let options: ScraperOptions = {};
  if (configPath) {
    try {
      const raw = await fs.readFile(configPath, 'utf8');
      const parsed = JSON.parse(raw);
      options = parsed;
    } catch (err) {
      console.warn(`⚠️  Could not read config at ${configPath}: ${err}`);
    }
  }

  let url: string | undefined;
  const extraSelectors: string[] = [];
  const extraTextPatterns: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--') && !url) {
      url = arg;
      continue;
    }

    switch (arg) {
      case '--output':
        options.outputDir = args[i + 1];
        i++;
        break;
      case '--depth':
        options.maxDepth = parseInt(args[i + 1]);
        i++;
        break;
      case '--delay':
        options.delayMs = parseInt(args[i + 1]);
        i++;
        break;
      case '--concurrent':
        options.maxConcurrent = parseInt(args[i + 1]);
        i++;
        break;
      case '--include-source':
        options.includeSource = true;
        break;
      case '--remove-source':
        options.includeSource = false;
        break;
      case '--download-images':
        options.downloadImages = true;
        break;
      case '--no-download-images':
        options.downloadImages = false;
        break;
      case '--image-dir':
        options.imageDir = args[i + 1];
        i++;
        break;
      case '--exclude-external-images':
        options.excludeExternalImages = true;
        break;
      case '--exclude-selector':
        if (args[i + 1]) extraSelectors.push(args[i + 1]);
        i++;
        break;
      case '--exclude-text':
        if (args[i + 1]) extraTextPatterns.push(args[i + 1]);
        i++;
        break;
      case '--section-depth':
        options.sectionDepth = parseInt(args[i + 1]);
        i++;
        break;
      case '--retry':
        options.retryCount = parseInt(args[i + 1]);
        i++;
        break;
      case '--retry-delay':
      case '--retry-delay-ms':
        options.retryDelayMs = parseInt(args[i + 1]);
        i++;
        break;
      case '--incremental':
        options.incremental = true;
        break;
      case '--no-rewrite-links':
        options.rewriteLinks = false;
        break;
      case '--config':
        i++; // already handled
        break;
      default:
        break;
    }
  }

  if (extraSelectors.length) {
    options.excludeSelectors = [...(options.excludeSelectors || []), ...extraSelectors];
  }
  if (extraTextPatterns.length) {
    options.excludeTextPatterns = [...(options.excludeTextPatterns || []), ...extraTextPatterns];
  }

  if (!url) {
    console.log('Missing <url>.');
    return;
  }

  const scraper = new ImprovedGitBookScraper(url, options);
  await scraper.scrape();
}

main().catch(console.error);
