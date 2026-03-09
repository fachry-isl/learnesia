import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Use Link
import { getCourse } from "../../services/api";
import CourseCardItem from "../../components/admin/CourseCardItem";
import { useSidebar } from "../../contexts/SidebarContext";

const AdminCourseLibrary = () => {
  const [courses, setCourses] = useState(null);
  const { setSidebarMode } = useSidebar();

  useEffect(() => {
    // Reset sidebar to default when visiting this page
    setSidebarMode("default");
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const course_data = await getCourse();
    // const filtered_course = course_data.filter(
    //   (course) => course.status === "draft" || course.status === "published",
    //);
    setCourses(course_data);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Course Library
        </h1>
        <p className="text-gray-600">Draft and Published Course</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses?.map((course, idx) => (
          // Improve: Wrap Card in Link
          <Link to={`${course.course_slug}`} key={idx}>
            <CourseCardItem course={course} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminCourseLibrary;
