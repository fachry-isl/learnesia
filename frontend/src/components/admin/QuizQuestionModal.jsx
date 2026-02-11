import React, { useEffect, useState } from "react";
import { X, RefreshCw, Plus, Trash2 } from "lucide-react";
import { useQuizQuestionModal } from "../../contexts/QuizQuestionModalContext";

const QuizQuestionModal = ({ lessonName, onAddQuestionForm }) => {
  const { isQuizModalOpen, setIsQuizModalOpen, questionData } =
    useQuizQuestionModal();
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { option_text: "", isCorrect: false },
    { option_text: "", isCorrect: false },
    { option_text: "", isCorrect: false },
    { option_text: "", isCorrect: false },
  ]);

  const clearForm = () => {
    setOptions([
      { option_text: "", isCorrect: false },
      { option_text: "", isCorrect: false },
      { option_text: "", isCorrect: false },
      { option_text: "", isCorrect: false },
    ]);

    setQuestionText("");
  };

  //console.log("Question Data", questionData);

  useEffect(() => {
    //console.log("UseEffect QuizQuestionModal Triggered");
    clearForm();

    if (questionData) {
      setQuestionText(questionData.question_text);
      setOptions(questionData.options);
    }
  }, [questionData, isQuizModalOpen]);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;

    // If setting this as correct, unset others
    if (field === "isCorrect" && value === true) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }

    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { option_text: "", isCorrect: false }]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();

    // Validation: Ensure at least one correct answer is selected
    if (!options.some((opt) => opt.isCorrect)) {
      alert("Please mark at least one option as the correct answer.");
      return;
    }

    setIsAdding(true);
    try {
      const questionData = {
        question_text: questionText,
        options: options.map((opt) => ({
          option_text: opt.option_text,
          is_correct: opt.isCorrect,
        })),
      };

      // await onAddQuestionForm(questionData);
      onAddQuestionForm(questionData);

      console.log(questionData);

      // Reset form
      setQuestionText("");
      setOptions([
        { option_text: "", isCorrect: false },
        { option_text: "", isCorrect: false },
        { option_text: "", isCorrect: false },
        { option_text: "", isCorrect: false },
      ]);

      setIsQuizModalOpen(false); // Close modal on success
    } catch (error) {
      console.error("Failed to add question:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const isFormValid =
    questionText.trim() !== "" &&
    options.length >= 2 &&
    options.every((opt) => opt.option_text.trim() !== "") &&
    options.some((opt) => opt.isCorrect);

  if (!isQuizModalOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => setIsQuizModalOpen(false)}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-yellow-400 border-b-4 border-black">
            <h2 className="text-xl font-black uppercase">Quiz Question</h2>
            <button
              onClick={() => setIsQuizModalOpen(false)}
              className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-black"
              disabled={isAdding}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddQuestion}>
            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="font-bold text-sm">
                Quiz questions for:{" "}
                <span className="text-blue-600">{lessonName}</span>
              </p>

              {isAdding ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <RefreshCw className="w-12 h-12 animate-spin" />
                  <p className="font-bold text-sm uppercase">
                    Adding quiz question...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Question Input */}
                  <div>
                    <label className="font-bold text-sm mb-2 block">
                      Question
                    </label>
                    <input
                      required
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="border-2 border-black p-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="What is the purpose of Life?"
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-sm">Options</label>
                      <button
                        onClick={addOption}
                        className="flex items-center gap-1 px-2 py-1 bg-green-400 border-2 border-black text-xs font-bold hover:bg-green-500 active:translate-x-[2px] active:translate-y-[2px] transition-transform"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                        ADD
                      </button>
                    </div>

                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            required
                            type="text"
                            value={option.option_text}
                            onChange={(e) =>
                              handleOptionChange(
                                index,
                                "option_text",
                                e.target.value,
                              )
                            }
                            className="border-2 border-black p-2 flex-1 focus:outline-none"
                            placeholder={`Option ${index + 1}`}
                          />

                          {/* Correct Answer Checkbox */}
                          <button
                            onClick={() =>
                              handleOptionChange(
                                index,
                                "isCorrect",
                                !option.isCorrect,
                              )
                            }
                            className={`px-3 border-2 border-black font-bold text-xs transition-colors ${
                              option.isCorrect
                                ? "bg-green-400"
                                : "bg-white hover:bg-gray-100"
                            }`}
                            title="Mark as correct answer"
                            type="button"
                          >
                            ✓
                          </button>

                          {/* Remove button */}
                          {options.length > 2 && (
                            <button
                              onClick={() => removeOption(index)}
                              className="px-2 bg-red-400 border-2 border-black hover:bg-red-500 transition-colors"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Click ✓ to mark the correct answer
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t-4 border-black bg-gray-50">
              <button
                type="button"
                onClick={() => setIsQuizModalOpen(false)}
                className="flex-1 py-2 bg-white border-2 border-black font-bold hover:bg-gray-100 transition-colors active:translate-x-[2px] active:translate-y-[2px]"
                disabled={isAdding}
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-black text-white border-2 border-black font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px]"
                disabled={isAdding || !isFormValid}
              >
                {isAdding ? "ADDING..." : "SUBMIT QUESTION"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default QuizQuestionModal;
