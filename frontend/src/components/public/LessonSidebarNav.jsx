"use client";

import Link from "next/link";
import {
  Clock,
  CheckCircle,
  PlayCircle,
  Lock,
} from "lucide-react";
import { getSortedModules } from "@/utils/courseHelpers";

function LessonNavItem({
  lesson,
  courseSlug,
  globalIndex,
  isActive,
  currentLessonIndex,
  sortedLessons,
  grouped = false,
}) {
  const isCompleted = globalIndex < currentLessonIndex;

  let isUnlocked = globalIndex <= currentLessonIndex;
  if (!isUnlocked && typeof window !== "undefined") {
    const prevLessonSlug = sortedLessons[globalIndex - 1]?.lesson_slug;
    const prevProgress = prevLessonSlug
      ? JSON.parse(
          localStorage.getItem(`lesson_progress_${prevLessonSlug}`) || "{}",
        )
      : null;
    isUnlocked = prevProgress?.hasRead && prevProgress?.quizPassed;
  }

  const itemClassName = `
    w-full flex items-start gap-3 ${grouped ? "pl-8 pr-6" : "px-6"} py-3 transition-colors border-l-4
    ${
      isActive
        ? "bg-gray-50 border-black text-gray-900"
        : isUnlocked
          ? "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          : "border-transparent text-gray-300 cursor-not-allowed"
    }
  `;

  const itemContent = (
    <>
      <div className="mt-0.5 shrink-0">
        {isActive ? (
          <PlayCircle className="w-4 h-4 text-black" />
        ) : isCompleted ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : !isUnlocked ? (
          <Lock className="w-4 h-4 text-gray-300" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 text-[10px] flex items-center justify-center font-bold text-gray-400">
            {globalIndex + 1}
          </div>
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-bold ${isActive ? "text-gray-900" : isUnlocked ? "text-gray-600" : "text-gray-300"}`}
        >
          {lesson.lesson_name}
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {`${lesson.estimated_time} min`}
        </p>
      </div>
    </>
  );

  if (isUnlocked) {
    return (
      <Link
        href={`/course/${courseSlug}/lesson/${lesson.lesson_slug}`}
        className={itemClassName}
      >
        {itemContent}
      </Link>
    );
  }

  return <div className={itemClassName}>{itemContent}</div>;
}

export default function LessonSidebarNav({
  courseSlug,
  modules,
  sortedLessons,
  activeLessonSlug,
  currentLessonIndex,
}) {
  const sortedModules = getSortedModules(modules);
  const indexBySlug = new Map(
    sortedLessons.map((lesson, index) => [lesson.lesson_slug, index]),
  );

  if (sortedModules.length > 0) {
    return (
      <nav className="space-y-4" aria-label="Course lessons by module">
        {sortedModules.map((module) => (
          <section key={module.id}>
            <h3 className="px-6 mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
              {module.name}
            </h3>
            <div className="space-y-1">
              {module.lessons?.map((lesson) => (
                <LessonNavItem
                  key={lesson.lesson_slug}
                  lesson={lesson}
                  courseSlug={courseSlug}
                  globalIndex={indexBySlug.get(lesson.lesson_slug) ?? 0}
                  isActive={lesson.lesson_slug === activeLessonSlug}
                  currentLessonIndex={currentLessonIndex}
                  sortedLessons={sortedLessons}
                  grouped
                />
              ))}
            </div>
          </section>
        ))}
      </nav>
    );
  }

  return (
    <nav className="space-y-1" aria-label="Course lessons">
      {sortedLessons.map((lesson, index) => (
        <LessonNavItem
          key={lesson.lesson_slug}
          lesson={lesson}
          courseSlug={courseSlug}
          globalIndex={index}
          isActive={lesson.lesson_slug === activeLessonSlug}
          currentLessonIndex={currentLessonIndex}
          sortedLessons={sortedLessons}
        />
      ))}
    </nav>
  );
}
