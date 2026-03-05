import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getLessonById,
  getCourseById,
  getQuizByLessonId,
  submitLessonFeedback,
} from "../../services/api";
import LessonQuizWidget from "../../components/public/LessonQuizWidget";
import LessonFeedbackModal from "../../components/public/LessonFeedbackModal";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Share2,
  Bookmark,
  Menu,
  X,
} from "lucide-react";
import MarkdownRenderer from "../../components/admin/MarkdownRenderer";
import { getSortedLessons } from "../../utils/courseHelpers";

const CourseLesson = () => {
  const { course_slug, lesson_slug } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const sortedLessons = course ? getSortedLessons(course?.lessons) : [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [lessonData, courseData] = await Promise.all([
          getLessonById(lesson_slug),
          getCourseById(course_slug),
        ]);

        setLesson(lessonData);
        setCourse(courseData);

        const quizData = await getQuizByLessonId(lessonData.id, "full");
        setQuiz(Array.isArray(quizData) ? quizData[0] : quizData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setIsSidebarOpen(false);

    // Scroll the independent main element to top, not the window
    const mainElement = document.getElementById("lesson-content-area");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [lesson_slug, course_slug]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLessonNavigation = (targetLesson) => {
    if (targetLesson) {
      setPendingNavigation({
        type: "lesson",
        path: `/course/${course_slug}/lesson/${targetLesson.lesson_slug}`,
      });
      setIsFeedbackModalOpen(true);
    }
  };

  const handleCompleteCourse = () => {
    setPendingNavigation({
      type: "overview",
      path: `/course/${course_slug}/overview`,
    });
    setIsFeedbackModalOpen(true);
  };

  const onFeedbackSubmit = async (feedbackData) => {
    try {
      await submitLessonFeedback({
        lesson: lesson.id,
        ...feedbackData,
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const onFeedbackModalClose = (wasSubmitted) => {
    setIsFeedbackModalOpen(false);
    if (pendingNavigation) {
      navigate(pendingNavigation.path);
      setPendingNavigation(null);
    }
  };

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

  const currentLessonIndex = sortedLessons?.findIndex(
    (l) => l.lesson_slug === lesson.lesson_slug,
  );
  const prevLesson =
    currentLessonIndex > 0 ? sortedLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < (sortedLessons?.length || 0) - 1
      ? sortedLessons[currentLessonIndex + 1]
      : null;

  return (
    /* FIXED VIEWPORT: Prevents the whole page from scrolling */
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <LessonFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={onFeedbackModalClose}
        onSubmit={onFeedbackSubmit}
        lessonName={lesson.lesson_name}
      />

      {/* Mobile Header (Fixed height) */}
      <div className="md:hidden border-b border-gray-100 shrink-0 z-50 flex items-center justify-between bg-white h-16 px-4">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600">
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <span className="font-bold text-gray-900 truncate max-w-[200px]">
          {course.course_name}
        </span>
        <div className="w-8"></div>
      </div>

      {/* Main Layout Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR: Scrollable only if content overflows its container */}
        <aside
          className={`
            fixed md:relative h-full w-full md:w-80 border-r border-gray-100 
            z-40 transition-transform duration-300 ease-in-out bg-white shrink-0
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            flex flex-col
          `}
          style={{
            top: isSidebarOpen ? "64px" : "0",
            height: isSidebarOpen ? "calc(100vh - 64px)" : "100%",
          }}
        >
          <div className="p-6 border-b border-gray-100 shrink-0">
            <Link
              to={`/course/${course_slug}/overview`}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-4 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Course
            </Link>
            <h2 className="text-xl font-black text-gray-900 leading-tight">
              {course.course_name}
            </h2>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-500">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-black h-1.5 rounded-full"
                  style={{
                    width: `${((currentLessonIndex + 1) / (sortedLessons?.length || 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <span>
                {Math.round(
                  ((currentLessonIndex + 1) / (sortedLessons?.length || 1)) *
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
              {sortedLessons?.map((l, index) => {
                const isActive = l.lesson_slug === lesson.lesson_slug;
                const isCompleted = index < currentLessonIndex;
                return (
                  <Link
                    key={l.lesson_slug}
                    to={`/course/${course_slug}/lesson/${l.lesson_slug}`}
                    className={`w-full flex items-start gap-3 px-6 py-3 transition-colors border-l-4 ${isActive ? "bg-gray-50 border-black text-gray-900" : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
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
                        <Clock className="w-3 h-3" />{" "}
                        {`${l.estimated_time} min`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* CONTENT AREA: Independent Scroll */}
        <main
          id="lesson-content-area"
          className="flex-1 min-w-0 h-full overflow-y-auto"
        >
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="hidden md:flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-bold text-gray-900">
                  Lesson {currentLessonIndex + 1}
                </span>
                <span className="text-gray-300">/</span>
                <span>{sortedLessons?.length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </nav>

            <article className="space-y-12 pb-24">
              <header className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded">
                    Current Lesson
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{`${lesson.estimated_time} min read`}</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                  {lesson.lesson_name}
                </h1>
                {lesson.lesson_learning_objectives?.length > 0 && (
                  <div className="border-2 border-black rounded-2xl p-6 bg-white">
                    <h2 className="text-xs font-black uppercase tracking-widest text-black mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-black" /> Learning
                      Objectives
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lesson.lesson_learning_objectives
                        .filter((obj) => !obj.toLowerCase().includes("time"))
                        .map((obj, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm font-medium text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 shrink-0"></div>{" "}
                            {obj}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </header>

              <section className="prose prose-lg max-w-none">
                <MarkdownRenderer
                  content={lesson.lesson_content || "No content available."}
                />
              </section>

              {quiz && <LessonQuizWidget quiz={quiz} />}

              <footer className="pt-12 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prevLesson ? (
                    <button
                      onClick={() => handleLessonNavigation(prevLesson)}
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
                    <div />
                  )}
                  {nextLesson ? (
                    <button
                      onClick={() => handleLessonNavigation(nextLesson)}
                      className="flex flex-col items-end p-4 rounded-xl bg-black text-white hover:bg-gray-800 transition-all text-right shadow-lg"
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
                      onClick={handleCompleteCourse}
                      className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg col-span-1 sm:col-start-2"
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
    </div>
  );
};

export default CourseLesson;
