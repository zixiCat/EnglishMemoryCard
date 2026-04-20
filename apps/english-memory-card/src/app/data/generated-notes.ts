import type { NoteSection } from '../types';

interface ParsedHeading {
  readonly isoDate: string;
  readonly title: string;
}

interface WebpackContextModule {
  readonly default: string;
}

interface WebpackContext {
  keys: () => string[];
  <T = unknown>(id: string): T;
}

const markdownContext = (
  require as NodeJS.Require & {
    context: (directory: string, useSubdirectories: boolean, regExp: RegExp) => WebpackContext;
  }
).context('.', true, /\.md$/);

export const noteSections: readonly NoteSection[] = markdownContext
  .keys()
  .sort((left, right) => normalizeContextKey(left).localeCompare(normalizeContextKey(right)))
  .flatMap((contextKey) => {
    const relativePath = normalizeContextKey(contextKey);

    return parseMarkdownSections(readMarkdownModule(markdownContext(contextKey)), relativePath);
  });

function readMarkdownModule(moduleValue: unknown): string {
  if (typeof moduleValue === 'string') {
    return moduleValue;
  }

  if (moduleValue && typeof moduleValue === 'object') {
    const markdown = (moduleValue as Partial<WebpackContextModule>).default;

    if (typeof markdown === 'string') {
      return markdown;
    }
  }

  throw new Error('Expected webpack to load Markdown files as raw text.');
}

function parseMarkdownSections(markdown: string, relativePath: string): NoteSection[] {
  const headings = Array.from(markdown.matchAll(/^#{2,6}\s+(.+)$/gm));
  const sections: NoteSection[] = [];

  headings.forEach((headingMatch, index) => {
    const headingText = headingMatch[1]?.trim() ?? '';
    const parsedHeading = parseDateHeading(headingText);

    if (!parsedHeading || headingMatch.index === undefined) {
      return;
    }

    const bodyStart = headingMatch.index + headingMatch[0].length;
    const nextHeadingIndex = headings[index + 1]?.index;
    const bodyEnd = nextHeadingIndex === undefined ? markdown.length : nextHeadingIndex;
    const body = markdown.slice(bodyStart, bodyEnd).trim();

    if (!body) {
      return;
    }

    sections.push({
      id: buildSectionId(relativePath, parsedHeading.isoDate, sections.length + 1),
      fileName: getFileName(relativePath),
      relativePath,
      date: parsedHeading.isoDate,
      title: parsedHeading.title || stripExtension(getFileName(relativePath)),
      body,
      excerpt: buildExcerpt(body),
      wordCount: countWords(body),
    });
  });

  return sections;
}

function parseDateHeading(headingText: string): ParsedHeading | null {
  const isoLikeMatch = headingText.match(/^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})(.*)$/);

  if (isoLikeMatch) {
    const year = Number(isoLikeMatch[1]);
    const month = Number(isoLikeMatch[3]);
    const day = Number(isoLikeMatch[4]);

    if (!isValidDateParts(year, month, day)) {
      return null;
    }

    return {
      isoDate: `${year}-${pad(month)}-${pad(day)}`,
      title: cleanHeadingTail(isoLikeMatch[5] ?? ''),
    };
  }

  const chineseDateMatch = headingText.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(.*)$/);

  if (!chineseDateMatch) {
    return null;
  }

  const year = Number(chineseDateMatch[1]);
  const month = Number(chineseDateMatch[2]);
  const day = Number(chineseDateMatch[3]);

  if (!isValidDateParts(year, month, day)) {
    return null;
  }

  return {
    isoDate: `${year}-${pad(month)}-${pad(day)}`,
    title: cleanHeadingTail(chineseDateMatch[4] ?? ''),
  };
}

function cleanHeadingTail(rawTail: string): string {
  return rawTail.replace(/^[\s|:：-]+/, '').trim();
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  const candidateDate = new Date(year, month - 1, day);

  return (
    candidateDate.getFullYear() === year
    && candidateDate.getMonth() === month - 1
    && candidateDate.getDate() === day
  );
}

function buildSectionId(relativePath: string, isoDate: string, index: number): string {
  const safeFileStem = stripExtension(relativePath)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `${safeFileStem || 'note'}-${isoDate}-${index}`;
}

function buildExcerpt(body: string): string {
  return body.replace(/\s+/g, ' ').trim().slice(0, 140);
}

function countWords(body: string): number {
  return body.split(/\s+/).filter(Boolean).length;
}

function stripExtension(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf('.');
  return extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
}

function getFileName(relativePath: string): string {
  const pathSegments = relativePath.split('/');
  return pathSegments[pathSegments.length - 1] ?? relativePath;
}

function normalizeContextKey(contextKey: string): string {
  return contextKey.replace(/^\.\//, '');
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
