import { useState } from "react";
import CourseTemplateStructureInfo from "../components/CourseTemplateStructureInfo";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Target,
  Layers,
  FileEdit,
  CheckCircle2,
} from "lucide-react";

const CourseCardItem = ({
  course,
  isonClickActive,
  onCourseCardClickCallback,
}) => {
  const [expandedCourseObjectives, setExpandedCourseObjectives] = useState({});
  const [expandedLessonObjectives, setExpandedLessonObjectives] = useState({});

  const onCourseCardClick = () => {
    onCourseCardClickCallback(course);
  };

  const toggleCourseObjectives = (courseId) => {
    setExpandedCourseObjectives((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const toggleLessonObjectives = (courseId, lessonIndex) => {
    const key = `${courseId}-${lessonIndex}`;
    setExpandedLessonObjectives((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Sort lessons by order column before finding
  const sortedLessons = course?.lessons
    ? [...course.lessons].sort((a, b) => a.order - b.order)
    : [];

  // Status badge configuration
  const statusConfig = {
    draft: {
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      dotColor: "bg-amber-400",
      icon: FileEdit,
      label: "Draft",
    },
    published: {
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      dotColor: "bg-emerald-400",
      icon: CheckCircle2,
      label: "Published",
    },
  };

  const currentStatus = statusConfig[course.status];
  const StatusIcon = currentStatus?.icon;

  return (
    <div
      key={course.id}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow ${isonClickActive ? "cursor-pointer" : ""}`}
      {...(isonClickActive && { onClick: onCourseCardClick })}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-gray-900" />
        </div>

        {/* Improved Status Badge */}
        {currentStatus && (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor}`}
          >
            {/* Animated status dot */}
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.dotColor} opacity-75`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${currentStatus.dotColor}`}
              ></span>
            </span>

            {/* Status icon */}
            <StatusIcon className="w-3.5 h-3.5" />

            {/* Status label */}
            <span className="text-xs font-semibold">{currentStatus.label}</span>
          </div>
        )}
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-1">
        {course.course_name}
      </h3>
      <p className="text-gray-600 text-xs mb-3">{course.course_description}</p>

      {/* Course Learning Objectives */}
      <div className="mb-3">
        <button
          onClick={() => toggleCourseObjectives(course.id)}
          className="w-full flex items-center justify-between p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-gray-900" />
            <span className="text-xs font-semibold text-gray-900">
              Course Learning Objectives
            </span>
          </div>
          {expandedCourseObjectives[course.id] ? (
            <ChevronDown className="w-4 h-4 text-gray-900" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-900" />
          )}
        </button>
        {expandedCourseObjectives[course.id] && (
          <div className="mt-2 space-y-1.5 pl-2">
            {course.course_learning_objectives.map((objective, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-gray-700"
              >
                <span className="text-gray-900 mt-0.5">•</span>
                <span className="leading-relaxed">{objective}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Structure Info */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="w-3.5 h-3.5 text-gray-900" />
          <span className="text-xs font-semibold text-gray-700">Structure</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <CourseTemplateStructureInfo
            attribute="lessons"
            value={course.lessons.length}
          />

          <CourseTemplateStructureInfo
            attribute="Estimated Time"
            value={course.lessons.length * 10}
          />

          <CourseTemplateStructureInfo
            attribute="Total Objectives"
            value={course.lessons.reduce(
              (sum, lesson) => sum + lesson.lesson_learning_objectives.length,
              0,
            )}
          />
        </div>
      </div>

      {/* Lessons with Objectives */}
      <div className="space-y-2">
        {sortedLessons.map((lesson, idx) => (
          <div key={idx}>
            <button
              onClick={() => toggleLessonObjectives(course.id, idx)}
              className="w-full flex items-start gap-2 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded transition-colors"
            >
              <div className="w-4 h-4 rounded bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-white">
                  {idx + 1}
                </span>
              </div>
              <span className="flex-1 text-left leading-relaxed">
                {lesson.lesson_name}
              </span>
              {expandedLessonObjectives[`${course.id}-${idx}`] ? (
                <ChevronDown className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
              )}
            </button>
            {expandedLessonObjectives[`${course.id}-${idx}`] && (
              <div className="mt-1.5 ml-6 space-y-1 pb-2">
                {lesson.lesson_learning_objectives.map((objective, objIdx) => (
                  <div
                    key={objIdx}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <span className="text-gray-900 mt-0.5">•</span>
                    <span className="leading-relaxed">{objective}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseCardItem;
