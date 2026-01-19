import React, { useEffect, useState } from "react";
import { getCourse } from "../services/api";

const CreateLesson = () => {
  const [step, setStep] = useState("choose_course_template");
  const [courses, setCourses] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const course_data = await getCourse();
    setCourses(course_data);
  };

  const breadcrumbs = {
    choose_course_template: ["Choose Course Template"],
    create_course_lessons: ["Choose Course Template", "Create Lessons"],
  };

  const renderBreadCrumbs = () => (
    <div className="text-black font-semibold mb-3 text-sm">
      {breadcrumbs[step].join(" > ")}
    </div>
  );

  const onCourseTopicChange = (courseId) => {
    const id = parseInt(courseId);
    const course = courses.find((c) => c.id === id);
    setSelectedCourse(course);
    setExpandedLessons({});
  };

  const toggleLessonExpand = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {renderBreadCrumbs()}

      {/* Course Selection - Fixed Height */}
      <div className="mb-3 shrink-0">
        <select
          className="bg-gray-800 border border-gray-700 text-white p-2.5 w-full rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
          onChange={(e) => onCourseTopicChange(e.target.value)}
          defaultValue=""
        >
          <option value="" className="bg-gray-800">
            -- Select a Course --
          </option>
          {courses?.map((course) => (
            <option key={course.id} value={course.id} className="bg-gray-800">
              {course.course_name}
            </option>
          ))}
        </select>
      </div>

      {/* Course Details - Flex Container with Two Columns */}
      {selectedCourse && (
        <div className="flex-1 flex gap-3 overflow-hidden">
          {/* Left Column - Course Info (40% width) */}
          <div className="w-[40%] bg-gray-900 border border-gray-800 rounded-lg p-4 overflow-y-auto flex flex-col">
            {/* Course Header */}
            <div className="mb-3 shrink-0">
              <h2 className="text-xl font-bold text-white mb-2">
                {selectedCourse.course_name}
              </h2>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>ID: {selectedCourse.id}</span>
                <span>
                  {new Date(selectedCourse.created_at).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </span>
              </div>
            </div>

            {/* Course Description */}
            <div className="mb-3 shrink-0">
              <h3 className="text-sm font-semibold text-white mb-1.5">
                Course Description
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedCourse.course_description}
              </p>
            </div>

            {/* Learning Objectives - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-white mb-2 sticky top-0 bg-gray-900 pb-1">
                Learning Objectives
              </h3>
              <ul className="list-none space-y-1.5">
                {selectedCourse.course_learning_objectives.map(
                  (objective, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex">
                      <span className="font-semibold mr-2 text-blue-400 shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{objective}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          {/* Right Column - Existing Lessons (60% width) */}
          <div className="w-[60%] bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col overflow-hidden">
            <div className="shrink-0 mb-3">
              <h3 className="text-sm font-semibold text-white mb-2">
                Existing Course Structure
              </h3>
              <p className="text-xs text-gray-400">
                Total Lessons: {selectedCourse.lessons.length}
              </p>
            </div>

            {/* Scrollable Lessons List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {selectedCourse.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="border-l-4 border-blue-500 bg-gray-950 rounded-r-lg overflow-hidden"
                >
                  {/* Lesson Header */}
                  <button
                    onClick={() => toggleLessonExpand(lesson.id)}
                    className="w-full text-left p-3 hover:bg-gray-800 transition-colors focus:outline-none flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-white text-xs">
                          Lesson {idx + 1}
                        </span>
                        <span className="text-[10px] text-gray-500 mr-2">
                          ID: {lesson.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 font-medium truncate">
                        {lesson.lesson_name}
                      </p>
                    </div>

                    {/* Expand Icon */}
                    <div className="ml-3 shrink-0">
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedLessons[lesson.id] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expandable Learning Objectives */}
                  {expandedLessons[lesson.id] && (
                    <div className="px-3 pb-3 border-t border-gray-800 pt-2 bg-gray-950">
                      <h4 className="text-[10px] font-semibold text-white mb-1.5">
                        Learning Objectives:
                      </h4>
                      <ul className="space-y-1">
                        {lesson.lesson_learning_objectives.map(
                          (objective, objIdx) => (
                            <li
                              key={objIdx}
                              className="text-[10px] text-gray-400 flex"
                            >
                              <span className="text-blue-400 mr-1.5 shrink-0">
                                •
                              </span>
                              <span>{objective}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Button - Fixed at Bottom */}
            <div className="mt-3 shrink-0">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors w-full"
                onClick={() => setStep("create_course_lessons")}
              >
                Create Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder when no course selected */}
      {!selectedCourse && courses && (
        <div className="flex-1 flex items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg bg-gray-900">
          <div>
            <p className="text-base">Select a course template to begin</p>
            <p className="text-sm mt-2">
              {courses.length} course{courses.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLesson;
