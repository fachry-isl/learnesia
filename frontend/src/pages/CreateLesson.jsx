import React, { useEffect, useState } from "react";
import { getCourse } from "../services/api";
import CreateLessonDetail from "./CreateLessonDetail";
import { useSidebar } from "../contexts/SidebarContext";

const CreateLesson = () => {
  const [step, setStep] = useState("choose_course_template");
  const [courses, setCourses] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});

  // Add Context
  const { setSidebarMode, setSidebarData, setActiveLessonId } = useSidebar();

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
    <div className="text-black font-semibold mb-5">
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

  const onCreateLessonButtonClick = () => {
    setStep("create_course_lessons");

    setSidebarMode("create_lesson");
    setSidebarData(selectedCourse);

    // Automatically select the first lesson if available
    if (selectedCourse.lessons?.length > 0) {
      setActiveLessonId(selectedCourse.lessons[0].id);
    }
  };

  // Update Parent Selected Lesson when Lesson Changes on Lesson Detail Page
  const handleLessonUpdate = (lessonId, updatedContent) => {
    setSelectedCourse((prevCourse) => ({
      ...prevCourse,
      lessons: prevCourse.lessons.map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, lesson_content: updatedContent }
          : lesson,
      ),
    }));
  };

  const renderContent = () => {
    switch (step) {
      case "choose_course_template":
        return (
          <>
            {/* Course Selection - Fixed Height */}
            <div className="mb-4 shrink-0">
              <label className="block text-black font-semibold text-lg mb-2">
                Select Course Template
              </label>
              <select
                className="border-2 border-black p-2.5 w-full bg-gray-200 text-black focus:outline-none focus:border-gray-600 transition-colors"
                onChange={(e) => onCourseTopicChange(e.target.value)}
                defaultValue=""
              >
                <option value="">-- Select a Course --</option>
                {courses?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Details - Flex Container with Two Columns */}
            {selectedCourse && (
              <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Left Column - Course Info (40% width) */}
                <div className="w-[40%] border-2 border-black p-5 overflow-y-auto flex flex-col bg-white">
                  {/* Course Header */}
                  <div className="mb-4 shrink-0">
                    <h2 className="text-2xl font-bold text-black mb-2">
                      {selectedCourse.course_name}
                    </h2>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>
                        <span className="font-semibold">Course ID:</span>{" "}
                        {selectedCourse.id}
                      </span>
                      <span>
                        <span className="font-semibold">Created:</span>{" "}
                        {new Date(selectedCourse.created_at).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Course Description */}
                  <div className="mb-4 shrink-0">
                    <h3 className="text-lg font-semibold text-black mb-2">
                      Course Description
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCourse.course_description}
                    </p>
                  </div>

                  {/* Learning Objectives - Scrollable */}
                  <div className="flex-1 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-black mb-3 sticky top-0 bg-white pb-2">
                      Learning Objectives
                    </h3>
                    <ul className="list-none space-y-2">
                      {selectedCourse.course_learning_objectives.map(
                        (objective, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex">
                            <span className="font-semibold mr-2 text-black shrink-0">
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
                <div className="w-[60%] border-2 border-black p-5 flex flex-col overflow-hidden bg-white">
                  <div className="shrink-0 mb-4">
                    <h3 className="text-lg font-semibold text-black mb-2">
                      Existing Course Structure
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Total Lessons:</span>{" "}
                      {selectedCourse.lessons.length}
                    </p>
                  </div>

                  {/* Scrollable Lessons List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {selectedCourse.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="border-2 border-black overflow-hidden"
                      >
                        {/* Lesson Header */}
                        <button
                          onClick={() => toggleLessonExpand(lesson.id)}
                          className="w-full text-left p-4 hover:bg-gray-100 transition-colors focus:outline-none flex items-center justify-between bg-white"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-black text-sm">
                                Lesson {idx + 1}
                              </span>
                              <span className="text-xs text-gray-500 mr-2">
                                ID: {lesson.id}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">
                              {lesson.lesson_name}
                            </p>
                          </div>

                          {/* Expand Icon */}
                          <div className="ml-4 shrink-0">
                            <svg
                              className={`w-5 h-5 text-black transition-transform ${
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
                          <div className="px-4 pb-4 border-t-2 border-black pt-3 bg-gray-50">
                            <h4 className="text-xs font-semibold text-black mb-2">
                              Learning Objectives:
                            </h4>
                            <ul className="space-y-1.5">
                              {lesson.lesson_learning_objectives.map(
                                (objective, objIdx) => (
                                  <li
                                    key={objIdx}
                                    className="text-xs text-gray-700 flex"
                                  >
                                    <span className="text-black mr-2 shrink-0 font-semibold">
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
                  <div className="mt-4 shrink-0">
                    <button
                      className="border-2 border-black cursor-pointer p-3 text-black w-full font-bold hover:bg-black hover:text-white transition-colors"
                      onClick={onCreateLessonButtonClick}
                    >
                      Create Lesson
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no course selected */}
            {!selectedCourse && courses && (
              <div className="flex-1 flex items-center justify-center text-center border-2 border-dashed border-gray-400 bg-white">
                <div>
                  <p className="text-lg text-gray-600">
                    Select a course template to begin
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {courses.length} course{courses.length !== 1 ? "s" : ""}{" "}
                    available
                  </p>
                </div>
              </div>
            )}
          </>
        );
      case "create_course_lessons":
        return (
          <CreateLessonDetail
            course={selectedCourse}
            onLessonUpdate={handleLessonUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {renderBreadCrumbs()}
      {renderContent()}
    </div>
  );
};

export default CreateLesson;
