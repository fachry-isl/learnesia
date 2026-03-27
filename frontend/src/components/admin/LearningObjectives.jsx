import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, Edit2, Check, X } from "lucide-react";

const LearningObjectives = ({
  objectives,
  onUpdate,
  isEditing: globalIsEditing,
}) => {
  const [localObjectives, setLocalObjectives] = useState(objectives || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setLocalObjectives(objectives || []);
  }, [objectives]);

  const handleAdd = () => {
    const newObjectives = [...localObjectives, "New Objective"];
    setLocalObjectives(newObjectives);
    onUpdate(newObjectives);
    setEditingIndex(newObjectives.length - 1);
    setEditValue("New Objective");
  };

  const handleRemove = (index) => {
    const newObjectives = localObjectives.filter((_, i) => i !== index);
    setLocalObjectives(newObjectives);
    onUpdate(newObjectives);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditValue(localObjectives[index]);
  };

  const handleSaveEdit = () => {
    const newObjectives = [...localObjectives];
    newObjectives[editingIndex] = editValue;
    setLocalObjectives(newObjectives);
    onUpdate(newObjectives);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <div className="bg-yellow-100 border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black uppercase flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Learning Objectives
        </h3>
        {globalIsEditing && (
          <button
            onClick={handleAdd}
            className="p-1 bg-black text-white hover:bg-gray-800 transition-colors"
            title="Add Objective"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      <ul className="space-y-3">
        {localObjectives?.map((objective, idx) => (
          <li
            key={idx}
            className="group flex gap-3 text-xs font-bold text-gray-800 leading-tight items-start"
          >
            <span className="text-black shrink-0 mt-0.5">{idx + 1}.</span>
            {editingIndex === idx ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 bg-white border-2 border-black px-2 py-1 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="text-green-600 hover:text-green-800"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1">{objective}</span>
                {globalIsEditing && (
                  <div className="hidden group-hover:flex gap-2 shrink-0">
                    <button
                      onClick={() => handleStartEdit(idx)}
                      className="text-black hover:text-gray-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LearningObjectives;
