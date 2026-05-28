"use client";

import { useRouter } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import SidebarItem from "@/components/admin/SidebarItem";
import SidebarLessonItem from "@/components/admin/SidebarLessonItem";
import { BookOpen, PlusCircle } from "lucide-react";

export default function AdminLayout({ children }) {
  const {
    activeSidebar,
    setActiveSidebar,
    sidebarMode,
    sidebarData,
    activeLessonId,
    setActiveLessonId,
  } = useSidebar();

  const router = useRouter();

  const handleSidebarItemClick = (item) => {
    setActiveSidebar(item);
  };

  const onBackButtonClicked = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white flex flex-col fixed h-screen z-50 border-r border-slate-800/50">
        <div className="p-6">
          <img src="/li_logo_lite_white.png" alt="Learnesia" className="p-2 w-20 border-1 border-black" />
          <p className="mt-5 text-black text-[10px] uppercase tracking-[0.2em] font-bold">
            Content Management System
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
          {sidebarMode === "default" ? (
            <>
              <SidebarItem
                to="courses"
                item_name="Course Library"
                icon={<BookOpen className="w-5 h-5" />}
                isActive={activeSidebar === "course_library"}
                onClick={() => handleSidebarItemClick("course_library")}
              />
              <SidebarItem
                to="create-template"
                item_name="Create Course Template"
                icon={<PlusCircle className="w-5 h-5" />}
                isActive={activeSidebar === "create_course_template"}
                onClick={() => handleSidebarItemClick("create_course_template")}
              />
            </>
          ) : (
            sidebarData?.map((lesson, idx) => (
              <SidebarLessonItem
                key={idx}
                lesson_name={lesson.lesson_name}
                isActive={activeLessonId === lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
              />
            ))
          )}
        </nav>

        {sidebarMode !== "default" && (
          <button
            onClick={onBackButtonClicked}
            className="m-4 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg cursor-pointer hover:bg-white hover:text-black transition-all duration-200 font-medium"
          >
            ← Back to Menu
          </button>
        )}

        <div className="p-6 border-t border-slate-800 mt-auto">
          <div className="text-slate-500 text-xs flex flex-col gap-1">
            <p className="font-medium text-slate-400">© 2026 Learnesia</p>
            <p className="opacity-75">System version v1.0.0</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
