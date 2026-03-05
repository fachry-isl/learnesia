import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import YoutubeEmbed from "./YoutubeEmbed";

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
  // Youtube Renderer
  a: ({ href, children, ...props }) => {
    if (YoutubeEmbed.isYoutubeUrl(href)) {
      return <YoutubeEmbed url={href} />;
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
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
  h4: ({ children }) => (
    <h4 className="text-lg font-bold mb-2 mt-3">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-base font-bold mb-2 mt-2">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-sm font-bold mb-2 mt-2 uppercase">{children}</h6>
  ),

  // Custom paragraph styling - avoid extra margin in list items
  p: ({ children, node }) => {
    const parent = node?.position?.start?.column;
    if (parent && parent > 1) {
      return <span className="block">{children}</span>;
    }
    return <p className="mb-4 leading-relaxed">{children}</p>;
  },

  // Custom link styling
  // a: ({ href, children }) => (
  //   <a
  //     href={href}
  //     target="_blank"
  //     rel="noopener noreferrer"
  //     className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors"
  //   >
  //     {children}
  //   </a>
  // ),

  // Custom horizontal rule with proper spacing
  hr: () => <hr className="my-8 border-t-2 border-gray-300" />,

  // Custom list styling with proper nested list support
  ul: ({ children }) => (
    <ul className="list-disc ml-6 mb-4 space-y-2 [&>li]:ml-0 [&_ul]:mt-2 [&_ul]:mb-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-6 mb-4 space-y-2 [&>li]:ml-0 [&_ol]:mt-2 [&_ol]:mb-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="ml-0 pl-2">{children}</li>,

  // Custom blockquote styling - black UI match
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-black bg-gray-50 pl-4 py-2 my-4 italic text-gray-800">
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
  tr: ({ children }) => <tr>{children}</tr>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="border-2 border-black p-10 bg-white prose prose-slate max-w-none rounded-2xl">
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content ||
          "No content generated yet. Click 'Generate Lesson' to start."}
      </Markdown>
    </div>
  );
};

export default MarkdownRenderer;
