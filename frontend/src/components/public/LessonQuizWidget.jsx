import React, { useState } from "react";
import { CheckCircle, XCircle, Info, HelpCircle } from "lucide-react";

/**
 * A public-facing quiz widget for the lesson page.
 */
const LessonQuizWidget = ({ quiz, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const handleOptionSelect = (questionId, optionId) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      const selectedOptionId = answers[q.id];
      const selectedOption = q.options.find((o) => o.id === selectedOptionId);
      if (selectedOption && selectedOption.is_correct) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);

    if (correctCount === quiz.questions.length && onComplete) {
      onComplete(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div className="my-16 bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-3 mb-8 border-b-4 border-black pb-4">
        <div className="bg-black p-2 rounded-sm">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Check Your Knowledge
          </h2>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            {quiz.questions.length} Questions •{" "}
            {quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0)} Points
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {quiz.questions.map((question, qIdx) => {
          const selectedOptionId = answers[question.id];
          const isAnswered = selectedOptionId !== undefined;

          return (
            <div key={question.id} className="space-y-4">
              <div className="flex gap-4">
                <span className="shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-black text-sm">
                  {qIdx + 1}
                </span>
                <h3 className="text-lg font-bold leading-tight">
                  {question.question_text}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 ml-0 md:ml-12">
                {question.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  let optionClass =
                    "border-2 border-black p-4 font-bold transition-all text-left flex items-center justify-between ";

                  if (submitted) {
                    if (option.is_correct) {
                      optionClass +=
                        "bg-green-100 border-green-600 text-green-900 ";
                    } else if (isSelected && !option.is_correct) {
                      optionClass += "bg-red-100 border-red-600 text-red-900 ";
                    } else {
                      optionClass +=
                        "bg-gray-50 border-gray-200 text-gray-400 opacity-60 ";
                    }
                  } else {
                    optionClass += isSelected
                      ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] "
                      : "bg-white text-black hover:bg-gray-50 hover:translate-x-1 ";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(question.id, option.id)}
                      disabled={submitted}
                      className={optionClass}
                    >
                      <span>{option.option_text}</span>
                      {submitted && option.is_correct && (
                        <CheckCircle className="w-5 h-5 shrink-0" />
                      )}
                      {submitted && isSelected && !option.is_correct && (
                        <XCircle className="w-5 h-5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && question.explanation && (
                <div className="ml-0 md:ml-12 mt-4 bg-blue-50 border-2 border-blue-200 p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-blue-800">
                    <span className="font-bold uppercase text-[10px] tracking-widest block mb-1">
                      Explanation
                    </span>
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 pt-8 border-t-4 border-black flex flex-col items-center gap-6">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.questions.length}
            className={`px-12 py-4 font-black uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${
              Object.keys(answers).length === quiz.questions.length
                ? "bg-yellow-400 text-black hover:-translate-y-1"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
            }`}
          >
            Submit Quiz
          </button>
        ) : (
          <div className="w-full text-center space-y-6">
            <div className="inline-block bg-black text-white px-8 py-6 shadow-[8px_8px_0px_0px_rgba(255,193,7,1)]">
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-2 text-yellow-400">
                Your Result
              </p>
              <h4 className="text-5xl font-black">
                {score}{" "}
                <span className="text-2xl text-gray-400">
                  / {quiz.questions.length}
                </span>
              </h4>
              <p className="mt-2 text-sm font-bold">
                {score === quiz.questions.length
                  ? "Perfect Score! 🎉"
                  : score >= quiz.questions.length / 2
                    ? "Good Job! 👍"
                    : "Keep Learning! 💪"}
              </p>
            </div>

            <div>
              <button
                onClick={handleReset}
                className="text-xs font-black uppercase tracking-widest border-b-2 border-black hover:text-gray-500 hover:border-gray-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonQuizWidget;
