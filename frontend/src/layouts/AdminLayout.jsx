import { Outlet } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { useSidebar } from "../contexts/SidebarContext";

import SidebarItem from "../components/admin/SidebarItem";
import SidebarLessonItem from "../components/admin/SidebarLessonItem";

import { BookOpen, PlusCircle, Code2 } from "lucide-react";

const AdminLayout = () => {
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 flex flex-col fixed h-screen z-50 border-r border-slate-800/50">
        {/* Logo/Brand Section */}
        <div className="p-6 border-b border-slate-800/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            Learnesia
          </h1>
          <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-[0.2em] font-bold opacity-80">
            Course Management
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
          {sidebarMode === "default" ? (
            <>
              <SidebarItem
                to="/admin/courses"
                item_name="Course Library"
                icon={<BookOpen className="w-5 h-5" />}
                isActive={activeSidebar === "course_library"}
                onClick={() => handleSidebarItemClick("course_library")}
              />
              <SidebarItem
                to="/admin/create-template"
                item_name="Create Course Template"
                icon={<PlusCircle className="w-5 h-5" />}
                isActive={activeSidebar === "create_course_template"}
                onClick={() => handleSidebarItemClick("create_course_template")}
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
            className="m-4 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg cursor-pointer hover:bg-white hover:text-black transition-all duration-200 font-medium"
          >
            ← Back to Menu
          </button>
        )}

        {/* Footer Section - Fixed at bottom */}
        <div className="p-6 border-t border-slate-800 mt-auto">
          <div className="text-slate-500 text-xs flex flex-col gap-1">
            <p className="font-medium text-slate-400">© 2026 Learnesia</p>
            <p className="opacity-75">System version v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">
          <Outlet /> {/* Child routes render here */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
