import React from "react";
import EditCourseFromGenerate from "./EditCourseFromGenerate";
import { useState, useEffect } from "react";
import { generateCourse } from "../../services/api";
import { toast } from "react-hot-toast";

const CreateCourseTemplate = () => {
  const [step, setStep] = useState("create_course_structure");
  const [courseData, setCourseData] = useState("");

  // State for form fields
  const [topic, setTopic] = useState("");
  const [courseLength, setCourseLength] = useState("short"); // Default to Microlearning Course
  const [audience, setAudience] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [language, setLanguage] = useState("English");

  const fetchCourseGeneration = async (prompt) => {
    const loadingToast = toast.loading("Creating lesson...");
    try {
      const result = await generateCourse(prompt);
      // console.log("Generated Course: ", result.response);
      setCourseData(result.response);

      toast.success("Lesson created successfully!", { id: loadingToast });
    } catch (error) {
      toast.error(error.message || "Something went wrong!", {
        id: loadingToast,
      });
      console.error("Error creating lesson:", error);
    }
  };

  useEffect(() => {
    if (courseData) {
      setStep("edit_course_structure");
    }
  }, [courseData]);

  const handleCreateCourseSubmit = (e) => {
    e.preventDefault();

    const manualPrompt = e.target.Prompt.value.trim();
    let finalPrompt = "";

    // If manual prompt is provided, use it. Otherwise, build from fields.
    if (manualPrompt) {
      finalPrompt = manualPrompt;
    } else {
      if (!topic) {
        toast.error("Please enter a topic");
        return;
      }

      // Map selection to module counts
      const moduleMapping = {
        short: { modules: "3-5", duration: "1-5 hours total" },
        medium: { modules: "5-8", duration: "6-10 hours total" },
        long: { modules: "8-15", duration: "10+ hours total" },
      };

      const selectedCourse = moduleMapping[courseLength];
      const audienceText = audience || "general learners";
      const difficultyText = difficulty || "beginner";
      const languageOption = language || "English";

      finalPrompt = `# Role
You are a Syllabus Agent creating comprehensive learning roadmaps.

# Input Parameters
* Main Topic: ${topic}
* Target Audience: ${audienceText}
* Difficulty Level: ${difficultyText}
* Number of Modules: ${selectedCourse.modules}
* Course Duration: ${selectedCourse.duration}
* Language (Main Language used in the Course): ${languageOption} 

# Requirements
1. Create ${selectedCourse.modules} sequential modules progressing from foundational to advanced
2. Tailor content complexity to ${difficultyText} level
3. Target content for ${audienceText}
4. Each module should:
   - Have clear title and description
   - Specify learning outcomes (what students will be able to DO)
   - Indicate estimated time to complete
5. Ensure logical progression considering target audience's background

# Output Format
Return a valid JSON structure with the course outline.`;
    }

    if (finalPrompt.length < 10) {
      toast.error("Please provide more details for the course.");
      return;
    }

    fetchCourseGeneration(finalPrompt);
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

  const renderBreadCrumbs = () => (
    <div className="text-black font-semibold mb-5">
      {breadcrumbs[step].join(" > ")}
    </div>
  );

  const renderCreateCourse = () => {
    switch (step) {
      case "edit_course_structure":
        if (!courseData)
          return <div className="text-black">Loading course data...</div>;
        return (
          <EditCourseFromGenerate
            course_prop={courseData}
            onBackButtonCallback={onBackButtonCallbackHandler}
          />
        );
      case "create_course_structure":
        return (
          <div>
            <form
              className="flex flex-col mt-2 mb-5"
              onSubmit={handleCreateCourseSubmit}
            >
              <div className="text-black font-semibold text-2xl mt-5">
                Topic
              </div>
              <p className="text-gray-600 text-sm mb-2">
                The main subject your course will cover
              </p>
              <input
                className="border-2 border-black mb-1 p-2"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. React Development, Digital Marketing, Python for Data Science"
              />
              <p className="text-gray-500 text-xs italic mb-2">
                Example: "Introduction to Machine Learning"
              </p>

              <div className="text-black font-semibold text-2xl mt-5">
                Course Length
              </div>
              <p className="text-gray-600 text-sm mb-2">
                How comprehensive the course should be
              </p>
              <select
                className="border-2 border-black mb-1 p-2 bg-white text-black"
                value={courseLength}
                onChange={(e) => setCourseLength(e.target.value)}
              >
                <option value="short">Short (3-5 Modules)</option>
                <option value="medium">Medium (5-8 Modules)</option>
                <option value="long">Long (8-15 Modules)</option>
              </select>
              <p className="text-gray-500 text-xs italic mb-2">
                Example: Medium for a weekend workshop, Long for a semester
                course
              </p>

              <div className="text-black font-semibold text-2xl mt-5">
                Target Audience
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Who will be taking this course
              </p>
              <input
                className="border-2 border-black mb-1 p-2"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Beginners, Software Engineers, Marketing Professionals"
              />
              <p className="text-gray-500 text-xs italic mb-2">
                Example: "College students with basic programming knowledge"
              </p>

              <div className="text-black text-2xl mt-5 font-semibold">
                Difficulty
              </div>
              <p className="text-gray-600 text-sm mb-2">
                The complexity level of the content
              </p>
              <input
                className="border-2 border-black mb-1 p-2"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                placeholder="e.g. Beginner, Intermediate, Advanced"
              />
              <p className="text-gray-500 text-xs italic mb-2">
                Example: "Intermediate" for learners with 1-2 years experience
              </p>

              <div className="text-black font-semibold text-2xl mt-5">
                Language
              </div>
              <p className="text-gray-600 text-sm mb-2">
                What is the Main Language used in the Course.
              </p>
              <select
                className="border-2 border-black mb-1 p-2 bg-white text-black"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              </select>

              <div className="flex items-center my-8">
                <div className="grow border-t border-gray-400"></div>
                <span className="px-4 text-gray-600 font-semibold">OR</span>
                <div className="grow border-t border-gray-400"></div>
              </div>

              <div className="text-black font-semibold text-2xl mt-5">
                Start from Prompt
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Describe your entire course vision in natural language
              </p>
              <textarea
                name="Prompt"
                className="border-2 border-black w-full text-black p-5 resize-none mb-1"
                placeholder="Describe your course in detail..."
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
              ></textarea>
              <p className="text-gray-500 text-xs italic mb-2">
                Example: "Create a beginner-friendly course on web development
                covering HTML, CSS, and JavaScript basics for high school
                students with no prior experience"
              </p>

              <button
                type="submit"
                className="border-black border-2 cursor-pointer p-5 pt-2 pb-2 text-black mt-10 font-bold hover:bg-black hover:text-white transition-colors"
              >
                Generate
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderBreadCrumbs()}
      {renderCreateCourse()}
    </>
  );
};

export default CreateCourseTemplate;
