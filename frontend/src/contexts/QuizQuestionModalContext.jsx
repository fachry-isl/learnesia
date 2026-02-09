import { createContext, useContext } from "react";
import { useState } from "react";

const QuizQuestionModalContext = createContext();

export const useQuizQuestionModal = () => {
  const context = useContext(QuizQuestionModalContext);
  if (!context) {
    throw new Error("useQuestion must be used within QuizQuestionProvider");
  }

  return context;
};

export const QuizQuestionModalProvider = ({ children }) => {
  // Decide whether Modal should be opened
  // Closed by default
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Question data - Usefull for edit
  const [questionData, setQuestionData] = useState(null);

  return (
    <QuizQuestionModalContext.Provider
      value={{
        isQuizModalOpen,
        setIsQuizModalOpen,
        questionData,
        setQuestionData,
      }}
    >
      {children}
    </QuizQuestionModalContext.Provider>
  );
};
