import React, { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Target,
  Layers,
} from "lucide-react";

const CourseLibrary = () => {
  const [expandedCourseObjectives, setExpandedCourseObjectives] = useState({});
  const [expandedLessonObjectives, setExpandedLessonObjectives] = useState({});

  const courses = [
    {
      id: 1,
      course_name: "Artificial Intelligence Fundamentals",
      course_learning_objectives: [
        "Understand AI basics",
        "Understanding Machine Learning (basics)",
        "Understanding the application of Neural Networks",
      ],
      course_description:
        "A comprehensive introduction to AI concepts and applications",
      lessons: [
        {
          lesson_name: "Introduction to AI",
          lesson_learning_objectives: [
            "Learn what AI is and its applications",
            "Understand the history and evolution of AI",
          ],
        },
        {
          lesson_name: "Machine Learning Basics",
          lesson_learning_objectives: [
            "Understand supervised and unsupervised learning",
            "Learn about common ML algorithms",
          ],
        },
        {
          lesson_name: "Neural Networks",
          lesson_learning_objectives: [
            "Learn how neural networks work and their applications",
            "Understand backpropagation and training processes",
          ],
        },
      ],
    },
    {
      id: 2,
      course_name: "Full-Stack Web Development Bootcamp",
      course_learning_objectives: [
        "Build complete web applications from scratch",
        "Master front-end and back-end technologies",
        "Deploy production-ready applications",
      ],
      course_description:
        "Master modern web development with hands-on projects",
      lessons: [
        {
          lesson_name: "HTML & CSS Foundations",
          lesson_learning_objectives: [
            "Create semantic HTML structures",
            "Style responsive layouts with CSS",
          ],
        },
        {
          lesson_name: "JavaScript Essentials",
          lesson_learning_objectives: [
            "Master JavaScript fundamentals",
            "Work with DOM manipulation",
            "Understand asynchronous programming",
          ],
        },
        {
          lesson_name: "React.js Framework",
          lesson_learning_objectives: [
            "Build component-based UIs",
            "Manage state with hooks",
          ],
        },
        {
          lesson_name: "Node.js and Express",
          lesson_learning_objectives: [
            "Create RESTful APIs",
            "Implement authentication",
            "Connect to databases",
          ],
        },
      ],
    },
    {
      id: 3,
      course_name: "Data Science with Python",
      course_learning_objectives: [
        "Analyze data using Python libraries",
        "Build predictive models",
        "Visualize data insights effectively",
      ],
      course_description:
        "Transform raw data into actionable insights using Python",
      lessons: [
        {
          lesson_name: "Python for Data Analysis",
          lesson_learning_objectives: [
            "Use pandas for data manipulation",
            "Clean and preprocess datasets",
            "Perform exploratory data analysis",
          ],
        },
        {
          lesson_name: "Statistical Methods",
          lesson_learning_objectives: [
            "Apply statistical tests",
            "Interpret statistical results",
          ],
        },
        {
          lesson_name: "Machine Learning Models",
          lesson_learning_objectives: [
            "Build classification and regression models",
            "Evaluate model performance",
            "Deploy models to production",
          ],
        },
      ],
    },
    {
      id: 4,
      course_name: "UX Design Principles",
      course_learning_objectives: [
        "Apply user-centered design methodologies",
        "Create effective wireframes and prototypes",
        "Conduct user research and usability testing",
      ],
      course_description:
        "Learn user-centered design methodologies and best practices",
      lessons: [
        {
          lesson_name: "User Research Methods",
          lesson_learning_objectives: [
            "Plan and conduct user interviews",
            "Analyze user research data",
            "Create user personas",
          ],
        },
        {
          lesson_name: "Wireframing and Prototyping",
          lesson_learning_objectives: [
            "Design low and high-fidelity wireframes",
            "Build interactive prototypes",
            "Test prototypes with users",
          ],
        },
      ],
    },
  ];

  const toggleCourseObjectives = (courseId) => {
    setExpandedCourseObjectives((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const toggleLessonObjectives = (courseId, lessonIndex) => {
    const key = `${courseId}-${lessonIndex}`;
    setExpandedLessonObjectives((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Course Library
        </h1>
        <p className="text-gray-600">Manage your course syllabus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-gray-900" />
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">
              {course.course_name}
            </h3>
            <p className="text-gray-600 text-xs mb-3">
              {course.course_description}
            </p>

            {/* Course Learning Objectives */}
            <div className="mb-3">
              <button
                onClick={() => toggleCourseObjectives(course.id)}
                className="w-full flex items-center justify-between p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-gray-900" />
                  <span className="text-xs font-semibold text-gray-900">
                    Course Learning Objectives
                  </span>
                </div>
                {expandedCourseObjectives[course.id] ? (
                  <ChevronDown className="w-4 h-4 text-gray-900" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-900" />
                )}
              </button>
              {expandedCourseObjectives[course.id] && (
                <div className="mt-2 space-y-1.5 pl-2">
                  {course.course_learning_objectives.map((objective, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-gray-700"
                    >
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span className="leading-relaxed">{objective}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Structure Info */}
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-gray-900" />
                <span className="text-xs font-semibold text-gray-700">
                  Structure
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">Lessons</div>
                  <div className="text-base font-bold text-gray-900">
                    {course.lessons.length}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">Avg/Les</div>
                  <div className="text-base font-bold text-gray-900">
                    {(
                      course.lessons.reduce(
                        (sum, lesson) =>
                          sum + lesson.lesson_learning_objectives.length,
                        0
                      ) / course.lessons.length
                    ).toFixed(1)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-base font-bold text-gray-900">
                    {course.lessons.reduce(
                      (sum, lesson) =>
                        sum + lesson.lesson_learning_objectives.length,
                      0
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons with Objectives */}
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => toggleLessonObjectives(course.id, idx)}
                    className="w-full flex items-start gap-2 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded transition-colors"
                  >
                    <div className="w-4 h-4 rounded bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-white">
                        {idx + 1}
                      </span>
                    </div>
                    <span className="flex-1 text-left leading-relaxed">
                      {lesson.lesson_name}
                    </span>
                    {expandedLessonObjectives[`${course.id}-${idx}`] ? (
                      <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                  {expandedLessonObjectives[`${course.id}-${idx}`] && (
                    <div className="mt-1.5 ml-6 space-y-1 pb-2">
                      {lesson.lesson_learning_objectives.map(
                        (objective, objIdx) => (
                          <div
                            key={objIdx}
                            className="flex items-start gap-2 text-xs text-gray-600"
                          >
                            <span className="text-gray-900 mt-0.5">•</span>
                            <span className="leading-relaxed">{objective}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseLibrary;
