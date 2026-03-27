import React, { createContext, useContext, useState, ReactNode } from "react";
import { QuizQuestion } from "../types";

interface QuizQuestionModalContextType {
  isQuizModalOpen: boolean;
  setIsQuizModalOpen: (isOpen: boolean) => void;
  questionData: QuizQuestion | null;
  setQuestionData: (data: QuizQuestion | null) => void;
}

const QuizQuestionModalContext = createContext<
  QuizQuestionModalContextType | undefined
>(undefined);

export const useQuizQuestionModal = () => {
  const context = useContext(QuizQuestionModalContext);
  if (!context) {
    throw new Error("useQuestion must be used within QuizQuestionProvider");
  }

  return context;
};

interface QuizQuestionModalProviderProps {
  children: ReactNode;
}

export const QuizQuestionModalProvider: React.FC<
  QuizQuestionModalProviderProps
> = ({ children }) => {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [questionData, setQuestionData] = useState<QuizQuestion | null>(null);

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
