import React, { useState, useEffect } from "react";
import { useSidebar } from "../contexts/SidebarContext";
import { Info } from "lucide-react";
import {
  changeCourseStatus,
  dummyQuizApi,
  editLesson,
  generatCourseLesson,
  getQuizDetailbyLessonId,
} from "../services/api";
import toast from "react-hot-toast";

// Extracted Components
import MarkdownRenderer from "../components/MarkdownRenderer";
import LearningObjectives from "../components/LearningObjectives";
import LessonQuiz from "../components/LessonQuiz";
import LessonActions from "../components/LessonActions";
import CourseDetailHeader from "../components/CourseDetailHeader";

// Helpers
import {
  getSortedLessons,
  generateCourseSummary,
} from "../utils/courseHelpers";

const CourseDetail = ({ course, onLessonUpdate }) => {
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const { activeLessonId } = useSidebar();

  const [quizzes, setQuizzes] = useState(null);

  const sortedLessons = getSortedLessons(course?.lessons);
  const lessonData = sortedLessons.find((l) => l.id === activeLessonId);

  const fetchQuizbyLessonId = async (lesson_id) => {
    try {
      const response = await getQuizDetailbyLessonId(lesson_id);
      console.log("QuizbyLessonID: ", response[0]);
      setQuizzes(response[0]);
    } catch (error) {
      throw error;
    }
  };

  // This would get triggered every time user change
  useEffect(() => {
    if (lessonData) {
      console.log("Course: ", course);
      console.log("LessonData: ", lessonData);

      // Get Lesson Content
      setContent(lessonData.lesson_content || "");

      // Get Quiz
      fetchQuizbyLessonId(activeLessonId);

      // Improvement Note: Instead of fetching every quiz using GetQuizByLessonIdApi, access quiz from Course.Lessons.Quiz
      // Turns out its bad because we get All the Course Nested Data on Course Library
      // Eventough we might not even use it.
    }
  }, [lessonData, activeLessonId]);

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

  const handleSaveChanges = async () => {
    try {
      await editLesson(lessonData.id, content);
      onLessonUpdate(lessonData.id, content);
      toast.success("Lesson is Saved");
    } catch (error) {
      toast.error("Failed to save lesson");
    }
  };

  const handleGenerateLesson = async () => {
    try {
      const summary = generateCourseSummary(course);
      const response = await generatCourseLesson(
        summary,
        lessonData.lesson_name,
      );
      setContent(response.response.content);
    } catch (error) {
      toast.error("Failed to generate lesson");
    }
  };

  const handleTurnToDraft = async () => {
    try {
      await changeCourseStatus(course.id, "draft");
      toast.success("Course is saved into Draft");
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };
  const onAddQuestionButtonHandler = () => {
    setIsQuizModalOpen(true);
  };

  const onAddQuestionFormHandler = (question_data) => {
    console.log("Question Data: ", question_data);
    window.alert(JSON.stringify(question_data));

    const newQuestion = {
      quiz_id: quizzes.id,
      question_text: question_data.question_text,
      options:
        question_data?.options?.map((opt, index) => ({
          id: index + 1,
          option_text: opt.option_text,
          is_correct: opt.is_correct || false,
        })) || [],
    };

    // Update Frontend
    setQuizzes({
      ...quizzes,
      questions: [...quizzes.questions, newQuestion],
    });

    // Update Backend
  };

  const onDeleteQuestionHandler = (questionId) => {
    setQuizzes({
      ...quizzes,
      questions: quizzes.questions.filter((q) => q.id !== questionId),
    });
    toast.success("Question deleted");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans">
      <CourseDetailHeader
        lessonName={lessonData.lesson_name}
        courseName={course.course_name}
        lessonId={lessonData.id}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSaveChanges={handleSaveChanges}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* MAIN WORKSPACE */}
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
              <MarkdownRenderer content={content} />
            )}
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="w-95 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
          <LearningObjectives
            objectives={lessonData.lesson_learning_objectives}
          />
          <LessonQuiz
            quizzes={quizzes}
            lessonName={lessonData.lesson_name}
            isModalOpen={isQuizModalOpen}
            onCloseModal={() => setIsQuizModalOpen(false)}
            onQuizEdit={(question) => {
              // Store question being edited if needed
              setIsQuizModalOpen(true);
            }}
            onQuizDelete={onDeleteQuestionHandler}
            onAddQuestionButton={onAddQuestionButtonHandler}
            onAddQuestionForm={onAddQuestionFormHandler}
            onGenerateQuiz={() => console.log("Generate Quiz")}
          />
          <LessonActions
            onGenerateLesson={handleGenerateLesson}
            onClickTurnToDraft={handleTurnToDraft}
          />
        </aside>
      </div>
    </div>
  );
};

export default CourseDetail;
