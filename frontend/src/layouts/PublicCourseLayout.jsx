import React from "react";
import { Link, Outlet } from "react-router-dom";

const PublicCourseLayout = () => {
  return (
    <div>
      <Outlet /> {/* Renders overview/learn/lesson */}
    </div>
  );
};

export default PublicCourseLayout;
