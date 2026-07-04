/**
 * RichText - Renders plain text with simple formatting:
 * - Lines starting with "- " or "• " become bullet points
 * - Text wrapped in **double asterisks** becomes bold
 * - Line breaks (\n) are preserved
 */
const RichText = ({ text, className = '' }) => {
  if (!text) return null;

  // Parse inline bold: **text** -> <strong>text</strong>
  const parseInline = (line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${lineIdx}-${i}`} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={`${lineIdx}-${i}`}>{part}</span>;
    });
  };

  const lines = text.split('\n');
  const elements = [];
  let bulletBuffer = [];

  const flushBullets = () => {
    if (bulletBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1.5 my-2">
          {bulletBuffer.map((b, i) => (
            <li key={i} className="leading-relaxed">{parseInline(b, `b${elements.length}-${i}`)}</li>
          ))}
        </ul>
      );
      bulletBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Bullet point lines
    if (trimmed.startsWith('- ') || trimmed.startsWith('\u2022 ')) {
      bulletBuffer.push(trimmed.replace(/^[-\u2022]\s*/, ''));
      return;
    }

    // Flush any pending bullets before a non-bullet line
    flushBullets();

    // Empty line = spacing
    if (trimmed === '') {
      elements.push(<br key={`br-${idx}`} />);
      return;
    }

    // Regular paragraph line
    elements.push(
      <p key={`p-${idx}`} className="mb-1">{parseInline(trimmed, idx)}</p>
    );
  });

  // Flush any remaining bullets
  flushBullets();

  return <div className={className}>{elements}</div>;
};

export default RichText;
