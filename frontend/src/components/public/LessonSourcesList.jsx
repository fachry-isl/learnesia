function CitationList({ items }) {
  return (
    <ol className="space-y-3 list-decimal pl-5">
      {items.map((citation) => (
        <li key={citation.id} className="text-sm font-medium text-gray-700">
          <a
            href={citation.reference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-gray-900 hover:underline"
          >
            {citation.reference.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function LessonSourcesList({ citations = [], supplementary = [] }) {
  const sortedCitations = [...citations].sort((a, b) => a.order - b.order);
  const sortedSupplementary = [...supplementary].sort((a, b) => a.order - b.order);

  if (!sortedCitations.length && !sortedSupplementary.length) {
    return null;
  }

  return (
    <footer className="mt-16 pt-10 border-t-2 border-gray-100 space-y-10">
      {sortedCitations.length > 0 ? (
        <section>
          <h2 className="text-xl font-black text-gray-900 mb-4">Sources</h2>
          <CitationList items={sortedCitations} />
        </section>
      ) : null}
      {sortedSupplementary.length > 0 ? (
        <section>
          <h2 className="text-xl font-black text-gray-900 mb-4">Further Reading</h2>
          <CitationList items={sortedSupplementary} />
        </section>
      ) : null}
    </footer>
  );
}
