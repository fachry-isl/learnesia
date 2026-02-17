import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getLessonById, getCourseById } from "../../services/api";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Share2,
  Bookmark,
  MoreHorizontal,
  Menu,
  X,
} from "lucide-react";
import MarkdownRenderer from "../../components/admin/MarkdownRenderer";
import { getSortedLessons } from "../../utils/courseHelpers";

const CourseLesson = () => {
  const { course_slug, lesson_id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const sortedLessons = course ? getSortedLessons(course?.lesson) : [];
  // const lessonData = sortedLessons.find((l) => l.id === activeLessonId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch both lesson and course data in parallel
        const [lessonData, courseData] = await Promise.all([
          getLessonById(lesson_id),
          getCourseById(course_slug),
        ]);
        setLesson(lessonData);
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Close sidebar on navigation change on mobile
    setIsSidebarOpen(false);
  }, [lesson_id, course_slug]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-gray-500 uppercase tracking-widest text-sm">
          Loading Content...
        </p>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-2xl font-black text-gray-900 mb-4">
          Content Not Found
        </h1>
        <button
          onClick={() => navigate(`/course/${course_slug}/overview`)}
          className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Course Overview
        </button>
      </div>
    );
  }

  // Find current lesson index to determine prev/next
  const currentLessonIndex = course.lessons?.findIndex(
    (l) => l.id === parseInt(lesson_id) || l.id === lesson.id,
  );

  const prevLesson =
    currentLessonIndex > 0 ? course.lessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < (course.lessons?.length || 0) - 1
      ? course.lessons[currentLessonIndex + 1]
      : null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-gray-100 p-4 sticky top-0 z-50 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-lg"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <span className="font-bold text-gray-900 truncate max-w-[200px]">
          {course.course_name}
        </span>
        <div className="w-8"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed md:sticky md:top-0 h-[calc(100vh-65px)] md:h-screen w-full md:w-80 border-r border-gray-100 
          overflow-y-auto z-40 transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
          flex flex-col
        `}
        style={{ top: isSidebarOpen ? "65px" : "0" }}
      >
        <div className="p-6 border-b border-gray-100">
          <Link
            to={`/course/${course_slug}/overview`}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Course
          </Link>
          <h2 className="text-xl font-black text-gray-900 leading-tight">
            {course.course_name}
          </h2>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-black h-1.5 rounded-full"
                style={{
                  width: `${
                    ((currentLessonIndex + 1) / (course.lessons?.length || 1)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            <span>
              {Math.round(
                ((currentLessonIndex + 1) / (course.lessons?.length || 1)) *
                  100,
              )}
              %
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-6 mb-2 text-xs font-black uppercase tracking-widest text-gray-400">
            Lessons
          </div>
          <nav className="space-y-1">
            {course.lessons?.map((l, index) => {
              const isActive = l.id === lesson.id;
              const isCompleted = index < currentLessonIndex;

              return (
                <Link
                  key={l.id}
                  to={`/course/${course_slug}/lesson/${l.id}`}
                  className={`
                    w-full flex items-start gap-3 px-6 py-3 transition-colors border-l-4
                    ${
                      isActive
                        ? "bg-gray-50 border-black text-gray-900"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <div className="mt-0.5 shrink-0">
                    {isActive ? (
                      <PlayCircle className="w-4 h-4 text-black" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 text-[10px] flex items-center justify-center font-bold text-gray-400">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-600"}`}
                    >
                      {l.lesson_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {l.duration || "15 min"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
        {/* Helper Navigation (Mobile overlay) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Top Navigation Bar (Desktop) */}
          <nav className="hidden md:flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-bold text-gray-900">
                Lesson {currentLessonIndex + 1}
              </span>
              <span className="text-gray-300">/</span>
              <span>{course.lessons?.length || 0}</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </nav>

          <article className="space-y-12 pb-24">
            {/* Hero Section */}
            <header className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded">
                  Current Lesson
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lesson.duration || "15 min read"}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                {lesson.lesson_name}
              </h1>

              {lesson.lesson_learning_objectives &&
                lesson.lesson_learning_objectives.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-black" />
                      Learning Objectives
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lesson.lesson_learning_objectives
                        .filter((obj) => !obj.toLowerCase().includes("time"))
                        .map((obj, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm font-medium text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 shrink-0"></div>
                            {obj}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </header>

            {/* Lesson Content */}
            <section className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900 prose-img:rounded-xl">
              <MarkdownRenderer
                content={
                  lesson.lesson_content ||
                  "No content available for this lesson."
                }
              />
            </section>

            {/* Footer Controls */}
            <footer className="pt-12 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevLesson ? (
                  <button
                    onClick={() =>
                      navigate(`/course/${course_slug}/lesson/${prevLesson.id}`)
                    }
                    className="flex flex-col items-start p-4 rounded-xl border-2 border-gray-100 hover:border-black transition-all group text-left"
                  >
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3" /> Previous
                    </span>
                    <span className="font-bold text-gray-900 group-hover:underline">
                      {prevLesson.lesson_name}
                    </span>
                  </button>
                ) : (
                  <div /> // Empty div to maintain grid layout if no prev lesson
                )}

                {nextLesson ? (
                  <button
                    onClick={() =>
                      navigate(`/course/${course_slug}/lesson/${nextLesson.id}`)
                    }
                    className="flex flex-col items-end p-4 rounded-xl bg-black text-white hover:bg-gray-800 transition-all text-right shadow-lg shadow-gray-200"
                  >
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      Next <ChevronRight className="w-3 h-3" />
                    </span>
                    <span className="font-bold text-white">
                      {nextLesson.lesson_name}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/course/${course_slug}/overview`)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all text-center shadow-lg shadow-green-200 col-span-1 sm:col-start-2"
                  >
                    <span className="font-bold text-white flex items-center gap-2">
                      Complete Course <CheckCircle className="w-5 h-5" />
                    </span>
                  </button>
                )}
              </div>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
};

export default CourseLesson;
