import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [activeSidebar, setActiveSidebar] = useState("course_library");

  // Sidebar mode (Default or Lesson)
  const [sidebarMode, setSidebarMode] = useState("default");

  // Sidebar Lessons (course.lessons) Data
  const [sidebarData, setSidebarData] = useState(null);

  // Active Lesson ID
  const [activeLessonId, setActiveLessonId] = useState(null);

  return (
    <SidebarContext.Provider
      value={{
        activeSidebar,
        setActiveSidebar,
        sidebarMode,
        setSidebarMode,
        sidebarData,
        setSidebarData,
        activeLessonId,
        setActiveLessonId,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
