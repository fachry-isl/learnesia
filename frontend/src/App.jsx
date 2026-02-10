import SidebarItem from "./components/SidebarItem";
import CreateCourseTemplate from "./pages/admin/CreateCourseTemplate";
import IntegrationSandbox from "./pages/admin/IntegrationSandbox";
import ContentContainer from "./pages/admin/ContentContainer";
import CourseTemplateLibrary from "./pages/admin/CourseTemplateLibrary";
import { BookOpen, PlusCircle, Code2 } from "lucide-react";
import CreateLesson from "./pages/admin/CreateLesson";
import { useSidebar } from "./contexts/SidebarContext";
import SidebarLessonItem from "./components/SidebarLessonItem";
import CourseLibrary from "./pages/admin/CourseLibrary";
import { Toaster } from "react-hot-toast";
import CourseEditor from "./pages/admin/CourseEditor";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

function App() {
  // Use Context
  const {
    activeSidebar,
    setActiveSidebar,
    setSidebarMode,
    sidebarMode,
    sidebarData,
    activeLessonId,
    setActiveLessonId,
  } = useSidebar();

  // Sidebar Click Handler
  const handleSidebarItemClick = (item) => {
    setActiveSidebar(item);
  };

  const navigate = useNavigate();

  const onBackButtonClicked = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster />
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
          {sidebarMode === "default" ? (
            <>
              <SidebarItem
                to="/courses"
                item_name="Course Library"
                icon={<BookOpen className="w-5 h-5" />}
                isActive={activeSidebar === "course_library"}
                onClick={() => handleSidebarItemClick("course_library")}
              />

              <SidebarItem
                to="/templates"
                item_name="Course Template"
                icon={<BookOpen className="w-5 h-5" />}
                isActive={activeSidebar === "course_template_library"}
                onClick={() =>
                  handleSidebarItemClick("course_template_library")
                }
              />

              <SidebarItem
                to="/create-template"
                item_name="Create Course Template"
                icon={<PlusCircle className="w-5 h-5" />}
                isActive={activeSidebar === "create_course_template"}
                onClick={() => handleSidebarItemClick("create_course_template")}
              />
              <SidebarItem
                to="/create-lesson"
                item_name="Create Course Lessons"
                icon={<PlusCircle className="w-5 h-5" />}
                isActive={activeSidebar === "create_course_lessons"}
                onClick={() => handleSidebarItemClick("create_course_lessons")}
              />

              <SidebarItem
                to="/integration-sandbox"
                item_name="Integration Sandbox"
                icon={<Code2 className="w-5 h-5" />}
                isActive={activeSidebar === "integration_sandbox"}
                onClick={() => handleSidebarItemClick("integration_sandbox")}
              />
            </>
          ) : (
            <>
              {sidebarData?.map((lesson, idx) => (
                <SidebarLessonItem
                  key={idx}
                  lesson_name={lesson.lesson_name}
                  isActive={activeLessonId === lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                />
              ))}
            </>
          )}
        </nav>

        {sidebarMode != "default" && (
          <button
            onClick={onBackButtonClicked}
            className="border-2 border-gray text-white mb-5 mr-5 ml-5 cursor-pointer hover:bg-white hover:text-black transition-colors"
          >
            Back
          </button>
        )}

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
        <ContentContainer>
          {/* THE ROUTER MAP */}
          <Routes>
            <Route path="/" element={<CourseLibrary />} />
            <Route path="/courses" element={<CourseLibrary />} />
            <Route path="/courses/:id" element={<CourseEditor />} />{" "}
            {/* Dynamic Route */}
            <Route path="/templates" element={<CourseTemplateLibrary />} />
            <Route path="/create-template" element={<CreateCourseTemplate />} />
            <Route path="/create-lesson" element={<CreateLesson />} />
            <Route
              path="/integration-sandbox"
              element={<IntegrationSandbox />}
            />
          </Routes>
        </ContentContainer>
      </main>
    </div>
  );
}

export default App;
