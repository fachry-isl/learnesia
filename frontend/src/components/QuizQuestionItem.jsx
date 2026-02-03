import React from "react";

const QuizQuestionItem = ({ question, onQuizEditCallbackHandler }) => {
  const onEditCallback = () => {
    onQuizEditCallbackHandler();
  };
  return (
    <div className="flex flex-row border-2 border-black mb-2">
      <div className="font-bold text-sm p-3">{question.question_text}</div>
      <div className="flex mb-5 mt-2 mr-2">
        <button
          className="border-black border-2 cursor-pointer w-10 mr-1"
          onClick={onEditCallback}
        >
          ✏️
        </button>
        <button className="border-black border-2 cursor-pointer w-10">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default QuizQuestionItem;
