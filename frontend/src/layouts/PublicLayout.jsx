import { Outlet } from "react-router-dom";
import learnesiaLogo from "../assets/li_logo_full.png";

const PublicLayout = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-12 px-4">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Main content */}
      <div className="relative flex flex-col z-10 w-full max-w-2xl">
        {/* Child content (Home page content) */}
        <main className="flex justify-center">
          <Outlet />
        </main>

        {/* Bottom accent */}
        <div className="h-1 bg-black mt-12"></div>
      </div>
    </div>
  );
};

export default PublicLayout;
