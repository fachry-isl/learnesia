import React, { useState } from "react";

const EditCourseFromGenerate = ({ course_prop }) => {
  const [course, setCourse] = useState(JSON.parse(course_prop));

  console.log("onEditCoursePage: ", course);
  console.log("onEditCoursePage -att: ", course.course_name);

  const handleCourseChange = (field, value) => {
    setCourse({ ...course, [field]: value });
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...course.lessons];
    updatedLessons[index][field] = value;
    setCourse({ ...course, lessons: updatedLessons });
  };

  const addLesson = () => {
    setCourse({
      ...course,
      lessons: [
        ...course.lessons,
        { lesson_name: "", learning_objectives: "", lessons_content: "" },
      ],
    });
  };

  const removeLesson = (index) => {
    setCourse({
      ...course,
      lessons: course.lessons.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="w-full">
      <div className="text-black font-bold text-2xl mb-8">Edit Course</div>
      Course Level Fields
      <div className="mb-8 space-y-4">
        <div>
          <label className="text-black font-semibold block mb-2">
            Course Name
          </label>
          <input
            type="text"
            value={course.course_name}
            onChange={(e) => handleCourseChange("course_name", e.target.value)}
            className="border-2 border-black w-full text-black p-3"
          />
        </div>

        <div>
          <label className="text-black font-semibold block mb-2">
            Learning Objectives
          </label>
          <textarea
            value={course.course_learning_objectives}
            onChange={(e) =>
              handleCourseChange("course_learning_objectives", e.target.value)
            }
            className="border-2 border-black w-full text-black p-3 resize-none"
            rows={3}
          ></textarea>
        </div>

        <div>
          <label className="text-black font-semibold block mb-2">
            Course Description
          </label>
          <textarea
            value={course.course_lessons_description}
            onChange={(e) =>
              handleCourseChange("course_lessons_description", e.target.value)
            }
            className="border-2 border-black w-full text-black p-3 resize-none"
            rows={3}
          ></textarea>
        </div>
      </div>
      {/* Lessons Section */}
      <div className="mb-8">
        <div className="text-black font-bold text-xl mb-4">Lessons</div>

        {course.lessons.map((lesson, index) => (
          <div
            key={index}
            className="border-2 border-black p-5 mb-4 bg-gray-50"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="text-black font-semibold">Lesson {index + 1}</div>
              {course.lessons.length > 1 && (
                <button
                  onClick={() => removeLesson(index)}
                  className="border-2 border-red-500 bg-red-500 text-white cursor-pointer px-3 py-1 font-semibold hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-black font-semibold block mb-2">
                  Lesson Name
                </label>
                <input
                  type="text"
                  value={lesson.lesson_name}
                  onChange={(e) =>
                    handleLessonChange(index, "lesson_name", e.target.value)
                  }
                  className="border-2 border-black w-full text-black p-2"
                />
              </div>

              <div>
                <label className="text-black font-semibold block mb-2">
                  Learning Objectives
                </label>
                <textarea
                  value={lesson.learning_objectives}
                  onChange={(e) =>
                    handleLessonChange(
                      index,
                      "learning_objectives",
                      e.target.value
                    )
                  }
                  className="border-2 border-black w-full text-black p-2 resize-none"
                  rows={2}
                ></textarea>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addLesson}
          className="border-2 border-green-500 bg-green-500 text-white cursor-pointer px-5 py-2 font-semibold hover:bg-green-600 mb-8"
        >
          + Add Lesson
        </button>
      </div>
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          className="border-2 border-black bg-black text-white cursor-pointer px-5 py-2 font-semibold hover:bg-gray-800"
          onClick={() => window.alert(JSON.stringify(course))}
        >
          Submit Course
        </button>
        <button className="border-2 text-black border-black cursor-pointer px-5 py-2 font-semibold hover:bg-gray-100">
          Back
        </button>
      </div>
    </div>
  );
};

export default EditCourseFromGenerate;
