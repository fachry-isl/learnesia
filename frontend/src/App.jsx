import SidebarItem from "./components/SidebarItem";
import { useState } from "react";
import CourseList from "./pages/CourseList";
import CreateCourse from "./pages/CreateCourse";
import IntegrationSandbox from "./pages/IntegrationSandbox";
import ContentContainer from "./pages/ContentContainer";
import CourseTemplateLibrary from "./pages/CourseTemplateLibrary";
import { BookOpen, PlusCircle, Code2 } from "lucide-react";
import CreateLesson from "./pages/CreateLesson";

function App() {
  // Active SideItem - Course List
  const [activeSidebar, setActiveSidebar] = useState("course_library");

  // Sidebar Click Handler
  const handleSidebarItemClick = (item) => {
    setActiveSidebar(item);
  };

  const renderSidebarContent = () => {
    switch (activeSidebar) {
      case "course_library":
        return <CourseTemplateLibrary />;
      case "create_course_template":
        return <CreateCourse onSubmit={() => handleCreateCourseSubmit} />;
      case "create_course_lessons":
        return <CreateLesson />;
      case "integration_sandbox":
        return <IntegrationSandbox />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-gray-900 to-black flex flex-col fixed h-screen">
        {/* Logo/Brand Section */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Learnesia
          </h1>
          <p className="text-gray-400 text-sm mt-1">Course Management</p>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem
            label="course_library"
            item_name="Course Template"
            icon={<BookOpen className="w-5 h-5" />}
            isActive={activeSidebar === "course_library"}
            onClick={() => handleSidebarItemClick("course_library")}
          />
          <SidebarItem
            label="create_course_template"
            item_name="Create Course Template"
            icon={<PlusCircle className="w-5 h-5" />}
            isActive={activeSidebar === "create_course_template"}
            onClick={() => handleSidebarItemClick("create_course_template")}
          />
          <SidebarItem
            label="create_course_lessons"
            item_name="Create Course Lessons"
            icon={<PlusCircle className="w-5 h-5" />}
            isActive={activeSidebar === "create_course_lessons"}
            onClick={() => handleSidebarItemClick("create_course_lessons")}
          />
          <SidebarItem
            label="integration_sandbox"
            item_name="Integration Sandbox"
            icon={<Code2 className="w-5 h-5" />}
            isActive={activeSidebar === "integration_sandbox"}
            onClick={() => handleSidebarItemClick("integration_sandbox")}
          />
        </nav>

        {/* Footer Section - Fixed at bottom */}
        <div className="p-4 border-t border-gray-800 mt-auto">
          <div className="text-gray-500 text-xs">
            <p>© 2026 Learnesia</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content - with left margin to account for fixed sidebar */}
      <main className="flex-1 ml-64 overflow-auto">
        <ContentContainer>{renderSidebarContent()}</ContentContainer>
      </main>
    </div>
  );
}

export default App;
