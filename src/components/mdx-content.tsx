import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { Fragment } from 'react';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

function MdxLink(props: ComponentPropsWithoutRef<'a'>) {
  const href = props.href ?? '';
  if (href.startsWith('/')) {
    return <Link href={href} className={props.className}>{props.children}</Link>;
  }
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
}

function textFromChildren(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return textFromChildren((children as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Heading({ level, children, ...props }: { level: 2 | 3; children?: ReactNode } & ComponentPropsWithoutRef<'h2'>) {
  const text = textFromChildren(children);
  const id = slugify(text);
  const Tag = `h${level}` as const;
  return <Tag id={id} {...props}>{children}</Tag>;
}

const components = {
  a: MdxLink,
  h2: (props: ComponentPropsWithoutRef<'h2'>) => <Heading level={2} {...props} />,
  h3: (props: ComponentPropsWithoutRef<'h3'>) => <Heading level={3} {...props} />,
};

export async function MDXContent({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, {
    Fragment,
    ...(runtime as Record<string, unknown>),
    development: false,
  });

  return (
    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-light prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:text-neutral-400 prose-p:leading-relaxed prose-li:text-neutral-400 prose-a:text-white prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-neutral-300 prose-strong:text-white prose-blockquote:border-neutral-800 prose-blockquote:text-neutral-400 prose-hr:border-neutral-800 prose-table:text-sm prose-th:text-neutral-300 prose-td:text-neutral-400 prose-th:border-neutral-800 prose-td:border-neutral-800">
      <Content components={components} />
    </div>
  );
}
