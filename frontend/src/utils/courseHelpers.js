export const getSortedLessons = (lessons) => {
  return lessons ? [...lessons].sort((a, b) => a.order - b.order) : [];
};

export const generateCourseSummary = (course) => {
  const sortedLessons = getSortedLessons(course?.lessons);
  let summary = `Course Name: ${course.course_name}\nCourse Description: ${course.course_description}\n\nLessons:\n`;

  sortedLessons.forEach((lesson) => {
    summary += `${lesson.lesson_name}: ${lesson.lesson_learning_objectives}\n`;
  });

  return summary;
};
