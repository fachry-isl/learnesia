"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { getSortedModules } from "@/utils/courseHelpers";

export default function CourseSyllabus({
  courseSlug,
  modules,
  defaultExpandedModuleId,
  onStartLearning,
}) {
  const sortedModules = getSortedModules(modules);
  const [expandedModules, setExpandedModules] = useState(() => {
    const initial = {};
    if (defaultExpandedModuleId != null) {
      initial[defaultExpandedModuleId] = true;
    } else if (sortedModules[0]) {
      initial[sortedModules[0].id] = true;
    }
    return initial;
  });

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const firstLesson = sortedModules[0]?.lessons?.[0];

  return (
    <div className="space-y-4">
      {sortedModules.map((module) => {
        const isExpanded = expandedModules[module.id];
        return (
          <div
            key={module.id}
            className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-colors shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleModule(module.id)}
              aria-expanded={isExpanded}
              className={`w-full flex items-center justify-between p-6 text-left transition-colors ${isExpanded ? "bg-blue-50/20" : "bg-white"}`}
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">{module.name}</h3>
                {module.description ? (
                  <p className="text-sm text-gray-500 font-medium">{module.description}</p>
                ) : null}
                <p className="text-xs font-bold font-space text-gray-400">
                  {module.lessons?.length ?? 0} lesson
                  {(module.lessons?.length ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="p-6 pt-0 space-y-3 bg-white border-t border-gray-100">
                {module.lessons?.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/course/${courseSlug}/lesson/${lesson.lesson_slug}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 group-hover:underline">
                        {lesson.lesson_name}
                      </p>
                      <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                        <Clock className="w-3 h-3" />
                        {lesson.estimated_time} min
                      </span>
                    </div>
                    <PlayCircle className="w-5 h-5 text-gray-300 group-hover:text-black shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {onStartLearning && firstLesson ? (
        <div className="pt-6">
          <button
            type="button"
            onClick={() => onStartLearning(firstLesson)}
            className="w-full py-4 bg-black text-white font-black rounded-xl shadow-xl shadow-gray-200 hover:bg-gray-900 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            Start Learning
          </button>
        </div>
      ) : null}
    </div>
  );
}
