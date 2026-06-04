export const getSortedLessons = (lessons) => {
  return lessons ? [...lessons].sort((a, b) => a.order - b.order) : [];
};

export const getSortedModules = (modules) => {
  if (!modules?.length) return [];
  return [...modules]
    .sort((a, b) => a.order - b.order)
    .map((module) => ({
      ...module,
      lessons: getSortedLessons(module.lessons),
    }));
};

/** Lessons from all modules, in module then lesson order. */
export const getFlattenedLessons = (course) => {
  if (!course?.modules?.length) {
    return getSortedLessons(course?.lessons);
  }
  return getSortedModules(course.modules).flatMap((module) => module.lessons);
};

export const generateCourseSummary = (course) => {
  const sortedLessons = getSortedLessons(course?.lessons);
  let summary = `Course Name: ${course.course_name}\nCourse Description: ${course.course_description}\n\nLessons:\n`;

  sortedLessons.forEach((lesson) => {
    summary += `${lesson.lesson_name}: ${lesson.lesson_learning_objectives}\n`;
  });

  return summary;
};
