import React from "react";
import { Info } from "lucide-react";
import QuizQuestionItem from "./QuizQuestionItem";
import QuizGeneratorModal from "./QuizGeneratorModal";

const LessonQuiz = ({
  quizzes,
  onQuizEdit,
  isModalOpen,
  onCloseModal,
  lessonName,
  onGenerateQuiz,
  onAddQuestionCallback,
}) => {
  const onAddQuestion = () => {
    onAddQuestionCallback();
  };
  return (
    <>
      <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" /> Quiz
        </h3>

        <button
          onClick={onAddQuestion}
          className="bg-white text-black w-full py-2 border-2 border-black font-bold text-sm cursor-pointer hover:text-white hover:bg-yellow-500 mb-5"
        >
          ➕ Add Question
        </button>

        <button className="bg-black text-white w-full py-2 border-2 border-black font-bold text-sm cursor-pointer hover:text-white hover:bg-yellow-500 mb-5">
          ✨ Generate Quiz
        </button>

        {quizzes?.questions?.map((question, idx) => (
          <QuizQuestionItem
            key={idx}
            question={question}
            onQuizEditCallbackHandler={onQuizEdit}
          />
        ))}
      </div>

      <QuizGeneratorModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        lessonName={lessonName}
        onGenerate={onGenerateQuiz}
      />
    </>
  );
};

export default LessonQuiz;
