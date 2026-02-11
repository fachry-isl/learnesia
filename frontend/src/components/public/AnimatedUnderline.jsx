import React, { useEffect, useRef } from "react";

const AnimatedUnderline = () => {
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const length = path.getTotalLength();

    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    // Trigger the animation
    setTimeout(() => {
      path.style.transition =
        "stroke-dashoffset 1.5s cubic-bezier(0.77,0,0.18,1)";
      path.style.strokeDashoffset = 0;
    }, 300);
  }, []);

  return (
    <svg
      viewBox="0 0 400 24"
      className="w-full max-w-2xl mt-4 mx-auto"
      height={24}
      width="100%"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d="M10 14 Q 200 32 390 14"
        stroke="#000"
        strokeWidth="6"
        fill="none"
      />
    </svg>
  );
};

export default AnimatedUnderline;
