"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { getCourse } from "@/services/api";
import PublicCourseCard from "@/components/public/PublicCourseCard";

export default function CourseLibraryPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const primaryCategories = [
    "All",
    "New",
    "Project Management",
    "Leadership & Management",
    "Finance",
    "Soft Skills",
    "AI/Machine Learning",
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, selectedPrimaryCategory]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const courseData = await getCourse();
      const publishedCourses = courseData.filter((course) => course.status === "published");
      setCourses(publishedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.course_description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredCourses(filtered);
  };

  return (
    <div className="min-h-screen">
      <section className="border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black font-jakarta text-gray-900 mb-4">
            Bite-sized learning,
            <br />
            big time impact
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-medium mb-8 max-w-2xl mx-auto">
            Smartly Curated Content. Available at your Fingertips.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a course"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 text-base border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {primaryCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedPrimaryCategory(category)}
                className={`px-6 py-2 rounded-full font-bold font-space text-sm whitespace-nowrap border-2 transition-all ${
                  selectedPrimaryCategory === category
                    ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="sr-only">Course catalog</h2>
        <p className="text-gray-600 font-medium font-space">{filteredCourses.length} courses</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16" aria-labelledby="course-grid-heading">
        <h2 id="course-grid-heading" className="sr-only">
          All courses
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-bold">Loading courses...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-bold text-gray-600 mb-2">No courses found</p>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <PublicCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
