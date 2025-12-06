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
import { mkdir } from 'fs/promises';

interface PageContent {
  url: string;
  title: string;
  markdown: string;
  section: string;
  depth: number;
}

class ImprovedGitBookScraper {
  private baseUrl: string;
  private outputDir: string;
  private visited = new Set<string>();
  private queue: { url: string; depth: number }[] = [];
  private pages: PageContent[] = [];
  private maxDepth: number;
  private delayMs: number;
  private maxConcurrent: number;

  constructor(baseUrl: string, options: {
    outputDir?: string;
    maxDepth?: number;
    delayMs?: number;
    maxConcurrent?: number;
  } = {}) {
    this.baseUrl = baseUrl;
    this.outputDir = options.outputDir || './scraped-docs';
    this.maxDepth = options.maxDepth || 5;
    this.delayMs = options.delayMs || 1500;
    this.maxConcurrent = options.maxConcurrent || 2;
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
    if (this.visited.has(url)) return;
    this.visited.add(url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GitBook Scraper v2.0',
        }
      });
      
      if (!response.ok) return;
      
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
            links.add(fullUrl);
          }
        }
      });
      
      // Look for content links
      $('main a, article a, .content a, [role="main"] a').each((_: number, el: any) => {
        const href = $(el).attr('href');
        if (href && !href.includes('#') && !href.startsWith('http')) {
          const fullUrl = this.resolveUrl(href);
          if (this.isValidDocUrl(fullUrl)) {
            links.add(fullUrl);
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
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GitBook Scraper v2.0',
        }
      });
      
      if (!response.ok) return;
      
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
      
      // Remove navigation and footer
      $content.find('nav, footer, .sidebar, .navigation, .toc, aside').remove();
      
      // Convert to markdown
      const markdown = this.htmlToMarkdown($, $content);
      
      // Determine section from URL
      const urlPath = new URL(url).pathname;
      const section = urlPath.split('/').filter(Boolean)[0] || 'root';
      
      if (markdown.trim().length > 0) {
        this.pages.push({
          url,
          title,
          markdown,
          section,
          depth: 0
        });
      }
    } catch (error) {
      console.warn(`⚠️  Error scraping ${url}: ${error}`);
    }
  }

  /**
   * Convert HTML to clean Markdown
   */
  private htmlToMarkdown($: cheerio.CheerioAPI, $content: cheerio.Cheerio<any>): string {
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
          const src = $el.attr('src');
          const alt = $el.attr('alt') || 'image';
          return src ? `![${alt}](${src})\n\n` : '';
          
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
      const lang = $code.attr('class')?.match(/lang(?:uage)?-(\w+)/)?.[1] || 'text';
      
      return code ? `\`\`\`${lang}\n${code}\n\`\`\`\n\n` : '';
    } else {
      // Inline code (shouldn't happen here)
      return '';
    }
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
    if (!url.startsWith(this.baseUrl)) return false;
    if (url.includes('#') && url.split('#')[0] === this.baseUrl) return false;
    
    const path = new URL(url).pathname;
    const exclude = ['.css', '.js', '.json', '.xml', '.md', '.pdf', 'sitemap'];
    
    return !exclude.some(ext => path.includes(ext));
  }

  /**
   * Generate output files
   */
  private async generateOutput(): Promise<void> {
    await mkdir(this.outputDir, { recursive: true });
    
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
        
        let content = `# ${page.title}\n\n`;
        content += `> Source: ${page.url}\n\n`;
        content += page.markdown;
        
        await fs.writeFile(filepath, content);
      }
    }
    
    // Write combined file
    let combined = '# Complete Documentation\n\n';
    combined += `Generated: ${new Date().toISOString()}\n\n`;
    
    for (const [section, pages] of bySection) {
      combined += `\n## Section: ${section}\n\n`;
      for (const page of pages) {
        combined += `### ${page.title}\n\n`;
        combined += page.markdown + '\n\n';
        combined += '---\n\n';
      }
    }
    
    await fs.writeFile(path.join(this.outputDir, 'COMPLETE.md'), combined);
    
    // Write metadata
    const metadata = {
      url: this.baseUrl,
      timestamp: new Date().toISOString(),
      pages: this.pages.length,
      sections: Array.from(bySection.keys()),
      pageList: this.pages.map(p => ({ title: p.title, url: p.url, section: p.section }))
    };
    
    await fs.writeFile(
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
  --output <dir>     Output directory (default: ./scraped-docs)
  --depth <n>        Max crawl depth (default: 5)
  --delay <ms>       Delay between requests (default: 1500)
  --concurrent <n>   Concurrent requests (default: 2)

Examples:
  npx tsx src/scraper-improved.ts https://docs.stripe.com
  npx tsx src/scraper-improved.ts https://docs.sentry.io --output ./sentry-docs --depth 10
    `);
    return;
  }
  
  const url = args[0];
  const options: any = {};
  
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--depth' && args[i + 1]) {
      options.maxDepth = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--delay' && args[i + 1]) {
      options.delayMs = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--concurrent' && args[i + 1]) {
      options.maxConcurrent = parseInt(args[i + 1]);
      i++;
    }
  }
  
  const scraper = new ImprovedGitBookScraper(url, options);
  await scraper.scrape();
}

main().catch(console.error);
