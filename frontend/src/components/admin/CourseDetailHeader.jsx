import React from "react";
import { Save } from "lucide-react";

const CourseDetailHeader = ({
  lessonName,
  courseName,
  lessonId,
  isEditing,
  setIsEditing,
  onSaveChanges,
}) => {
  return (
    <header className="flex justify-between items-center mb-6 bg-white border-b-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">
          {lessonName}
        </h1>
        <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
          Course: {courseName} <span className="text-black">•</span> ID:{" "}
          {lessonId}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 border-2 border-black font-bold transition-all active:translate-y-1 ${isEditing ? "bg-yellow-400" : "bg-white hover:bg-gray-100"}`}
        >
          {isEditing ? "VIEW PREVIEW" : "EDIT CONTENT"}
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black font-bold hover:bg-gray-800 transition-all active:translate-y-1"
          onClick={onSaveChanges}
        >
          <Save className="w-4 h-4" /> SAVE CHANGES
        </button>
      </div>
    </header>
  );
};

export default CourseDetailHeader;
