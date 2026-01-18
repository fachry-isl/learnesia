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

  return (
    <SidebarContext.Provider value={{ activeSidebar, setActiveSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
