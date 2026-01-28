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
import { changeCourseStatus } from "../services/api";

const CourseCardItem = ({
  course,
  isonClickActive,
  onCourseCardClickCallback,
}) => {
  const [expandedCourseObjectives, setExpandedCourseObjectives] = useState({});
  const [expandedLessonObjectives, setExpandedLessonObjectives] = useState({});

  const [isToggleOn, setIsToggleOn] = useState(course.status === "published");

  const onCourseCardClick = () => {
    onCourseCardClickCallback(course);
  };

  const toggleCourseObjectives = (courseId, e) => {
    e.stopPropagation(); // STOP the event from going up to parent
    setExpandedCourseObjectives((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const changeCourseStatusAPI = async (course_id, updatedValue) => {
    try {
      const isDraftorPublished = updatedValue ? "published" : "draft";
      // console.log("Is Draft: ", isDraftorPublished);

      const response = await changeCourseStatus(course_id, isDraftorPublished);

      // console.log("Change Course Status API: ", response);
    } catch (e) {
      throw error;
    }
  };

  const toggleLessonObjectives = (courseId, lessonIndex, e) => {
    e.stopPropagation(); // STOP the event from going up to parent
    const key = `${courseId}-${lessonIndex}`;
    setExpandedLessonObjectives((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handler to get toggle value
  const handleToggleChange = (e) => {
    e.stopPropagation(); // Prevent card click
    const newValue = e.target.checked;

    // Frontend Change
    setIsToggleOn(newValue);

    // Backend
    changeCourseStatusAPI(course.id, newValue);

    // Do something with the value
    // console.log("Toggle is now:", newValue ? "ON" : "OFF");
    // console.log("Course ID:", course.id);

    // You can call a callback here if needed
    // onToggleChange(course.id, newValue);
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
      <div
        className="flex items-start justify-between mb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-gray-900" />
        </div>

        {/* Fixed Toggle Section */}
        <div className="flex items-center gap-2">
          <label
            htmlFor={`switch-component-${course.id}`}
            className="text-slate-600 text-sm cursor-pointer"
          >
            Published
          </label>

          <div className="relative inline-block w-11 h-5">
            <input
              id={`switch-component-${course.id}`}
              checked={isToggleOn}
              onChange={handleToggleChange}
              onClick={(e) => e.stopPropagation()}
              type="checkbox"
              className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 cursor-pointer transition-colors duration-300"
            />
            <label
              htmlFor={`switch-component-${course.id}`}
              className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-1">
        {course.course_name}
      </h3>
      <p className="text-gray-600 text-xs mb-3">{course.course_description}</p>

      {/* Course Learning Objectives */}
      <div className="mb-3">
        <button
          onClick={(e) => toggleCourseObjectives(course.id, e)}
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
              onClick={(e) => toggleLessonObjectives(course.id, idx, e)}
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
