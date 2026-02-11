import React from "react";
import { BookOpen } from "lucide-react";

const LearningObjectives = ({ objectives }) => {
  return (
    <div className="bg-yellow-100 border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" /> Learning Objectives
      </h3>
      <ul className="space-y-3">
        {objectives?.map((objective, idx) => (
          <li
            key={idx}
            className="flex gap-3 text-xs font-bold text-gray-800 leading-tight"
          >
            <span className="text-black shrink-0">{idx + 1}.</span>
            {objective}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LearningObjectives;
