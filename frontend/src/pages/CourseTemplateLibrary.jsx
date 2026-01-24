import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Target,
  Layers,
} from "lucide-react";
import { getCourse } from "../services/api";
import CourseTemplateStructureInfo from "../components/CourseTemplateStructureInfo";
import CourseCardItem from "../components/CourseCardItem";

const CourseTemplateLibrary = () => {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const course_data = await getCourse();

    // Filter the template course only
    // Improvement: Create endpoint that only fetch Course Template
    const filtered_course = course_data.filter(
      (course) => course.status === "template",
    );

    // For Debug
    // console.log("Filtered Course; ", filtered_course);

    setCourses(filtered_course);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Course Template Library
        </h1>
        <p className="text-gray-600">Manage your course syllabus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses?.map((course, idx) => (
          <CourseCardItem key={idx} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CourseTemplateLibrary;
