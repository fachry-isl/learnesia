import React from "react";
import EditCourseFromGenerate from "./EditCourseFromGenerate";
import { useState } from "react";

const CreateCourse = () => {
  const [step, setStep] = useState("create_draft");
  const handleCreateCourseSubmit = (e) => {
    e.preventDefault();
    // window.alert(`Prompt: ${e.target.Prompt.value}`);

    console.log("Course Submit");

    setStep("edit_course");
  };

  const breadcrumbs = {
    create_draft: ["Create Draft"],
    edit_course: ["Create Draft", "Edit Course"],
    submit: ["Create Draft", "Edit Course", "Submit"],
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
      case "edit_course":
        return <EditCourseFromGenerate />;
      case "create_draft":
        return (
          <div>
            {/* Create Course Page */}
            <form
              className="flex flex-col mt-2 mb-5"
              onSubmit={handleCreateCourseSubmit}
            >
              {/* Breadcrumb */}
              {/* <div className="text-black font-semibold">{`Create Draft > Edit Course > Submit`}</div> */}
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
    <div className="bg-white border border-black flex-1 p-10">
      {renderBreadCrumbs()}
      {renderCreateCourse()}
    </div>
  );
};

export default CreateCourse;
