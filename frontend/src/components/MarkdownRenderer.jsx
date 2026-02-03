import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const markdownComponents = {
  // Custom code block with syntax highlighting
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="rounded-md my-4"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-300"
        {...props}
      >
        {children}
      </code>
    );
  },
  // Custom heading styles
  h1: ({ children }) => (
    <h1 className="text-3xl font-black uppercase mb-4 mt-6 border-b-4 border-black pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold uppercase mb-3 mt-5 border-b-2 border-gray-400 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>
  ),
  // Custom paragraph styling
  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  // Custom link styling
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors"
    >
      {children}
    </a>
  ),
  // Custom list styling
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
  ),
  // Custom blockquote styling
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-yellow-400 bg-yellow-50 pl-4 py-2 my-4 italic">
      {children}
    </blockquote>
  ),
  // Custom table styling
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-2 border-black">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-black text-white">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-2 border-black px-4 py-2 text-left font-bold uppercase text-sm">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-2 border-black px-4 py-2">{children}</td>
  ),
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-slate max-w-none">
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content ||
          "No content generated yet. Click 'Generate Lesson' to start."}
      </Markdown>
    </div>
  );
};

export default MarkdownRenderer;
