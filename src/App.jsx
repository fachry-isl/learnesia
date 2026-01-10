import SidebarItem from "./components/SidebarItem";
import { useState } from "react";

function App() {
  // Active SideItem - Course List
  const [activeSidebar, setActiveSidebar] = useState("course_list");

  // Sidebar Click Handler
  const handleSidebarItemClick = (item) => {
    setActiveSidebar(item);
    console.log(item);
  };

  return (
    <div className="min-h-screen bg-linear-to-br bg-white p-8 text-white flex">
      <div className="bg-black w-50 flex-col p-5 mr-5">
        <SidebarItem
          label="course_list"
          item_name="Database"
          isActive={activeSidebar === "course_list"}
          onClick={() => handleSidebarItemClick("course_list")}
        />
        <SidebarItem
          label="generate_course"
          item_name="Generate Course"
          isActive={activeSidebar === "generate_course"}
          onClick={() => handleSidebarItemClick("generate_course")}
        />
      </div>

      <div className="bg-white border border-black flex-1 p-10">
        {/* Course Item */}
        <div className="border border-black w-50 p-2">
          <h1 id="title" className="text-black font-semibold">
            Artificial Intelligence
          </h1>
          <p id="description" className="text-black">
            This course covers about The fundamental of using AI and it's basic
            applications.
          </p>

          <div className="text-black">Lesson Count: 5</div>
          <div className="text-black">Index Count: 5</div>
          <div className="text-black">Version: 1</div>
        </div>
      </div>
    </div>
  );
}

export default App;
