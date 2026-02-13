import React from "react";
import learnesiaLogo from "../../assets/li_logo_full.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 z-50 px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <img src={learnesiaLogo} alt="Learnesia" className="h-10 w-auto" />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <a
            href="/"
            className="font-bold text-sm uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            Home
          </a>
          <a
            href="/courses"
            className="font-bold text-sm uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            Courses
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
