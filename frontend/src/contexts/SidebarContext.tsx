import React, { createContext, useContext, useState, ReactNode } from "react";
import { Lesson } from "../types";

interface LessonHandlers {
  onAdd?: (() => void) | null;
  onDelete?: ((id: number | string) => void) | null;
  onMoveUp?: ((id: number | string) => void) | null;
  onMoveDown?: ((id: number | string) => void) | null;
}

interface SidebarContextType {
  activeSidebar: string;
  setActiveSidebar: (item: string) => void;
  sidebarMode: string;
  setSidebarMode: (mode: string) => void;
  sidebarData: Lesson[] | null;
  setSidebarData: (data: Lesson[] | null) => void;
  activeLessonId: number | string | null;
  setActiveLessonId: (id: number | string | null) => void;
  lessonHandlers: LessonHandlers;
  setLessonHandlers: (handlers: LessonHandlers) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
}) => {
  const [activeSidebar, setActiveSidebar] = useState("course_library");
  const [sidebarMode, setSidebarMode] = useState("default");
  const [sidebarData, setSidebarData] = useState<Lesson[] | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | string | null>(
    null,
  );
  const [lessonHandlers, setLessonHandlers] = useState<LessonHandlers>({
    onAdd: null,
    onDelete: null,
    onMoveUp: null,
    onMoveDown: null,
  });

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
        lessonHandlers,
        setLessonHandlers,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
