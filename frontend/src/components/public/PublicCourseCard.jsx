import React from "react";
import { BookOpen, Clock, Target, Layers } from "lucide-react";
import { Link } from "react-router-dom";

const PublicCourseCard = ({ course }) => {
  // Calculate total estimated time (10 min per lesson)
  const estimatedTime = course.lessons?.length * 10 || 0;

  // Calculate total objectives across all lessons
  const totalObjectives =
    course.lessons?.reduce(
      (sum, lesson) => sum + (lesson.lesson_learning_objectives?.length || 0),
      0,
    ) || 0;

  return (
    <Link to={`/courses/${course.id}`} className="block group">
      <div className="h-full flex flex-col bg-white rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 overflow-hidden">
        {/* Course Image/Icon - Reduced height */}
        <div className="h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>

        {/* Course Content - Reduced padding */}
        <div className="p-4">
          {/* Course Title - Smaller font */}
          <h3 className="text-base font-black text-gray-900 mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {course.course_name}
          </h3>

          {/* Course Description - Reduced margin */}
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {course.course_description}
          </p>

          {/* Stats - Inline compact layout */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Lessons Count */}
            <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
              <BookOpen
                className="w-4 h-4 text-emerald-600"
                strokeWidth={2.5}
              />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                  Lessons
                </p>
                <p className="text-sm font-black text-gray-900">
                  {course.lessons?.length || 0}
                </p>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
              <Clock className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                  Duration
                </p>
                <p className="text-sm font-black text-gray-900">
                  {estimatedTime}m
                </p>
              </div>
            </div>

            {/* Total Objectives */}
            <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
              <Target className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                  Objectives
                </p>
                <p className="text-sm font-black text-gray-900">
                  {totalObjectives}
                </p>
              </div>
            </div>

            {/* Course Goals */}
            <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
              <Layers className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                  Goals
                </p>
                <p className="text-sm font-black text-gray-900">
                  {course.course_learning_objectives?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Learning Objectives Preview - More compact */}
          {course.course_learning_objectives?.length > 0 && (
            <div className="border-t-2 border-gray-200 pt-2.5">
              <div className="flex items-center gap-1 mb-1.5">
                <Target className="w-3.5 h-3.5 text-gray-700" />
                <span className="text-[10px] font-bold text-gray-700 uppercase">
                  What you'll learn
                </span>
              </div>
              <ul className="space-y-0.5">
                {course.course_learning_objectives
                  .slice(0, 2)
                  .map((objective, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-1.5 text-[11px] text-gray-600"
                    >
                      <span className="text-emerald-600 mt-0.5 font-bold text-xs">
                        ✓
                      </span>
                      <span className="line-clamp-1">{objective}</span>
                    </li>
                  ))}
              </ul>
              {course.course_learning_objectives.length > 2 && (
                <p className="text-[10px] text-emerald-600 font-bold mt-1.5">
                  +{course.course_learning_objectives.length - 2} more
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PublicCourseCard;
