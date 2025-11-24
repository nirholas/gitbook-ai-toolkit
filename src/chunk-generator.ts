#!/usr/bin/env node
/**
 * Chunk Generator for GitBook Documentation
 * 
 * Generates semantic chunks optimized for RAG (Retrieval Augmented Generation)
 * Perfect for vector databases, embeddings, and semantic search
 * 
 * Usage:
 *   tsx src/chunk-generator.ts ./output/sentry
 *   tsx src/chunk-generator.ts ./output/stripe --size 1000 --overlap 200
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface Chunk {
  id: string;
  section: string;
  title: string;
  content: string;
  metadata: ChunkMetadata;
  tokenCount: number;
}

interface ChunkMetadata {
  url: string;
  pageTitle: string;
  section: string;
  subsection?: string;
  type: 'concept' | 'api' | 'guide' | 'example' | 'reference';
  keywords: string[];
  hasCode: boolean;
  codeLanguages?: string[];
}

class ChunkGenerator {
  private docsPath: string;
  private outputPath: string;
  private chunkSize: number;
  private overlap: number;

  constructor(
    docsPath: string,
    outputPath?: string,
    chunkSize: number = 800,
    overlap: number = 150
  ) {
    this.docsPath = docsPath;
    this.outputPath = outputPath || path.join(docsPath, 'chunks.json');
    this.chunkSize = chunkSize;
    this.overlap = overlap;
  }

  async generate(): Promise<void> {
    console.log('🧩 Generating semantic chunks for RAG...');
    console.log(`   Chunk size: ${this.chunkSize} tokens`);
    console.log(`   Overlap: ${this.overlap} tokens\n`);

    // Read metadata
    const metadataPath = path.join(this.docsPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    const allChunks: Chunk[] = [];
    let chunkId = 0;

    // Process each page
    for (const page of metadata.pages) {
      const pagePath = path.join(
        this.docsPath,
        page.section,
        `${this.slugify(page.title)}.md`
      );

      try {
        const content = await fs.readFile(pagePath, 'utf-8');
        const chunks = this.chunkPage(content, page, chunkId);

        allChunks.push(...chunks);
        chunkId += chunks.length;

        console.log(`✓ ${page.title}: ${chunks.length} chunks`);
      } catch (error) {
        console.warn(`⚠️  Could not process ${page.title}`);
      }
    }

    // Save chunks
    await fs.writeFile(this.outputPath, JSON.stringify(allChunks, null, 2));

    console.log(`\n✅ Generated ${allChunks.length} semantic chunks`);
    console.log(`📁 Saved to: ${this.outputPath}`);
    console.log(`\n💡 Use with:`);
    console.log(`   - Pinecone: Load chunks and generate embeddings`);
    console.log(`   - Weaviate: Import as objects with text2vec`);
    console.log(`   - ChromaDB: Add documents with metadata`);
    console.log(`   - OpenAI embeddings: text-embedding-3-small`);

    // Generate stats
    this.printStats(allChunks);
  }

  private chunkPage(markdown: string, page: any, startId: number): Chunk[] {
    const chunks: Chunk[] = [];

    // Remove frontmatter and metadata sections
    let cleanContent = markdown.replace(/^---[\s\S]*?---\n/, '');
    cleanContent = cleanContent.replace(/^>\s*Source:.*$/gm, '');
    cleanContent = cleanContent.replace(/^##\s*Metadata[\s\S]*?(?=##|$)/gm, '');

    // Split into sections by headings
    const sections = this.splitIntoSections(cleanContent);

    for (const section of sections) {
      const sectionChunks = this.chunkSection(section, page, chunks.length + startId);
      chunks.push(...sectionChunks);
    }

    return chunks;
  }

  private splitIntoSections(content: string): Array<{ heading: string; content: string }> {
    const sections: Array<{ heading: string; content: string }> = [];
    const lines = content.split('\n');

    let currentHeading = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.match(/^#{1,3}\s+/)) {
        // Save previous section
        if (currentContent.length > 0) {
          sections.push({
            heading: currentHeading,
            content: currentContent.join('\n').trim(),
          });
        }

        // Start new section
        currentHeading = line.replace(/^#{1,3}\s+/, '');
        currentContent = [line];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentContent.length > 0) {
      sections.push({
        heading: currentHeading,
        content: currentContent.join('\n').trim(),
      });
    }

    return sections;
  }

  private chunkSection(
    section: { heading: string; content: string },
    page: any,
    startId: number
  ): Chunk[] {
    const chunks: Chunk[] = [];
    const tokens = this.estimateTokens(section.content);

    if (tokens <= this.chunkSize) {
      // Single chunk
      chunks.push(this.createChunk(section.content, section.heading, page, startId));
    } else {
      // Multiple chunks with overlap
      const paragraphs = section.content.split(/\n\n+/);
      let currentChunk: string[] = [];
      let currentTokens = 0;

      for (const para of paragraphs) {
        const paraTokens = this.estimateTokens(para);

        if (currentTokens + paraTokens > this.chunkSize && currentChunk.length > 0) {
          // Save current chunk
          chunks.push(
            this.createChunk(
              currentChunk.join('\n\n'),
              section.heading,
              page,
              startId + chunks.length
            )
          );

          // Start new chunk with overlap
          currentChunk = this.getOverlapParagraphs(currentChunk);
          currentTokens = this.estimateTokens(currentChunk.join('\n\n'));
        }

        currentChunk.push(para);
        currentTokens += paraTokens;
      }

      // Save last chunk
      if (currentChunk.length > 0) {
        chunks.push(
          this.createChunk(
            currentChunk.join('\n\n'),
            section.heading,
            page,
            startId + chunks.length
          )
        );
      }
    }

    return chunks;
  }

  private createChunk(content: string, heading: string, page: any, id: number): Chunk {
    // Extract code blocks
    const codeBlocks = content.match(/```(\w+)?\n[\s\S]*?```/g) || [];
    const hasCode = codeBlocks.length > 0;
    const codeLanguages = hasCode
      ? [...new Set(codeBlocks.map((block) => block.match(/```(\w+)/)?.[1] || 'unknown'))]
      : undefined;

    // Detect content type
    let type: ChunkMetadata['type'] = 'concept';
    if (page.hasApi || content.includes('**Endpoint:**')) {
      type = 'api';
    } else if (content.includes('```') && content.includes('Example')) {
      type = 'example';
    } else if (heading.toLowerCase().includes('guide') || heading.toLowerCase().includes('tutorial')) {
      type = 'guide';
    } else if (heading.toLowerCase().includes('reference') || heading.toLowerCase().includes('api')) {
      type = 'reference';
    }

    // Extract keywords
    const keywords = this.extractKeywords(content, heading);

    return {
      id: `chunk_${id.toString().padStart(5, '0')}`,
      section: page.section,
      title: heading || page.title,
      content: content.trim(),
      metadata: {
        url: page.url,
        pageTitle: page.title,
        section: page.section,
        subsection: page.subsection,
        type,
        keywords,
        hasCode,
        codeLanguages,
      },
      tokenCount: this.estimateTokens(content),
    };
  }

  private extractKeywords(content: string, heading: string): string[] {
    const keywords = new Set<string>();

    // Add heading words
    heading
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .forEach((word) => keywords.add(word));

    // Extract words from content (excluding common words)
    const stopWords = new Set([
      'the',
      'is',
      'at',
      'which',
      'on',
      'and',
      'or',
      'to',
      'in',
      'for',
      'with',
      'this',
      'that',
      'from',
      'are',
      'was',
      'were',
      'been',
      'have',
      'has',
      'will',
      'would',
      'can',
      'could',
    ]);

    const words = content
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 4 && !stopWords.has(word));

    // Get top 10 most frequent words
    const wordFreq = new Map<string, number>();
    words.forEach((word) => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([word]) => keywords.add(word));

    return Array.from(keywords);
  }

  private getOverlapParagraphs(paragraphs: string[]): string[] {
    // Take last few paragraphs for overlap
    const overlapText = paragraphs.slice(-3).join('\n\n');
    const overlapTokens = this.estimateTokens(overlapText);

    if (overlapTokens <= this.overlap) {
      return paragraphs.slice(-3);
    } else if (paragraphs.length > 1) {
      return paragraphs.slice(-2);
    } else {
      return paragraphs.slice(-1);
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private printStats(chunks: Chunk[]): void {
    console.log(`\n📊 Chunk Statistics:`);

    const avgTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0) / chunks.length;
    console.log(`   Average tokens per chunk: ${Math.round(avgTokens)}`);

    const types = chunks.reduce((acc, c) => {
      acc[c.metadata.type] = (acc[c.metadata.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`   Chunks by type:`);
    Object.entries(types).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });

    const withCode = chunks.filter((c) => c.metadata.hasCode).length;
    console.log(`   Chunks with code: ${withCode} (${Math.round((withCode / chunks.length) * 100)}%)`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Chunk Generator for GitBook (RAG Optimized)
============================================

Generate semantic chunks from scraped GitBook documentation
Optimized for vector databases and retrieval augmented generation

Usage:
  tsx src/chunk-generator.ts <docs-path> [options]

Examples:
  tsx src/chunk-generator.ts ./output/sentry
  tsx src/chunk-generator.ts ./output/stripe --size 1000 --overlap 200
  tsx src/chunk-generator.ts ./output/gitcoin --output ./custom-chunks.json

Options:
  --size <n>       Chunk size in tokens (default: 800)
  --overlap <n>    Overlap between chunks in tokens (default: 150)
  --output <file>  Output file path (default: <docs-path>/chunks.json)
  --help          Show this help

Recommended Settings:
  - OpenAI embeddings: --size 800
  - Cohere embeddings: --size 512
  - Sentence transformers: --size 256
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const sizeIdx = args.indexOf('--size');
  const size = sizeIdx !== -1 ? parseInt(args[sizeIdx + 1]) : 800;
  const overlapIdx = args.indexOf('--overlap');
  const overlap = overlapIdx !== -1 ? parseInt(args[overlapIdx + 1]) : 150;
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  const generator = new ChunkGenerator(docsPath, outputPath, size, overlap);

  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { ChunkGenerator };
