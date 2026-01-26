import React from "react";
import { useState, useEffect } from "react";
import { getCourse } from "../services/api";
import CourseCardItem from "../components/CourseCardItem";
import { useSidebar } from "../contexts/SidebarContext";
import CourseDetail from "./CourseDetail";

const CourseLibrary = () => {
  // Import Global Context for Detailed Page
  const { sidebarMode, setSidebarMode, setSidebarData, setActiveLessonId } =
    useSidebar();
  const [step, setStep] = useState("course_library");
  const [courses, setCourses] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (sidebarMode === "default") {
      setStep("course_library");
    }
  }, [sidebarMode]);

  useEffect(() => {
    fetchCourses();
  }, []);
  const fetchCourses = async () => {
    const course_data = await getCourse();

    // Draft or Published Course Only
    const filtered_course = course_data.filter(
      (course) => course.status === "draft" || course.status === "published",
    );

    // For Debug
    // console.log("Filtered Course; ", filtered_course);

    setCourses(filtered_course);
  };

  const onCourseCardClickHandler = (course) => {
    // console.log("CourseLibrary: ", course);

    // Update Sidebar
    setSidebarMode("course_detail");

    // Sort Lesson First before set the Data
    const sortedLessons = course?.lessons
      ? [...course.lessons].sort((a, b) => a.order - b.order)
      : [];

    setSidebarData(sortedLessons);

    setSelectedCourse(course);

    // Update Main Container
    setStep("course_detail");

    // Automatically select the first lesson if available
    if (course.lessons?.length > 0) {
      setActiveLessonId(course.lessons[0].id);
    }
  };

  const handleLessonUpdate = (lessonId, updatedContent) => {
    // Refresh lesson for the selected course
    setSelectedCourse((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) => {
        return lesson.id === lessonId
          ? { ...lesson, lesson_content: updatedContent }
          : lesson;
      }),
    }));

    console.log("Selected Course After Updated Content: ", selectedCourse);
  };

  const renderContent = () => {
    switch (step) {
      case "course_library":
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Course Library
              </h1>
              <p className="text-gray-600">Draft and Published Course</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses?.map((course, idx) => (
                <CourseCardItem
                  key={idx}
                  course={course}
                  isonClickActive={true}
                  onCourseCardClickCallback={onCourseCardClickHandler}
                />
              ))}
            </div>
          </div>
        );
      case "course_detail":
        return (
          <CourseDetail
            course={selectedCourse}
            onLessonUpdate={handleLessonUpdate}
          />
        );

      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};

export default CourseLibrary;
