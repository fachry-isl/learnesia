"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/public/Navbar";

export default function PublicLayout({ children }) {
  const pathname = usePathname();
  const isLessonPage = pathname.includes("/lesson/");

  return (
    <div
      className={`relative flex flex-col z-0 ${
        isLessonPage ? "h-screen overflow-hidden" : "min-h-screen"
      } ${isLessonPage ? "md:pt-20" : "pt-20"}`}
    >
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      <div className={isLessonPage ? "hidden md:block" : "block"}>
        <Navbar />
      </div>

      <div className="flex-1 relative z-10 w-full flex flex-col">{children}</div>
    </div>
  );
}
