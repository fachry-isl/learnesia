import React, { useState } from "react";
import { createCourse, createLesson } from "../services/api";

const EditCourseFromGenerate = ({ course_prop, onBackButtonCallback }) => {
  const [course, setCourse] = useState(course_prop);

  const onBackButtonClick = () => {
    onBackButtonCallback();
  };

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
        {
          lesson_name: "",
          lesson_learning_objectives: [""],
          lessons_content: "",
        },
      ],
    });
  };

  const removeLesson = (index) => {
    setCourse({
      ...course,
      lessons: course.lessons.filter((_, i) => i !== index),
    });
  };

  const fetchCreateCourse = async () => {
    try {
      // Pass Course Payload
      // For Learning Objectives turns the string with  into array of learning objectives.
      const response = await createCourse({
        course_name: course.course_name,
        course_description: course.course_description,
        course_learning_objectives: course.course_learning_objectives,
      });

      if (response) {
        console.log("Course Submitted: ", course.course_name);
        console.log(JSON.stringify(response));
        console.log("Response Id: ", response.id);
      }

      return response.id;
    } catch (error) {
      console.error("Error fetchCreateCourse: ", error);
    }
  };

  const fetchCreateLessonsFromCourse = async (course_id, lesson_data) => {
    console.log("Course ID: ", course_id);
    console.log("Lesson_Data: ", lesson_data);
    try {
      for (let i = 0; i <= lesson_data.length - 1; i++) {
        lesson_data[i]["course"] = course_id;
        const response = await createLesson(lesson_data[i]);

        if (response) {
          console.log("Lesson Submitted: ", lesson_data[i]);
          console.log(JSON.stringify(response));
        }
      }
    } catch (error) {
      console.error("Error fetchCreateLessonFromCourse: ", error);
    }
  };

  const handleCourseStructureSubmit = async () => {
    // Store Course and Return Course ID for storing the lesson.

    // 1. Store Course
    const course_id = await fetchCreateCourse();

    // 2. Store Lessons
    fetchCreateLessonsFromCourse(course_id, course.lessons);
  };

  return (
    <div className="w-full">
      <div className="text-black font-bold text-2xl mb-8">
        Edit Course Structure
      </div>
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

          <div className="flex flex-col text-black p-2 resize-none">
            {course.course_learning_objectives.map((lob, lobIndex) => (
              // <div className="text-black">{`Learning Objective ke ${
              //   lobIndex + 1
              // } = ${lob}`}</div>

              <input
                onChange={(e) => {
                  console.log(`Test: ${e.target.value}`);

                  const updatedLob = [...course.course_learning_objectives];

                  // getUpdated LOB
                  updatedLob[lobIndex] = e.target.value;

                  setCourse({
                    ...course,
                    course_learning_objectives: updatedLob,
                  });
                }}
                className="text-black border-black border-2 mb-5 p-2"
                value={lob}
              ></input>
            ))}
          </div>
        </div>

        <div>
          <label className="text-black font-semibold block mb-2">
            Course Description
          </label>
          <textarea
            value={course.course_description}
            onChange={(e) =>
              handleCourseChange("course_description", e.target.value)
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

                <div className="flex flex-col text-black p-2 resize-none">
                  {lesson.lesson_learning_objectives.map((lob, lobIndex) => (
                    <input
                      onChange={(e) => {
                        const updatedLessons = [...course.lessons];
                        const updatedObjectives = [
                          ...updatedLessons[index].lesson_learning_objectives,
                        ];
                        updatedObjectives[lobIndex] = e.target.value;
                        updatedLessons[index].lesson_learning_objectives =
                          updatedObjectives;
                        setCourse({ ...course, lessons: updatedLessons });
                      }}
                      className="text-black border-black border-2 mb-5 p-2"
                      value={lob}
                    ></input>
                  ))}
                </div>

                {/* <textarea
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
                ></textarea> */}
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
          onClick={handleCourseStructureSubmit}
        >
          Submit Course Structure
        </button>
        <button
          onClick={onBackButtonClick}
          className="border-2 text-black border-black cursor-pointer px-5 py-2 font-semibold hover:bg-gray-100"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default EditCourseFromGenerate;
