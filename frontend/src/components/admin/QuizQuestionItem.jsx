import { GripVertical, Check, X } from "lucide-react";
import { useQuizQuestionModal } from "../../contexts/QuizQuestionModalContext";

const QuizQuestionItem = ({
  question,
  questionNumber,
  onQuizEditCallbackHandler,
  onDeleteCallback,
}) => {
  const { setIsQuizModalOpen, setQuestionData } = useQuizQuestionModal();

  const onEditCallback = () => {
    console.log("OnEditQuestion: ", question);
    setQuestionData(question);
    setIsQuizModalOpen(true);
  };

  const onDelete = () => {
    console.log("OnDelete: ", question);
    onDeleteCallback(question.id);
  };

  return (
    <div className="border-2 border-black mb-3 bg-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow">
      {/* Question Header */}
      <div className="flex items-start gap-2 p-3 border-b-2 border-black bg-gray-50">
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          <span className="font-black text-xs bg-black text-white px-2 py-1">
            {questionNumber}
          </span>
          <p className="font-bold text-sm flex-1">{question.question_text}</p>
        </div>

        <div className="flex gap-1">
          <button
            className="cursor-pointer border-2 border-black bg-white hover:bg-yellow-400 w-8 h-8 flex items-center justify-center transition-colors"
            onClick={onEditCallback}
            title="Edit question"
          >
            ✏️
          </button>
          <button
            className="cursor-pointer border-2 border-black bg-white hover:bg-red-400 w-8 h-8 flex items-center justify-center transition-colors"
            onClick={onDelete}
            title="Delete question"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Answer Options Preview */}
      <div className="p-3 space-y-2">
        {question.options?.map((option, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 text-xs p-2 border ${
              option.is_correct
                ? "border-green-600 bg-green-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            {option.is_correct ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-gray-400" />
            )}
            <span className="font-mono font-bold mr-1">
              {String.fromCharCode(65 + idx)}.
            </span>
            <span className={option.is_correct ? "font-semibold" : ""}>
              {option.option_text}
            </span>
          </div>
        ))}
      </div>

      {/* Question Metadata */}
      <div className="flex items-center gap-3 px-3 pb-2 text-[10px] text-gray-500">
        <span className="font-bold">
          TYPE: {question.question_type?.toUpperCase() || "MULTIPLE CHOICE"}
        </span>
        {question.points && (
          <span className="font-bold">POINTS: {question.points}</span>
        )}
        {question.difficulty && (
          <span
            className={`font-bold px-2 py-0.5 ${
              question.difficulty === "easy"
                ? "bg-green-200"
                : question.difficulty === "medium"
                  ? "bg-yellow-200"
                  : "bg-red-200"
            }`}
          >
            {question.difficulty.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

export default QuizQuestionItem;
