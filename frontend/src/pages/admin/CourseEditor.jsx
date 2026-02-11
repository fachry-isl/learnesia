import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import { Info } from "lucide-react";
import {
  getCourseById,
  changeCourseStatus,
  createQuiz,
  createQuizQuestion,
  deleteQuizQuestion,
  editLesson,
  getQuizDetailbyLessonId,
  generateCourseLesson,
} from "../../services/api";
import toast from "react-hot-toast";

// Extracted Components
import MarkdownRenderer from "../../components/admin/MarkdownRenderer";
import LearningObjectives from "../../components/admin/LearningObjectives";
import LessonQuiz from "../../components/admin/LessonQuiz";
import LessonActions from "../../components/admin/LessonActions";
import CourseDetailHeader from "../../components/admin/CourseDetailHeader";

// Helpers
import {
  getSortedLessons,
  generateCourseSummary,
} from "../../utils/courseHelpers";
import { useQuizQuestionModal } from "../../contexts/QuizQuestionModalContext";

const CourseEditor = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadQuiz, setIsLoadQuiz] = useState(false);

  const { activeLessonId, setSidebarMode, setSidebarData, setActiveLessonId } =
    useSidebar();

  const [quizzes, setQuizzes] = useState(null);
  const { setIsQuizModalOpen, setQuestionData, questionData } =
    useQuizQuestionModal();

  const sortedLessons = course ? getSortedLessons(course?.lessons) : [];
  const lessonData = sortedLessons.find((l) => l.id === activeLessonId);

  useEffect(() => {
    const fetchCourseData = async () => {
      // 1. Fetch Data
      try {
        const foundCourse = await getCourseById(id);

        if (foundCourse) {
          setCourse(foundCourse);

          // 2. Configure Sidebar for "Detail Mode"
          setSidebarMode("course_detail");

          // Sort lessons for sidebar
          const sortedLessons = foundCourse?.lessons
            ? [...foundCourse.lessons].sort((a, b) => a.order - b.order)
            : [];
          setSidebarData(sortedLessons);

          // Default to first lesson if none selected
          if (sortedLessons.length > 0) {
            setActiveLessonId(sortedLessons[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
        toast.error("Failed to load course");
      }
    };

    fetchCourseData();
  }, [id]);

  const fetchQuizbyLessonId = async (lesson_id) => {
    try {
      const response = await getQuizDetailbyLessonId(lesson_id);
      // console.log("QuizbyLessonID: ", response[0]);
      setQuizzes(response[0]);
    } catch (error) {
      throw error;
    }
  };

  // useEffect(() => {
  //   console.log("isLoadQuiz changed:", isLoadQuiz);
  // }, [isLoadQuiz]);

  // This would get triggered every time user change lesson
  useEffect(() => {
    if (lessonData) {
      // console.log("Course: ", course);
      // console.log("LessonData: ", lessonData);
      // Get Lesson Content
      setContent(lessonData.lesson_content || "");
    }
    const loadQuiz = async () => {
      if (!activeLessonId) return;
      setIsLoadQuiz(true);
      try {
        await fetchQuizbyLessonId(activeLessonId);
      } catch (error) {
        console.error("fetchQuiz error:", error);
      }
      setIsLoadQuiz(false);
    };

    loadQuiz();
    // Improvement Note: Instead of fetching every quiz using GetQuizByLessonIdApi, access quiz from Course.Lessons.Quiz
    // Turns out its bad because we get All the Course Nested Data on Course Library
    // Eventough we might not even use it.
  }, [lessonData, activeLessonId]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading course editor...</p>
      </div>
    );
  }

  const handleSaveChanges = async () => {
    try {
      await editLesson(lessonData.id, content);

      // Local state update to reflect changes immediately
      setCourse((prev) => ({
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === lessonData.id ? { ...l, lesson_content: content } : l,
        ),
      }));

      toast.success("Lesson is Saved");
    } catch (error) {
      toast.error("Failed to save lesson");
    }
  };

  const handleGenerateLesson = async () => {
    const loadingToast = toast.loading("Generating Lesson...");
    try {
      const summary = generateCourseSummary(course);
      const response = await generateCourseLesson(
        summary,
        lessonData.lesson_name,
      );
      setContent(response.response.content);
      toast.success("Lesson Created Successfully", { id: loadingToast });
    } catch (error) {
      toast.error(`Failed to generate lesson`, {
        id: loadingToast,
      });
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
    //setIsQuizModalOpen(true);
    setQuestionData(null);
    // console.log("Question Data on Context:", questionData);
    setIsQuizModalOpen(true);
  };

  const onAddQuestionFormHandler = async (question_data) => {
    //console.log("Question Data: ", question_data);
    window.alert(JSON.stringify(question_data));

    const newQuestion = {
      question_text: question_data.question_text,
      explanation: "Under Development",
      options:
        question_data?.options?.map((opt, index) => ({
          id: index + 1,
          option_text: opt.option_text,
          is_correct: opt.is_correct || false,
        })) || [],
    };

    console.log("Quizzes Initial Value: ", quizzes);
    // Depending on the existence of the quiz,
    // We would use different API endpoint to store the question
    if (quizzes) {
      // Update Backend
      const addQuizApi = async (quiz_id, new_question) => {
        try {
          const response = await createQuizQuestion({
            quiz: quiz_id,
            ...new_question,
          });

          return response;
        } catch (error) {
          throw error;
        }
      };

      const response = await addQuizApi(quizzes.id, newQuestion);

      console.log("On Add QuizApi", response);

      // After getting question id we have to update questiondata on React State
      // So every subsequent action is working as intended

      const newQuestionwithId = {
        ...newQuestion,
        id: response.id,
      };

      console.log("newQuestionwithId: ", newQuestionwithId);

      const updatedQuiz = {
        ...quizzes,
        questions: [...quizzes.questions, newQuestionwithId],
      };

      // Update Frontend
      setQuizzes(updatedQuiz);
    } else {
      // If quizzes doesnt exist yet Create Quiz and get Quiz ID, pass that id to create new question.
      // Check postman for how to create new quiz given lesson id.
      // I think it have been implemented with the unique constraint.
      // Just have to integrate it in api.js
      // Required Note: Make sure to have atleast on question for this to work as intended

      const quiz_data = {
        lesson: activeLessonId,
        quiz_title: lessonData.lesson_name,
        quiz_description: `Quiz for ${lessonData.lesson_name}`,
        questions: [newQuestion],
      };

      console.log("Quiz_Data: ", quiz_data);

      // Update Backend
      const createQuizApi = async () => {
        try {
          const response = await createQuiz(quiz_data);

          return response;
        } catch (error) {
          console.log("Error when PostQuizApi: ", error);
          throw error;
        }
      };

      // Update Backend FIRST
      const response = await createQuizApi(quiz_data);

      // Update Frontend with actual backend response
      setQuizzes(response);

      console.log("Quiz created successfully: ", response);
    }
  };

  const onDeleteQuestionHandler = async (questionId) => {
    setQuizzes({
      ...quizzes,
      questions: quizzes.questions.filter((q) => q.id !== questionId),
    });

    const response = await deleteQuizQuestion(questionId);

    toast.success("Question deleted: ", response);
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
            isLoadQuiz={isLoadQuiz}
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

export default CourseEditor;
