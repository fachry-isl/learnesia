import Link from "next/link";
import { BookOpen, Clock, Target, Layers } from "lucide-react";
import { courseOverviewPath } from "@/utils/seo";
import { getFlattenedLessons } from "@/utils/courseHelpers";

const PublicCourseCard = ({ course }) => {
  const lessons = getFlattenedLessons(course);
  const totalObjectives =
    lessons.reduce(
      (sum, lesson) => sum + (lesson.lesson_learning_objectives?.length || 0),
      0,
    ) || 0;

  const href = courseOverviewPath(course.course_slug);

  return (
    <Link
      href={href}
      className="group h-full flex flex-col bg-white rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 overflow-hidden"
    >
      <div className="h-40 bg-white flex items-center justify-center border-b-4 border-black">
        {course.course_thumbnail ? (
          <img
            src={course.course_thumbnail}
            alt={course.course_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="/li_logo_full.png"
            alt="Learnesia Logo"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-base font-black font-jakarta text-gray-900 mb-1.5 line-clamp-2 group-hover:text-black transition-colors">
          {course.course_name}
        </h3>

        <p className="text-xs text-gray-600 mb-3 flex-1">
          {course.course_description}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
            <BookOpen className="w-4 h-4 text-black-600" strokeWidth={2.5} />
            <div className="flex-1">
              <p className="text-[10px] font-bold font-space text-gray-500 uppercase leading-tight">
                Lessons
              </p>
              <p className="text-sm font-black text-gray-900">
                {lessons.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
            <Clock className="w-4 h-4 text-black" strokeWidth={2.5} />
            <div className="flex-1">
              <p className="text-[10px] font-bold font-space text-gray-500 uppercase leading-tight">
                Duration
              </p>
              <p className="text-sm font-black text-gray-900">
                {course.estimated_time}m
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
            <Target className="w-4 h-4 text-black" strokeWidth={2.5} />
            <div className="flex-1">
              <p className="text-[10px] font-bold font-space text-gray-500 uppercase leading-tight">
                Objectives
              </p>
              <p className="text-sm font-black text-gray-900">
                {totalObjectives}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black px-2 py-1.5 rounded">
            <Layers className="w-4 h-4 text-black" strokeWidth={2.5} />
            <div className="flex-1">
              <p className="text-[10px] font-bold font-space text-gray-500 uppercase leading-tight">
                Goals
              </p>
              <p className="text-sm font-black text-gray-900">
                {course.course_learning_objectives?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PublicCourseCard;
