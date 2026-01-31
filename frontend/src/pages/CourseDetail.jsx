import React, { useState, useEffect } from "react";
import { useSidebar } from "../contexts/SidebarContext";
import { Save, RefreshCw, ExternalLink, Info, BookOpen } from "lucide-react";
import {
  changeCourseStatus,
  editLesson,
  generatCourseLesson,
} from "../services/api";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CourseDetail = ({ course, onLessonUpdate }) => {
  // console.log("Course: ", course);
  const { activeLessonId } = useSidebar();
  console.log("Active Lesson (ID): ", activeLessonId);

  // Sort lessons by order column before finding
  const sortedLessons = course?.lessons
    ? [...course.lessons].sort((a, b) => a.order - b.order)
    : [];

  // Find the lesson in the sorted lessons
  // console.log("Sorted Lessons: ", sortedLessons);
  const lessonData = sortedLessons.find((l) => l.id === activeLessonId);
  // console.log("Lesson Data: ", lessonData);
  console.log("Active Lesson: ", lessonData.lesson_name);

  // Local state for editability
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (lessonData) {
      setContent(lessonData.lesson_content || "");
    }
  }, [lessonData, activeLessonId]);

  const updateLessonApi = async (lesson_id, lesson_content) => {
    console.log(lesson_id, lesson_content);
    const response = await editLesson(lesson_id, lesson_content);
    console.log(JSON.stringify(response));
  };

  const onSaveChanges = () => {
    try {
      // Update lesson on the backend
      updateLessonApi(lessonData.id, content);

      // Update lesson on the frontend
      onLessonUpdate(lessonData.id, content);

      toast.success("Lesson is Saved");
    } catch (error) {
      throw error;
    }
  };

  if (!lessonData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse">
        <Info className="w-12 h-12 mb-4 opacity-20" />
        <p className="italic font-medium text-lg">
          Select a lesson to begin refinement
        </p>
      </div>
    );
  }

  const changeCourseStatusApi = async (course_id, newStatus) => {
    try {
      // console.log("Body ChangeStatus: ", JSON.stringify({ status: newStatus }));
      const response = await changeCourseStatus(course_id, newStatus);

      toast.success("Course is saved into Draft");
      // console.log("On ChangeStatus Course API: ", response);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const onClickTurntoDraft = () => {
    changeCourseStatusApi(course.id, "draft");
  };

  const fetchGenerateLessonApi = async (course_structure, lesson_topic) => {
    try {
      const response = await generatCourseLesson(
        course_structure,
        lesson_topic,
      );

      return await response;
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  };

  const onGenerateLesson = async () => {
    let course_summary = `
Course Name: ${course.course_name}
Course Description: ${course.course_description}

Lessons:
`;

    // Sort Lesson First
    const sortedLessons_ = course?.lessons
      ? [...course.lessons].sort((a, b) => a.order - b.order)
      : [];
    for (let i = 0; i <= sortedLessons_.length - 1; i++) {
      const current_lesson = sortedLessons_[i];

      course_summary += `${current_lesson.lesson_name}: ${current_lesson.lesson_learning_objectives}`;
      course_summary += "\n";
    }

    // console.log(
    //   `Input onGenerateLesson: ${course_summary} and ${lessonData.lesson_name}`,
    // );

    console.log(course_summary);

    const response = await fetchGenerateLessonApi(
      course_summary,
      lessonData.lesson_name,
    );

    setContent(response.response.content);

    console.log("onGenerateLesson: ", JSON.stringify(await response));
  };

  // Custom markdown components for styling
  const markdownComponents = {
    // Custom code block with syntax highlighting
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-md my-4"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code
          className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-300"
          {...props}
        >
          {children}
        </code>
      );
    },
    // Custom heading styles
    h1: ({ children }) => (
      <h1 className="text-3xl font-black uppercase mb-4 mt-6 border-b-4 border-black pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold uppercase mb-3 mt-5 border-b-2 border-gray-400 pb-1">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>
    ),
    // Custom paragraph styling
    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    // Custom link styling
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors"
      >
        {children}
      </a>
    ),
    // Custom list styling
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
    ),
    // Custom blockquote styling
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-yellow-400 bg-yellow-50 pl-4 py-2 my-4 italic">
        {children}
      </blockquote>
    ),
    // Custom table styling
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-2 border-black">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-black text-white">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="border-2 border-black px-4 py-2 text-left font-bold uppercase text-sm">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-2 border-black px-4 py-2">{children}</td>
    ),
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans">
      {/* 1. TOP HEADER / TOOLBAR */}
      <header className="flex justify-between items-center mb-6 bg-white border-b-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            {lessonData.lesson_name}
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            Course: {course.course_name} <span className="text-black">•</span>{" "}
            ID: {lessonData.id}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 border-2 border-black font-bold transition-all active:translate-y-1 ${isEditing ? "bg-yellow-400" : "bg-white hover:bg-gray-100"}`}
          >
            {isEditing ? "VIEW PREVIEW" : "EDIT CONTENT"}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black font-bold hover:bg-gray-800 transition-all active:translate-y-1"
            onClick={onSaveChanges}
          >
            <Save className="w-4 h-4" /> SAVE CHANGES
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* 2. MAIN WORKSPACE (LEFT) */}
        <section className="flex-1 flex flex-col bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b-2 border-black">
            <span className="text-xs font-black uppercase tracking-widest px-2 py-1 bg-black text-white">
              Editor
            </span>
            <span className="text-[10px] font-bold text-gray-400">
              MARKDOWN SUPPORTED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-125 border-none focus:ring-0 font-mono text-sm leading-relaxed resize-none"
                placeholder="Start writing or let AI generate content..."
              />
            ) : (
              <div className="prose prose-slate max-w-none">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {content ||
                    "No content generated yet. Click 'Generate Lesson' to start."}
                </Markdown>
              </div>
            )}
          </div>
        </section>

        {/* 3. INTEL SIDEBAR (RIGHT) */}
        <aside className="w-95 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
          {/* Learning Objectives Section */}
          <div className="bg-yellow-100 border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Learning Objectives
            </h3>
            <ul className="space-y-3">
              {lessonData.lesson_learning_objectives?.map((objective, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-xs font-bold text-gray-800 leading-tight"
                >
                  <span className="text-black shrink-0">{idx + 1}.</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          {/* Research Sources Section */}
          <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" /> Research Sources
            </h3>
            <div className="space-y-4">
              {lessonData.sources?.length > 0 ? (
                lessonData.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="group p-3 border-2 border-black bg-gray-50 hover:bg-yellow-50 transition-colors"
                  >
                    <h4 className="text-xs font-black line-clamp-1 mb-1">
                      {source.metadata.title}
                    </h4>
                    <p className="text-[10px] text-gray-600 line-clamp-2 italic mb-2 leading-tight">
                      "{source.content}"
                    </p>
                    <a
                      href={source.metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold flex items-center gap-1 text-black hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> VISIT SOURCE
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">
                  No citations found for this lesson.
                </p>
              )}
            </div>
          </div>

          {/* AI Refinement Tools */}
          <div className="bg-blue-50 border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" /> AI Engine
            </h3>
            <div className="space-y-3">
              <button
                onClick={onGenerateLesson}
                className="w-full py-2 bg-white border-2 border-black font-bold text-sm hover:translate-x-1 transition-transform"
              >
                Generate Lesson
              </button>
              <button className="w-full py-2 bg-white border-2 border-black font-bold text-sm hover:translate-x-1 transition-transform">
                Clarify References
              </button>
            </div>
          </div>

          <div className="border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-3">
              <button
                onClick={onClickTurntoDraft}
                className="bg-white text-black w-full py-2 border-2 border-black font-bold text-sm cursor-pointer hover:text-white hover:bg-blue-500"
              >
                Turn to Draft
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetail;
