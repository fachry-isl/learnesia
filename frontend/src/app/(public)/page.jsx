"use client";

import { useRouter } from "next/navigation";
import AnimatedUnderline from "@/components/public/AnimatedUnderline";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl md:text-5xl font-extrabold font-jakarta text-gray-900 mb-1 text-center">
        Microlearning dari Apapun,
        <br />
        Kapanpun, di Manapun.
      </h1>
      <AnimatedUnderline />

      <h2 className="mt-4 text-lg text-gray-800 font-medium max-w-xl mx-auto text-center">
        We made learning more accessible with AI curated content.
      </h2>

      <div className="mt-12 flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        <button
          className="flex-1 px-6 py-4 bg-black text-white font-black text-md uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150 flex items-center justify-center gap-3"
          onClick={() => router.push("/courses")}
        >
          Getting Started
          <ArrowRight className="w-7 h-7" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
