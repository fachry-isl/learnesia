import React from "react";
import AnimatedUnderline from "../../components/public/AnimatedUnderline";
import { ArrowRight, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <>
      {/* Main Centered Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-7xl mx-auto">
        {/* Badge/Tag */}
        {/* <div className="border-4 border-black bg-black text-white px-6 py-2 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-black uppercase tracking-wider">
            Self Improvement min. 1% sehari
          </p>
        </div> */}

        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-1 text-center">
          Microlearning dari Apapun,
          <br />
          Kapanpun, di Manapun.
        </h1>
        <AnimatedUnderline />

        {/* Description Box */}
        <p className="mt-4 text-lg text-gray-800 font-medium max-w-xl mx-auto">
          We made learning more accesible with AI curated content. <br />
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
          <button
            className="flex-1 px-6 py-4 bg-black text-white font-black text-md uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150 flex items-center justify-center gap-3"
            onClick={() => navigate("/courses")}
          >
            Getting Started
            <ArrowRight className="w-7 h-7" strokeWidth={3} />
          </button>

          <button className="flex-1 px-4 py-4 bg-white text-black font-black text-md uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150 flex items-center justify-center gap-3">
            Learn More
            <Sparkles className="w-7 h-7" strokeWidth={3} />
          </button>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-black mt-12 w-full"></div>
      </main>
    </>
  );
};

export default Home;
