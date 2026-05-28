"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
  const pathname = usePathname();
  const isLessonPage = pathname.includes("/lesson/");

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-20 z-50 px-6 transition-colors duration-300 ${
        isLessonPage && "bg-white border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/li_logo_full.png" alt="Learnesia" className="h-10 w-auto" />
        </div>

        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-bold text-sm uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/courses"
            className="font-bold text-sm uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            Courses
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
