function renderInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const italicMatch = remaining.match(/_(.+?)_/);

    const matches = [
      boldMatch && { type: "bold", match: boldMatch, index: boldMatch.index },
      codeMatch && { type: "code", match: codeMatch, index: codeMatch.index },
      italicMatch && { type: "italic", match: italicMatch, index: italicMatch.index },
    ].filter(Boolean);

    if (matches.length === 0) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    matches.sort((a, b) => a.index - b.index);
    const first = matches[0];

    if (first.index > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, first.index)}</span>);
    }

    if (first.type === "bold") {
      parts.push(<strong key={key++} className="font-semibold">{first.match[1]}</strong>);
      remaining = remaining.slice(first.index + first.match[0].length);
    } else if (first.type === "code") {
      parts.push(
        <code key={key++} className="rounded bg-slate-200/70 px-1.5 py-0.5 text-xs font-mono text-violet-800">
          {first.match[1]}
        </code>
      );
      remaining = remaining.slice(first.index + first.match[0].length);
    } else {
      parts.push(<em key={key++} className="italic text-slate-600">{first.match[1]}</em>);
      remaining = remaining.slice(first.index + first.match[0].length);
    }
  }

  return parts;
}

function parseTable(lines, baseTextClass) {
  if (lines.length < 2) return null;
  const header = lines[0].split("|").map((c) => c.trim()).filter(Boolean);
  const rows = lines.slice(2).map((line) =>
    line.split("|").map((c) => c.trim()).filter(Boolean)
  );
  if (header.length === 0) return null;

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            {header.map((h, i) => (
              <th key={i} className={`px-4 py-2 text-left font-semibold ${baseTextClass}`}>{renderInline(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-slate-100">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-4 py-2 ${baseTextClass}`}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownMessage({ content, className = "" }) {
  if (!content) return null;

  const baseTextClass = className.trim() ? className : "text-slate-800";
  const lines = content.split("\n");
  const elements = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={key++} className="my-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-green-300">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].includes("---")) {
      const tableLines = [line];
      i++;
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const table = parseTable(tableLines, baseTextClass);
      if (table) elements.push(<div key={key++}>{table}</div>);
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mb-2 mt-3 text-base font-bold text-slate-900">
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mb-2 mt-3 text-lg font-bold text-slate-900">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={key++} className={`ml-4 list-disc text-sm ${baseTextClass}`}>
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className={`text-sm leading-relaxed ${baseTextClass}`}>
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}
