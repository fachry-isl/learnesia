import React from "react";
import { RefreshCw } from "lucide-react";

const LessonActions = ({ onGenerateLesson, onClickTurnToDraft }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-blue-50 border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" /> AI Engine
        </h3>
        <div className="space-y-3">
          <button
            onClick={onGenerateLesson}
            className="bg-white text-black w-full py-2 border-2 border-black font-bold text-sm cursor-pointer hover:text-white hover:bg-blue-500"
          >
            Generate Lesson
          </button>
        </div>
      </div>

      <div className="border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
        <div className="space-y-3">
          <button
            onClick={onClickTurnToDraft}
            className="bg-white text-black w-full py-2 border-2 border-black font-bold text-sm cursor-pointer hover:text-white hover:bg-blue-500"
          >
            Turn to Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonActions;
