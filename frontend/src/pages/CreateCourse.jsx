import React from "react";
import EditCourseFromGenerate from "./EditCourseFromGenerate";
import { useState, useEffect } from "react";
import { generateCourse } from "../services/api";
import { toast, Toaster } from "react-hot-toast";

const CreateCourse = () => {
  const [step, setStep] = useState("create_course_structure");
  const [courseData, setCourseData] = useState("");

  const fetchCourseGeneration = async (prompt) => {
    // Show loading toast
    const loadingToast = toast.loading("Creating lesson...");
    try {
      const result = await generateCourse(prompt);
      console.log(result);

      setCourseData(JSON.parse(result.response));

      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      toast.success("Lesson created successfully!");
    } catch (error) {
      // Dismiss loading and show error
      toast.dismiss(loadingToast);
      toast.error(error.message || "Something went wrong!");

      console.error("Error creating lesson:", error);
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

    const prompt = e.target.Prompt.value.trim();

    if (!prompt || prompt.length < 10) {
      toast.error("Please enter a detailed prompt (at least 10 characters)");
      return;
    }

    if (prompt.length > 5000) {
      toast.error("Prompt is too long (max 5000 characters)");
      return;
    }

    fetchCourseGeneration(prompt);

    //setStep("edit_course_structure");
  };

  const onBackButtonCallbackHandler = () => {
    setCourseData("");
    setStep("create_course_structure");
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
        // Don't render until we have valid data
        if (!courseData || courseData === "") {
          return <div className="text-black">Loading course data...</div>;
        }
        return (
          <EditCourseFromGenerate
            course_prop={courseData}
            onBackButtonCallback={onBackButtonCallbackHandler}
          />
        );
      case "create_course_structure":
        return (
          <div>
            <Toaster />
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
