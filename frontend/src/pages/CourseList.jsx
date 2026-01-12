import React from "react";
import CourseItem from "../components/CourseItem";

const CourseList = () => {
  // Dummy Course Data
  const course_data = {
    title: "Artificial Intelligence",
    description:
      "This course covers about The fundamental of using AI and it's basic applications.",
    lesson_count: 5,
    index_count: 5,
    creation_time: "10/01/2025 20:10",
    last_edit_time: "10/01/2025 20:10",
  };
  return (
    <div className="bg-white border border-black flex-1 p-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      {/* Course List Page */}
      {Array.from({ length: 20 }).map((_, index) => (
        <CourseItem key={index} course={course_data} />
      ))}
    </div>
  );
};

export default CourseList;
