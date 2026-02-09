/* frontend/src/components/SidebarLessonItem.jsx */
import React from "react";
import { FileText } from "lucide-react"; // Example icon

const SidebarLessonItem = ({ lesson_name, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-left text-sm font-medium
         ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"}`}
    >
      <FileText className="w-4 h-4 shrink-0" />
      <span>{lesson_name}</span>
    </button>
  );
};

export default SidebarLessonItem;
