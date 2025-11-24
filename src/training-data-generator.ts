#!/usr/bin/env node
/**
 * Training Data Generator for GitBook Documentation
 * 
 * Generates Q&A pairs and conversation data for LLM fine-tuning
 * Perfect for creating domain-specific chatbots and fine-tuning models
 * 
 * Usage:
 *   tsx src/training-data-generator.ts ./output/sentry
 *   tsx src/training-data-generator.ts ./output/stripe --pairs 1000
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface TrainingPair {
  prompt: string;
  completion: string;
  metadata?: {
    source: string;
    type: 'concept' | 'api' | 'howto' | 'example';
    section: string;
  };
}

class TrainingDataGenerator {
  private docsPath: string;
  private outputPath: string;
  private maxPairs: number;

  constructor(docsPath: string, outputPath?: string, maxPairs: number = 1000) {
    this.docsPath = docsPath;
    this.outputPath = outputPath || path.join(docsPath, 'training-data.jsonl');
    this.maxPairs = maxPairs;
  }

  async generate(): Promise<void> {
    console.log('🎓 Generating training data for LLM fine-tuning...');
    console.log(`   Target pairs: ${this.maxPairs}\n`);

    // Read metadata
    const metadataPath = path.join(this.docsPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    const allPairs: TrainingPair[] = [];

    // Process each page
    for (const page of metadata.pages) {
      const pagePath = path.join(
        this.docsPath,
        page.section,
        `${this.slugify(page.title)}.md`
      );

      try {
        const content = await fs.readFile(pagePath, 'utf-8');
        const pairs = this.extractPairs(content, page);

        allPairs.push(...pairs);
        console.log(`✓ ${page.title}: ${pairs.length} pairs`);

        if (allPairs.length >= this.maxPairs) break;
      } catch (error) {
        console.warn(`⚠️  Could not process ${page.title}`);
      }
    }

    // Limit to max pairs
    const finalPairs = allPairs.slice(0, this.maxPairs);

    // Save as JSONL (one JSON object per line)
    const jsonl = finalPairs.map((pair) => JSON.stringify(pair)).join('\n');
    await fs.writeFile(this.outputPath, jsonl);

    console.log(`\n✅ Generated ${finalPairs.length} training pairs`);
    console.log(`📁 Saved to: ${this.outputPath}`);
    console.log(`\n💡 Use with:`);
    console.log(`   - OpenAI fine-tuning: openai api fine_tunes.create`);
    console.log(`   - Anthropic: Upload to Claude training`);
    console.log(`   - Custom models: Load with datasets library`);

    this.printStats(finalPairs);
  }

  private extractPairs(markdown: string, page: any): TrainingPair[] {
    const pairs: TrainingPair[] = [];

    // Remove frontmatter and metadata
    let content = markdown.replace(/^---[\s\S]*?---\n/, '');
    content = content.replace(/^>\s*Source:.*$/gm, '');

    // Strategy 1: Headings as questions
    const headingPairs = this.extractFromHeadings(content, page);
    pairs.push(...headingPairs);

    // Strategy 2: API endpoints as Q&A
    if (page.hasApi) {
      const apiPairs = this.extractFromApi(content, page);
      pairs.push(...apiPairs);
    }

    // Strategy 3: Code examples as "how to" questions
    const examplePairs = this.extractFromExamples(content, page);
    pairs.push(...examplePairs);

    // Strategy 4: Definitions and concepts
    const conceptPairs = this.extractConcepts(content, page);
    pairs.push(...conceptPairs);

    return pairs;
  }

  private extractFromHeadings(content: string, page: any): TrainingPair[] {
    const pairs: TrainingPair[] = [];
    const sections = content.split(/\n#{2,3}\s+/);

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const lines = section.split('\n');
      const heading = lines[0].replace(/^#+\s*/, '').trim();

      // Skip headings that are too short or generic
      if (heading.length < 10 || heading.toLowerCase().includes('documentation')) continue;

      // Get content after heading
      const sectionContent = lines.slice(1).join('\n').trim();

      // Skip if content is too short
      if (sectionContent.length < 100) continue;

      // Clean content (remove code blocks for simpler answers)
      let cleanContent = sectionContent.replace(/```[\s\S]*?```/g, '');
      cleanContent = this.truncate(cleanContent, 500);

      // Generate question from heading
      const question = this.headingToQuestion(heading);

      pairs.push({
        prompt: question,
        completion: cleanContent,
        metadata: {
          source: page.url,
          type: 'concept',
          section: page.section,
        },
      });
    }

    return pairs;
  }

  private extractFromApi(content: string, page: any): TrainingPair[] {
    const pairs: TrainingPair[] = [];

    // Extract method and endpoint
    const methodMatch = content.match(/\*\*Method:\*\*\s*`?(GET|POST|PUT|DELETE|PATCH)`?/);
    const endpointMatch = content.match(/\*\*Endpoint:\*\*\s*`([^`]+)`/);

    if (methodMatch && endpointMatch) {
      const method = methodMatch[1];
      const endpoint = endpointMatch[1];

      // Q&A about the endpoint
      pairs.push({
        prompt: `How do I ${method.toLowerCase()} ${page.title.toLowerCase()}?`,
        completion: `Use ${method} ${endpoint}. ${this.extractApiDescription(content)}`,
        metadata: {
          source: page.url,
          type: 'api',
          section: page.section,
        },
      });

      // Q&A about parameters
      const params = this.extractParameters(content);
      if (params.length > 0) {
        pairs.push({
          prompt: `What parameters does ${page.title} accept?`,
          completion: `${page.title} accepts: ${params.join(', ')}.`,
          metadata: {
            source: page.url,
            type: 'api',
            section: page.section,
          },
        });
      }
    }

    return pairs;
  }

  private extractFromExamples(content: string, page: any): TrainingPair[] {
    const pairs: TrainingPair[] = [];
    const codeBlocks = content.matchAll(/```(\w+)?\n([\s\S]*?)```/g);

    for (const match of codeBlocks) {
      const lang = match[1] || 'code';
      const code = match[2].trim();

      // Find description before code block
      const blockStart = match.index || 0;
      const beforeBlock = content.substring(Math.max(0, blockStart - 500), blockStart);
      const descMatch = beforeBlock.match(/([^.\n]+)[.]\s*$/);
      const description = descMatch ? descMatch[1] : `Example ${lang} code`;

      if (code.length > 50 && code.length < 2000) {
        pairs.push({
          prompt: `Show me an example of ${description.toLowerCase()}`,
          completion: `Here's an example in ${lang}:\n\n\`\`\`${lang}\n${code}\n\`\`\``,
          metadata: {
            source: page.url,
            type: 'example',
            section: page.section,
          },
        });
      }
    }

    return pairs;
  }

  private extractConcepts(content: string, page: any): TrainingPair[] {
    const pairs: TrainingPair[] = [];

    // Look for definition patterns
    const defPatterns = [
      /\*\*([^*]+)\*\*\s*[-:]\s*([^.\n]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+([^.\n]+)/g,
    ];

    for (const pattern of defPatterns) {
      const matches = content.matchAll(pattern);

      for (const match of matches) {
        const term = match[1].trim();
        const definition = match[2].trim();

        if (term.length > 5 && definition.length > 20 && definition.length < 300) {
          pairs.push({
            prompt: `What is ${term}?`,
            completion: definition,
            metadata: {
              source: page.url,
              type: 'concept',
              section: page.section,
            },
          });
        }
      }
    }

    return pairs;
  }

  private headingToQuestion(heading: string): string {
    const lower = heading.toLowerCase();

    // If already a question, return as-is
    if (heading.endsWith('?')) return heading;

    // Convert common patterns
    if (lower.startsWith('how to')) {
      return heading + '?';
    }
    if (lower.startsWith('what is') || lower.startsWith('what are')) {
      return heading + '?';
    }
    if (lower.startsWith('why')) {
      return heading + '?';
    }

    // Default: prepend "What is" or "How does"
    if (lower.includes('work') || lower.includes('function')) {
      return `How does ${heading} work?`;
    }

    return `What is ${heading}?`;
  }

  private extractApiDescription(content: string): string {
    const descMatch = content.match(/##\s+Documentation\n\n([^\n]+)/);
    return descMatch ? descMatch[1] : 'See documentation for details.';
  }

  private extractParameters(content: string): string[] {
    const params: string[] = [];
    const paramTable = content.match(/### Parameters\n\n\|([^#]+)/s);

    if (paramTable) {
      const rows = paramTable[1].split('\n').slice(2);

      for (const row of rows) {
        const cells = row
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);

        if (cells.length >= 1) {
          params.push(cells[0]);
        }
      }
    }

    return params;
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    // Truncate at sentence boundary
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');

    if (lastPeriod > maxLength * 0.7) {
      return truncated.substring(0, lastPeriod + 1);
    }

    return truncated + '...';
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private printStats(pairs: TrainingPair[]): void {
    console.log(`\n📊 Training Data Statistics:`);

    const types = pairs.reduce((acc, p) => {
      const type = p.metadata?.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`   Pairs by type:`);
    Object.entries(types).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });

    const avgPromptLen =
      pairs.reduce((sum, p) => sum + p.prompt.length, 0) / pairs.length;
    const avgCompletionLen =
      pairs.reduce((sum, p) => sum + p.completion.length, 0) / pairs.length;

    console.log(`   Average prompt length: ${Math.round(avgPromptLen)} chars`);
    console.log(`   Average completion length: ${Math.round(avgCompletionLen)} chars`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Training Data Generator for GitBook
====================================

Generate Q&A pairs and training data for LLM fine-tuning

Usage:
  tsx src/training-data-generator.ts <docs-path> [options]

Examples:
  tsx src/training-data-generator.ts ./output/sentry
  tsx src/training-data-generator.ts ./output/stripe --pairs 2000
  tsx src/training-data-generator.ts ./output/gitcoin --output ./training.jsonl

Options:
  --pairs <n>      Maximum number of Q&A pairs to generate (default: 1000)
  --output <file>  Output file path (default: <docs-path>/training-data.jsonl)
  --help          Show this help

Output Format:
  JSONL (JSON Lines) - one training pair per line
  Compatible with OpenAI, Anthropic, and Hugging Face
    `);
    process.exit(0);
  }

  const docsPath = args[0];
  const pairsIdx = args.indexOf('--pairs');
  const maxPairs = pairsIdx !== -1 ? parseInt(args[pairsIdx + 1]) : 1000;
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  const generator = new TrainingDataGenerator(docsPath, outputPath, maxPairs);

  try {
    await generator.generate();
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { TrainingDataGenerator };
