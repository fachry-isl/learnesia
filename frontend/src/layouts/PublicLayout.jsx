import { Outlet, useLocation } from "react-router-dom";
import learnesiaLogo from "../assets/li_logo_full.png";
import Navbar from "../components/public/Navbar";

const PublicLayout = () => {
  const location = useLocation();
  const isLessonPage = location.pathname.includes("/lesson/");

  return (
    <div
      className={`relative flex flex-col z-0 ${
        /* 1. Use h-screen and overflow-hidden to lock the viewport on lesson pages */
        isLessonPage ? "h-screen overflow-hidden" : "min-h-screen"
      } ${isLessonPage ? "md:pt-20" : "pt-20"}`}
    >
      {/* Grid background - Spans the whole screen including under the Navbar */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Hide global navbar on mobile if it's a lesson page */}
      <div className={isLessonPage ? "hidden md:block" : "block"}>
        <Navbar />
      </div>

      <div className="flex-1 relative z-10 w-full flex flex-col">
        {/* Main content */}
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
