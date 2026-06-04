"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

export default function ExerciseBlock({ prompt, sampleSolution, hints = [] }) {
  const [showSolution, setShowSolution] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const hasHints = hints?.length > 0;

  return (
    <div className="my-8 border-2 border-black rounded-2xl p-6 md:p-8 bg-amber-50/50">
      <p className="text-xs font-black uppercase tracking-widest text-amber-800 mb-3">
        Exercise
      </p>
      <p className="text-lg font-bold text-gray-900 leading-relaxed whitespace-pre-wrap">
        {prompt}
      </p>

      {hasHints ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setHintsOpen((open) => !open)}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black"
          >
            <Lightbulb className="w-4 h-4" />
            {hintsOpen ? "Hide hints" : "Show hints"}
            {hintsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {hintsOpen ? (
            <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-gray-700">
              {hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {sampleSolution ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowSolution((open) => !open)}
            className="px-4 py-2 text-sm font-black uppercase tracking-wider border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
          >
            {showSolution ? "Hide solution" : "Show solution"}
          </button>
          {showSolution ? (
            <pre className="mt-4 p-4 bg-white border-2 border-gray-200 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
              {sampleSolution}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
