import React from "react";
import { BookOpen, Clock, Target, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../assets/li_logo_full.png";

const PublicCourseCard = ({ course, onCourseClick }) => {
  // Calculate total estimated time (10 min per lesson)
  const estimatedTime = course.lessons?.length * 10 || 0;

  // Calculate total objectives across all lessons
  const totalObjectives =
    course.lessons?.reduce(
      (sum, lesson) => sum + (lesson.lesson_learning_objectives?.length || 0),
      0,
    ) || 0;

  const onCourseClicked = () => {
    onCourseClick(course);
  };

  return (
    <div
      onClick={onCourseClicked}
      className="h-full flex flex-col bg-white rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 overflow-hidden"
    >
      {/* Course Image/Icon - Reduced height */}
      <div className="h-40 bg-white flex items-center justify-center border-b-4 border-black p-4">
        {course.image ? (
          <img
            src={course.image}
            alt={course.course_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={Logo}
            alt="Learnesia Logo"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Course Content - Reduced padding */}
      <div className="flex flex-col flex-1 p-4">
        {/* Course Title */}
        <h3 className="text-base font-black text-gray-900 mb-1.5 line-clamp-2 group-hover:text-black transition-colors">
          {course.course_name}
        </h3>

        {/* Course Description - grows to push stats down */}
        <p className="text-xs text-gray-600 mb-3 flex-1">
          {course.course_description}
        </p>

        {/* Stats - Inline compact layout */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          {/* Lessons Count */}
          <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
            <BookOpen className="w-4 h-4 text-black-600" strokeWidth={2.5} />
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
            <Clock className="w-4 h-4 text-black" strokeWidth={2.5} />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                Duration
              </p>
              <p className="text-sm font-black text-gray-900">
                {course.estimated_time}m
              </p>
            </div>
          </div>

          {/* Total Objectives */}
          <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
            <Target className="w-4 h-4 text-black" strokeWidth={2.5} />
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
            <Layers className="w-4 h-4 text-black" strokeWidth={2.5} />
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
      </div>
    </div>
  );
};

export default PublicCourseCard;
