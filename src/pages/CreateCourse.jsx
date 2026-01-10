import React from "react";

const CreateCourse = () => {
  const handleCreateCourseSubmit = (e) => {
    e.preventDefault();
    window.alert(`Prompt: ${e.target.Prompt.value}`);
  };
  return (
    <div className="bg-white border border-black flex-1 p-10">
      {/* Create Course Page */}
      <form
        className="flex flex-col mt-2 mb-5"
        onSubmit={handleCreateCourseSubmit}
      >
        <div className="text-black font-bold text-2xl">Prompt </div>
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
};

export default CreateCourse;
