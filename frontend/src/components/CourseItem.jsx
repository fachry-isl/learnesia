import React from "react";

const CourseItem = ({ course }) => {
  return (
    <div className="border border-black w-70 h-65 p-2">
      <h1 id="title" className="text-black font-semibold">
        {course.title}
      </h1>
      <p id="description" className="text-black">
        {course.description}
      </p>

      <div className="text-black">{`Lesson Count: ${course.lesson_count}`}</div>
      <div className="text-black">{`Index Count: ${course.index_count}`}</div>
      <div className="text-black">{`Creation Time: ${course.creation_time}`}</div>
      <div className="text-black">{`Last Edit: ${course.last_edit_time}`}</div>
    </div>
  );
};

export default CourseItem;
