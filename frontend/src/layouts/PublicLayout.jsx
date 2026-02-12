import { Outlet } from "react-router-dom";
import learnesiaLogo from "../assets/li_logo_full.png";
import Navbar from "../components/public/Navbar";

const PublicLayout = () => {
  return (
    <div className="min-h-screen relative flex flex-col pt-20 z-0">
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

      <Navbar />

      <div className="flex-1 flex items-center justify-center overflow-hidden py-12 px-4 relative z-10">
        {/* Main content */}
        <div className="relative flex flex-col w-full max-w-2xl">
          {/* Child content (Home page content) */}
          <main className="flex justify-center">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
