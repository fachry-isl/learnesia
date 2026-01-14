import SidebarItem from "./components/SidebarItem";
import { useState } from "react";
import CourseList from "./pages/CourseList";
import CreateCourse from "./pages/CreateCourse";
import IntegrationSandbox from "./pages/IntegrationSandbox";
import ContentContainer from "./pages/ContentContainer";

function App() {
  // Active SideItem - Course List
  const [activeSidebar, setActiveSidebar] = useState("course_list");

  // Sidebar Click Handler
  const handleSidebarItemClick = (item) => {
    setActiveSidebar(item);
  };

  const renderSidebarContent = () => {
    switch (activeSidebar) {
      case "course_list":
        return <CourseList />;
      case "create_course":
        return <CreateCourse onSubmit={() => handleCreateCourseSubmit} />;
      case "integration_sandbox":
        return <IntegrationSandbox />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br bg-white p-8 text-white flex">
      <div className="bg-black w-78 flex-col p-5 mr-5">
        <SidebarItem
          label="course_list"
          item_name="Courses"
          isActive={activeSidebar === "course_list"}
          onClick={() => handleSidebarItemClick("course_list")}
        />
        <SidebarItem
          label="create_course"
          item_name="Create Course"
          isActive={activeSidebar === "create_course"}
          onClick={() => handleSidebarItemClick("create_course")}
        />
        <SidebarItem
          label="integration_sandbox"
          item_name="Integration Sandbox"
          isActive={activeSidebar === "integration_sandbox"}
          onClick={() => handleSidebarItemClick("integration_sandbox")}
        />
      </div>

      <ContentContainer>{renderSidebarContent()}</ContentContainer>
    </div>
  );
}

export default App;
