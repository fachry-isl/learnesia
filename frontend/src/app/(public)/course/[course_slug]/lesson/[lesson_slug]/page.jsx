"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getLessonById,
  getCourseById,
  getQuizByLessonId,
  getLessonCitations,
  submitLessonFeedback,
} from "@/services/api";
import LessonQuizWidget from "@/components/public/LessonQuizWidget";
import LessonFeedbackModal from "@/components/public/LessonFeedbackModal";
import ContentBlockSequence, {
  lessonHasQuizBlocks,
} from "@/components/public/ContentBlockSequence";
import LessonSourcesList from "@/components/public/LessonSourcesList";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Share2,
  Bookmark,
  Menu,
  X,
} from "lucide-react";
import { getFlattenedLessons } from "@/utils/courseHelpers";
import LessonSidebarNav from "@/components/public/LessonSidebarNav";

export default function CourseLessonPage() {
  const { course_slug, lesson_slug } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [citations, setCitations] = useState([]);
  const [supplementary, setSupplementary] = useState([]);
  const [passedQuizBlockIds, setPassedQuizBlockIds] = useState([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [progress, setProgress] = useState({
    slug: lesson_slug,
    hasRead: false,
    quizPassed: false,
  });

  const sortedLessons = course ? getFlattenedLessons(course) : [];
  const contentBlocks = lesson?.content_blocks ?? [];
  const usesBlockQuizzes = lessonHasQuizBlocks(contentBlocks);
  const quizBlockIds = contentBlocks
    .filter(
      (block) =>
        block.block_type === "quiz" && block.quiz?.questions?.length > 0,
    )
    .map((block) => block.id);
  const allBlockQuizzesPassed =
    quizBlockIds.length > 0 &&
    quizBlockIds.every((id) => passedQuizBlockIds.includes(id));
  const quizRequirementMet = usesBlockQuizzes
    ? quizBlockIds.length === 0 || allBlockQuizzesPassed
    : progress.quizPassed;

  useEffect(() => {
    if (typeof window === "undefined" || !lesson_slug) return;
    const savedProgress = localStorage.getItem(`lesson_progress_${lesson_slug}`);
    if (savedProgress) {
      setProgress({ ...JSON.parse(savedProgress), slug: lesson_slug });
    } else {
      setProgress({ slug: lesson_slug, hasRead: false, quizPassed: false });
    }
  }, [lesson_slug]);

  useEffect(() => {
    if (typeof window === "undefined" || !lesson_slug) return;
    if (progress.slug === lesson_slug && (progress.hasRead || progress.quizPassed)) {
      const { slug, ...saveData } = progress;
      localStorage.setItem(`lesson_progress_${lesson_slug}`, JSON.stringify(saveData));
    }
  }, [progress, lesson_slug]);

  // Intersection Observer for reading detection
  useEffect(() => {
    if (isLoading || !lesson) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setProgress((prev) => ({ ...prev, hasRead: true }));
        }
      },
      { threshold: 1.0 },
    );

    const sentinel = document.getElementById("reading-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [isLoading, lesson]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [lessonData, courseData] = await Promise.all([
          getLessonById(lesson_slug),
          getCourseById(course_slug),
        ]);

        const [citationList, supplementaryList] = await Promise.all([
          getLessonCitations(lessonData.id, { role: "citation" }).catch(() => []),
          getLessonCitations(lessonData.id, { role: "supplementary" }).catch(
            () => [],
          ),
        ]);

        setLesson(lessonData);
        setCourse(courseData);
        setCitations(citationList);
        setSupplementary(supplementaryList);
        setPassedQuizBlockIds([]);

        if (!lessonHasQuizBlocks(lessonData.content_blocks)) {
          const quizData = await getQuizByLessonId(lessonData.id, "full");
          const resolved = Array.isArray(quizData) ? quizData[0] : quizData;
          setQuiz(resolved ?? null);
          if (!resolved?.questions?.length) {
            setProgress((prev) => ({ ...prev, quizPassed: true }));
          }
        } else {
          setQuiz(null);
        }
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
      router.push(pendingNavigation.path);
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
          onClick={() => router.push(`/course/${course_slug}/overview`)}
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
              href={`/course/${course_slug}/overview`}
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
              {course.modules?.length ? "Modules" : "Lessons"}
            </div>
            <LessonSidebarNav
              courseSlug={course_slug}
              modules={course.modules}
              sortedLessons={sortedLessons}
              activeLessonSlug={lesson.lesson_slug}
              currentLessonIndex={currentLessonIndex}
            />
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

              <ContentBlockSequence
                blocks={contentBlocks}
                legacyMarkdown={lesson.lesson_content}
                onQuizComplete={(blockId) => {
                  setPassedQuizBlockIds((prev) => {
                    const next = prev.includes(blockId) ? prev : [...prev, blockId];
                    const ids = (lesson?.content_blocks ?? [])
                      .filter(
                        (b) =>
                          b.block_type === "quiz" &&
                          b.quiz?.questions?.length > 0,
                      )
                      .map((b) => b.id);
                    if (ids.length > 0 && ids.every((id) => next.includes(id))) {
                      setProgress((p) => ({ ...p, quizPassed: true }));
                    }
                    return next;
                  });
                }}
              />

              {!usesBlockQuizzes && quiz ? (
                <LessonQuizWidget
                  quiz={quiz}
                  onComplete={() =>
                    setProgress((prev) => ({ ...prev, quizPassed: true }))
                  }
                />
              ) : null}

              <LessonSourcesList
                citations={citations}
                supplementary={supplementary}
              />

              {/* Sentinel for reading detection */}
              <div id="reading-sentinel" className="h-4 w-full" />

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
                      disabled={!(progress.hasRead && quizRequirementMet)}
                      onClick={() => handleLessonNavigation(nextLesson)}
                      className={`flex flex-col items-end p-4 rounded-xl transition-all text-right shadow-lg ${
                        progress.hasRead && quizRequirementMet
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        Next <ChevronRight className="w-3 h-3" />
                      </span>
                      <span className="font-bold">
                        {nextLesson.lesson_name}
                      </span>
                      {!(progress.hasRead && quizRequirementMet) && (
                        <span className="text-[10px] mt-1 font-bold text-red-400 uppercase tracking-tighter">
                          Complete Reading & Quiz to Unlock
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled={!(progress.hasRead && quizRequirementMet)}
                      onClick={handleCompleteCourse}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all shadow-lg col-span-1 sm:col-start-2 ${
                        progress.hasRead && quizRequirementMet
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <span className="font-bold flex items-center gap-2">
                        Complete Course <CheckCircle className="w-5 h-5" />
                      </span>
                      {!(progress.hasRead && quizRequirementMet) && (
                        <span className="text-[10px] mt-1 font-bold text-red-400 uppercase tracking-tighter">
                          Complete Reading & Quiz to Unlock
                        </span>
                      )}
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
}
