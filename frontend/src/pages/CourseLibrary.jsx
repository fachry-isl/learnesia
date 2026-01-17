import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Target,
  Layers,
} from "lucide-react";
import { getCourse } from "../services/api";

const CourseLibrary = () => {
  const [expandedCourseObjectives, setExpandedCourseObjectives] = useState({});
  const [expandedLessonObjectives, setExpandedLessonObjectives] = useState({});

  const [courses, setCourses] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const course_data = await getCourse();
    setCourses(course_data);
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Course Template Library
        </h1>
        <p className="text-gray-600">Manage your course syllabus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses?.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-gray-900" />
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">
              {course.course_name}
            </h3>
            <p className="text-gray-600 text-xs mb-3">
              {course.course_description}
            </p>

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
                <span className="text-xs font-semibold text-gray-700">
                  Structure
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">Lessons</div>
                  <div className="text-base font-bold text-gray-900">
                    {course.lessons.length}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">Estimated Time</div>
                  <div className="text-base font-bold text-gray-900">
                    {course.lessons.length * 10}
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">Total Objectives</div>
                  <div className="text-base font-bold text-gray-900">
                    {course.lessons.reduce(
                      (sum, lesson) =>
                        sum + lesson.lesson_learning_objectives.length,
                      0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons with Objectives */}
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => (
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
                      {lesson.lesson_learning_objectives.map(
                        (objective, objIdx) => (
                          <div
                            key={objIdx}
                            className="flex items-start gap-2 text-xs text-gray-600"
                          >
                            <span className="text-gray-900 mt-0.5">•</span>
                            <span className="leading-relaxed">{objective}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseLibrary;
