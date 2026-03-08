export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2]
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    headings.push({
      id,
      text,
      level: match[1].length,
    });
  }

  return headings;
}

export function TableOfContents({ headings }: { headings: TocItem[] }) {
  if (headings.length < 3) return null;

  return (
    <nav className="mb-12 p-6 rounded-2xl border border-neutral-900 bg-neutral-950">
      <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
        In this article
      </p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? 'ml-4' : ''}
          >
            <a
              href={`#${heading.id}`}
              className="text-sm text-neutral-500 hover:text-white transition-colors leading-relaxed"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
