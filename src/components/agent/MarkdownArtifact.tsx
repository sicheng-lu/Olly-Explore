import type { MarkdownArtifactData } from '../../data/agent-mock-dialogs';

interface MarkdownArtifactProps {
  config: MarkdownArtifactData;
}

export function MarkdownArtifact({ config }: MarkdownArtifactProps) {
  const { title, content } = config;
  const blocks = parseMarkdown(content);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 px-1">{title}</h3>
      <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-slate-700 bg-slate-900/50 p-5">
        <div className="prose-dark space-y-3">
          {blocks.map((block, i) => (
            <MarkdownBlock key={i} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}

type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'p'; text: string };

function parseMarkdown(content: string): Block[] {
  const lines = content.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4) });
      i++;
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3) });
      i++;
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2) });
      i++;
    } else if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
    } else if (line.trim() === '') {
      i++;
    } else {
      blocks.push({ type: 'p', text: line });
      i++;
    }
  }
  return blocks;
}

function InlineText({ text }: { text: string }) {
  // Process inline formatting: bold, italic, inline code
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-sm font-mono">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-slate-100">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      parts.push(<em key={match.index} className="italic text-slate-300">{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}

function MarkdownBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'h1':
      return <h1 className="text-xl font-bold text-slate-100"><InlineText text={block.text} /></h1>;
    case 'h2':
      return <h2 className="text-lg font-semibold text-slate-100 mt-4"><InlineText text={block.text} /></h2>;
    case 'h3':
      return <h3 className="text-base font-semibold text-slate-200 mt-3"><InlineText text={block.text} /></h3>;
    case 'ul':
      return (
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
          {block.items.map((item, i) => (
            <li key={i}><InlineText text={item} /></li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
          {block.items.map((item, i) => (
            <li key={i}><InlineText text={item} /></li>
          ))}
        </ol>
      );
    case 'p':
      return <p className="text-sm text-slate-300 leading-relaxed"><InlineText text={block.text} /></p>;
  }
}
