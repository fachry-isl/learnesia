import React from "react";
import EditCourseFromGenerate from "./EditCourseFromGenerate";
import { useState, useEffect } from "react";
import { createCourse } from "../services/api";

const CreateCourse = () => {
  const [step, setStep] = useState("create_course_structure");
  const [courseData, setCourseData] = useState("");

  const fetchCourseGeneration = async () => {
    try {
      const response = await createCourse();
      setCourseData(JSON.stringify(response));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (courseData) {
      console.log("Course data received:", courseData);
      setStep("edit_course_structure");
    }
  }, [courseData]);

  const handleCreateCourseSubmit = (e) => {
    e.preventDefault();
    // window.alert(`Prompt: ${e.target.Prompt.value}`);

    console.log("Course Submit");
    fetchCourseGeneration();

    //setStep("edit_course_structure");
  };

  const breadcrumbs = {
    create_course_structure: ["Create Structure"],
    edit_course_structure: ["Create Structure", "Edit Structure"],
    submit: ["Create Structure", "Edit Structure", "Submit"],
  };

  const renderBreadCrumbs = () => {
    return (
      <div className="text-black font-semibold mb-5">
        {breadcrumbs[step].join(" > ")}
      </div>
    );
  };

  const renderCreateCourse = () => {
    switch (step) {
      case "edit_course_structure":
        return <EditCourseFromGenerate course_prop={courseData} />;
      case "create_course_structure":
        return (
          <div>
            {/* Create Course Page */}
            <form
              className="flex flex-col mt-2 mb-5"
              onSubmit={handleCreateCourseSubmit}
            >
              {/* Breadcrumb */}
              {/* <div className="text-black font-semibold">{`Create Structure > Edit Structure > Submit`}</div> */}
              <div className="text-black font-bold text-2xl mt-5">
                Start from Prompt{" "}
              </div>
              <textarea
                name="Prompt"
                className="border-2 border-black w-full text-black p-5 resize-none"
                style={{ overflow: "hidden" }}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = `${e.target.scrollHeight}px`; // Set height based on scrollHeight
                }}
                required
              ></textarea>

              <button
                type="submit"
                className="border-black border-2 cursor-pointer p-5 pt-2 pb-2 text-black mt-10"
              >
                Generate
              </button>
            </form>
          </div>
        );
    }
  };
  return (
    <>
      {renderBreadCrumbs()}
      {renderCreateCourse()}
    </>
  );
};

export default CreateCourse;
