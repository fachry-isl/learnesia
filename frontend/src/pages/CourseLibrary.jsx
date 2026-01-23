import React from "react";
import { useState, useEffect } from "react";
import { getCourse } from "../services/api";
import CourseCardItem from "../components/CourseCardItem";

const CourseLibrary = () => {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);
  const fetchCourses = async () => {
    const course_data = await getCourse();

    // Draft or Published Course Only
    const filtered_course = course_data.filter(
      (course) => course.status === "draft" || course.status === "published",
    );

    console.log("Filtered Course; ", filtered_course);

    setCourses(filtered_course);
  };
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
            isDraftorPublished="published"
          />
        ))}
      </div>
    </div>
  );
};

export default CourseLibrary;
