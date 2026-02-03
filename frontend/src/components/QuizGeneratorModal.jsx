import React, { useState } from "react";
import { X, RefreshCw } from "lucide-react";

const QuizGeneratorModal = ({ isOpen, onClose, lessonName, onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-yellow-400 border-b-4 border-black">
            <h2 className="text-xl font-black uppercase">Generate Quiz</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-black"
              disabled={isGenerating}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="font-bold text-sm">
              Generate quiz questions for:{" "}
              <span className="text-blue-600">{lessonName}</span>
            </p>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <RefreshCw className="w-12 h-12 animate-spin" />
                <p className="font-bold text-sm uppercase">
                  Generating quiz questions...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 border-2 border-black p-4">
                  <p className="text-xs font-bold">
                    AI will generate multiple-choice questions based on the
                    lesson content.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 border-t-4 border-black bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-white border-2 border-black font-bold hover:bg-gray-100 transition-colors"
              disabled={isGenerating}
            >
              CANCEL
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 py-2 bg-black text-white border-2 border-black font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGenerating}
            >
              {isGenerating ? "GENERATING..." : "GENERATE"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizGeneratorModal;
