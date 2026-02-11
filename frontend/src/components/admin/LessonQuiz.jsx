import React from "react";
import { Info, Sparkles, Plus, AlertCircle } from "lucide-react";
import QuizQuestionItem from "./QuizQuestionItem";
import QuizQuestionModal from "./QuizQuestionModal";

const LessonQuiz = ({
  quizzes,
  onQuizEdit,
  onQuizDelete,
  isLoadQuiz,
  lessonName,
  onGenerateQuiz,
  onAddQuestionButton,
  onAddQuestionForm,
}) => {
  const onAddQuestion = () => {
    onAddQuestionButton();
  };

  // if (quizzes) {
  //   console.log("Quizzes on LessonQuiz:", quizzes);
  //   console.log("Quizzes Question on LessonQuiz:", quizzes[0].questions);
  // }

  // console.log("Quizzes on LessonQuiz Index 0:", quizzes[0]);
  // console.log(
  //   "Quizzes on LessonQuiz Index 0 and Questions:",
  //   quizzes[0].questions,
  // );

  const onAddQuestionFormCallback = (questionData) => {
    onAddQuestionForm(questionData);
  };
  const totalQuestions = quizzes?.questions?.length || 0;
  const totalPoints =
    quizzes?.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;

  return (
    <>
      <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {/* Header with Stats */}
        <div className="mb-4">
          <h3 className="text-lg font-black uppercase mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" /> Quiz
          </h3>

          {totalQuestions > 0 ? (
            <div className="flex gap-3 text-xs">
              <div className="bg-black text-white px-3 py-1 font-bold">
                {totalQuestions} QUESTION{totalQuestions !== 1 ? "S" : ""}
              </div>
              <div className="bg-gray-200 border-2 border-black px-3 py-1 font-bold">
                {totalPoints} POINTS
              </div>
            </div>
          ) : (
            <div>
              {isLoadQuiz ? (
                <div className="text-black">Loading Quiz...</div>
              ) : (
                <div className="flex items-start gap-2 bg-yellow-50 border-2 border-yellow-400 p-3 text-xs">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-800 font-medium">
                    No quiz questions yet. Add questions manually or generate
                    with AI.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-5">
          <button
            onClick={onAddQuestion}
            className="bg-white text-black w-full py-2.5 border-2 border-black font-bold text-sm cursor-pointer hover:bg-blue-400 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Question Manually
          </button>

          <button
            onClick={onGenerateQuiz}
            className="bg-black text-white w-full py-2.5 border-2 border-black font-bold text-sm cursor-pointer hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Quiz with AI
          </button>
        </div>

        {/* Questions List */}
        {totalQuestions > 0 && (
          <div className="space-y-0">
            <div className="text-[10px] font-black text-gray-500 mb-2 tracking-wider">
              QUESTIONS ({totalQuestions})
            </div>
            {quizzes?.questions.map((question, idx) => {
              // Return the component
              // console.log("Question", question);
              return (
                <QuizQuestionItem
                  key={idx}
                  question={question}
                  questionNumber={idx + 1}
                  onQuizEditCallbackHandler={onQuizEdit}
                  onDeleteCallback={onQuizDelete}
                />
              );
            })}
          </div>
        )}
      </div>

      <QuizQuestionModal
        lessonName={lessonName}
        onAddQuestionForm={onAddQuestionFormCallback}
      />
    </>
  );
};

export default LessonQuiz;
