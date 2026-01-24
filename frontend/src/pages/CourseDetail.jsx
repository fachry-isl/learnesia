import React, { useState, useEffect } from "react";
import { useSidebar } from "../contexts/SidebarContext";
import { Save, RefreshCw, ExternalLink, Info, BookOpen } from "lucide-react";
import { changeCourseStatus, editLesson } from "../services/api";

const CourseDetail = ({ course, onLessonUpdate }) => {
  console.log("Course: ", course);
  const { activeLessonId } = useSidebar();

  // Sort lessons by order column before finding
  const sortedLessons = course?.lessons
    ? [...course.lessons].sort((a, b) => a.order - b.order)
    : [];

  // Find the lesson in the sorted lessons
  const lessonData = sortedLessons.find((l) => l.id === activeLessonId);
  // console.log("Lesson Data: ", lessonData);

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
      console.log("Body ChangeStatus: ", JSON.stringify({ status: newStatus }));
      const response = await changeCourseStatus(course_id, newStatus);

      console.log("On ChangeStatus Course API: ", response);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  // By default each course start from a Template or Structure
  // This function will turn it into Draft
  // Draft then can be Turn into Pusblished
  const onClickTurntoDraft = () => {
    // Pass course id and new course status (draft)
    changeCourseStatusApi(course.id, "draft");
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

          <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[500px] border-none focus:ring-0 font-mono text-sm leading-relaxed resize-none"
                placeholder="Start writing or let AI generate content..."
              />
            ) : (
              // Simple markdown-to-text rendering (or use a library like react-markdown)
              <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
                {content ||
                  "No content generated yet. Click 'Regenerate' to start."}
              </div>
            )}
          </div>
        </section>

        {/* 3. INTEL SIDEBAR (RIGHT) */}
        <aside className="w-[380px] flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
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
              <button className="w-full py-2 bg-white border-2 border-black font-bold text-sm hover:translate-x-1 transition-transform">
                Regenerate Content
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
