import React from "react";
import { FileText, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface SidebarLessonItemProps {
  lesson_name: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const SidebarLessonItem: React.FC<SidebarLessonItemProps> = ({
  lesson_name,
  isActive,
  onClick,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  return (
    <div
      className={`group w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out text-left text-sm font-medium
         ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"}`}
    >
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-3 py-1 overflow-hidden"
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span className="truncate">{lesson_name}</span>
      </button>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!isFirst && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            className="p-1 hover:bg-gray-700 rounded text-gray-300"
            title="Move Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        )}
        {!isLast && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            className="p-1 hover:bg-gray-700 rounded text-gray-300"
            title="Move Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-900/50 hover:text-red-400 rounded text-gray-400"
          title="Delete Lesson"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SidebarLessonItem;
