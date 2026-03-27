import axios, { InternalAxiosRequestConfig } from "axios";
import {
  Course,
  Lesson,
  Quiz,
  QuizQuestion,
  QuestionOption,
  Reference,
  AuthResponse,
} from "../types";

// ============================================================================
// Base Configuration
// ============================================================================

const PUBLIC_API_BASE_URL =
  import.meta.env.VITE_API_PUBLIC_URL || "http://localhost:8000/api";
const PRIVATE_API_BASE_URL =
  import.meta.env.VITE_API_PRIVATE_URL || "http://localhost:8000/api";
const PERPLEXICA_API_URL = "http://100.122.67.1:3000";

const publicApi = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const privateApi = axios.create({
  baseURL: PRIVATE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

privateApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → auto refresh logic only on privateApi
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refreshToken");
        const { data } = await publicApi.post<AuthResponse>("/token/refresh/", {
          refresh,
        });
        localStorage.setItem("accessToken", data.access);
        if (original.headers) {
          original.headers.Authorization = `Bearer ${data.access}`;
        }
        return privateApi(original);
      } catch {
        localStorage.clear();
        const adminPath = import.meta.env.VITE_ADMIN_PATH || "/admin";
        window.location.href = `${adminPath}/login`;
      }
    }
    return Promise.reject(error);
  },
);

const perplexicaApi = axios.create({
  baseURL: PERPLEXICA_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Authentication
export async function loginToGetAuthToken(
  username_: string,
  password_: string,
): Promise<AuthResponse> {
  const response = await publicApi.post<AuthResponse>("/token/", {
    username: username_,
    password: password_,
  });

  return response.data;
}

// ============================================================================
// Course API Functions
// ============================================================================

/**
 * Get all courses
 * @returns {Promise<Course[]>} List of courses
 */
export async function getCourse(): Promise<Course[]> {
  const response = await publicApi.get<Course[]>("/courses/");
  return response.data;
}

/**
 * Get a specific course by ID
 * @param {number|string} courseId - Course ID or Course Slug
 * @returns {Promise<Course>} Course data
 */
export async function getCourseById(
  courseId: number | string,
): Promise<Course> {
  const response = await publicApi.get<Course>(`/courses/${courseId}/`);
  return response.data;
}

/**
 * Create a new course
 * @param {Partial<Course>} courseData - Course data
 * @returns {Promise<Course>} Created course
 */
export async function createCourse(
  courseData: Partial<Course>,
): Promise<Course> {
  try {
    const response = await privateApi.post<Course>("/courses/", courseData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Update course status
 * @param {number|string} courseId - Course ID
 * @param {string} newStatus - New status value
 * @returns {Promise<Course>} Updated course
 */
export async function changeCourseStatus(
  courseId: number | string,
  newStatus: string,
): Promise<Course> {
  try {
    const response = await privateApi.patch<Course>(`/courses/${courseId}/`, {
      status: newStatus,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Update a course
 * @param {number|string} courseId - Course ID
 * @param {Partial<Course>} courseData - Updated course data
 * @returns {Promise<Course>} Updated course
 */
export async function updateCourse(
  courseId: number | string,
  courseData: Partial<Course>,
): Promise<Course> {
  try {
    const response = await privateApi.patch<Course>(
      `/courses/${courseId}/`,
      courseData,
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Delete a course
 * @param {number|string} courseId - Course ID
 * @returns {Promise<any>}
 */
export async function deleteCourse(courseId: number | string): Promise<any> {
  const response = await privateApi.delete(`/courses/${courseId}/`);
  return response.data;
}

/**
 * Generate course structure using AI
 * @param {string} prompt - Course generation prompt
 * @returns {Promise<any>} Generated course structure
 */
export async function generateCourse(prompt: string): Promise<any> {
  try {
    const response = await privateApi.post("/courses/generate/", { prompt });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Generate course structure with detailed parameters
 * @param {Object} params - Course generation parameters
 * @returns {Promise<any>} Generated course structure
 */
export async function generateCourseStructured(params: any): Promise<any> {
  try {
    const response = await privateApi.post(
      "/courses/generate-structured/",
      params,
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Generate dummy course for testing
 * @returns {Promise<any>} Dummy course structure
 */
export async function generateDummyCourse(): Promise<any> {
  const response = await privateApi.post("/courses/generate-dummy/", {});
  return response.data;
}

// ============================================================================
// Lesson API Functions
// ============================================================================

/**
 * Get all lessons
 * @returns {Promise<Lesson[]>} List of lessons
 */
export async function getLessons(): Promise<Lesson[]> {
  const response = await publicApi.get<Lesson[]>("/lessons/");
  return response.data;
}

/**
 * Get a specific lesson by ID
 * @param {number|string} lessonId - Lesson ID
 * @returns {Promise<Lesson>} Lesson data
 */
export async function getLessonById(
  lessonId: number | string,
): Promise<Lesson> {
  const response = await publicApi.get<Lesson>(`/lessons/${lessonId}/`);
  return response.data;
}

/**
 * Create a new lesson
 * @param {Partial<Lesson>} lessonData - Lesson data
 * @returns {Promise<Lesson>} Created lesson
 */
export async function createLesson(
  lessonData: Partial<Lesson>,
): Promise<Lesson> {
  try {
    const response = await privateApi.post<Lesson>("/lessons/", lessonData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message ||
          errorData.detail ||
          `HTTP error! status ${error.response.status}`,
      );
    }
    if (error.request) {
      throw new Error(
        "Cannot connect to server. Please check your internet connection or try again later.",
      );
    }
    throw error;
  }
}

/**
 * Update a lesson
 * @param {number|string} lessonId - Lesson ID
 * @param {Partial<Lesson>} lessonData - Updated lesson data
 * @returns {Promise<Lesson>} Updated lesson
 */
export async function updateLesson(
  lessonId: number | string,
  lessonData: Partial<Lesson>,
): Promise<Lesson> {
  try {
    const response = await privateApi.patch<Lesson>(
      `/lessons/${lessonId}/`,
      lessonData,
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Edit lesson content (partial update)
 * @param {number|string} lessonId - Lesson ID
 * @param {string} lessonContent - New lesson content
 * @returns {Promise<Lesson>} Updated lesson
 */
export async function editLesson(
  lessonId: number | string,
  lessonContent: string,
): Promise<Lesson> {
  return updateLesson(lessonId, { lesson_content: lessonContent });
}

/**
 * Delete a lesson
 * @param {number|string} lessonId - Lesson ID
 * @returns {Promise<any>}
 */
export async function deleteLesson(lessonId: number | string): Promise<any> {
  const response = await privateApi.delete(`/lessons/${lessonId}/`);
  return response.data;
}

/**
 * Generate lesson content using AI
 */
export async function generateCourseLesson(
  courseStructure: string,
  lessonTopic: string,
): Promise<any> {
  try {
    const response = await privateApi.post("/lessons/generate/", {
      course_structure: courseStructure,
      lesson_topic: lessonTopic,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Error on GenerateCourseLesson API: ${JSON.stringify(error.response.data)}`,
      );
    }
    throw error;
  }
}

// ============================================================================
// Quiz API Functions
// ============================================================================

export async function getQuizzes(): Promise<Quiz[]> {
  const response = await publicApi.get<Quiz[]>("/quizzes/");
  return response.data;
}

export async function getQuizById(quizId: number | string): Promise<Quiz> {
  const response = await publicApi.get<Quiz>(`/quizzes/${quizId}/`);
  return response.data;
}

export async function getQuizByLessonId(
  lessonId: number | string,
  detail = "simple",
): Promise<Quiz[]> {
  const response = await publicApi.get<Quiz[]>("/quizzes/", {
    params: { lesson: lessonId, detail },
  });
  return response.data;
}

export async function getQuizDetailbyLessonId(
  lessonId: number | string,
): Promise<Quiz[]> {
  const response = await publicApi.get<Quiz[]>("/quizzes/", {
    params: { lesson: lessonId, detail: "full" },
  });
  return response.data;
}

export async function createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
  try {
    const response = await privateApi.post<Quiz>("/quizzes/", quizData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw new Error(
        errorData.message ||
          errorData.detail ||
          `HTTP error! status: ${error.response.status}`,
      );
    }
    throw error;
  }
}

export async function updateQuiz(
  quizId: number | string,
  quizData: Partial<Quiz>,
): Promise<Quiz> {
  const response = await privateApi.patch<Quiz>(
    `/quizzes/${quizId}/`,
    quizData,
  );
  return response.data;
}

export async function deleteQuiz(quizId: number | string): Promise<any> {
  const response = await privateApi.delete(`/quizzes/${quizId}/`);
  return response.data;
}

export async function generateQuiz(params: any): Promise<any> {
  try {
    const response = await privateApi.post("/quizzes/generate/", {
      lesson_summary: params.lesson_summary || "",
      prompt: params.prompt || "",
      num_questions: params.num_questions || 3,
      num_options: params.num_options || 4,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw new Error(
        errorData.error || `HTTP error! status: ${error.response.status}`,
      );
    }
    throw error;
  }
}

// ============================================================================
// Quiz Question API Functions
// ============================================================================

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const response = await publicApi.get<QuizQuestion[]>("/quiz-questions/");
  return response.data;
}

export async function getQuestionsByQuizId(
  quizId: number | string,
): Promise<QuizQuestion[]> {
  const response = await publicApi.get<QuizQuestion[]>("/quiz-questions/", {
    params: { quiz: quizId },
  });
  return response.data;
}

export async function createQuizzes(quizzes: any): Promise<any> {
  const response = await privateApi.post("/quizzes/", quizzes);
  return response.data;
}

export async function createQuizQuestion(
  questionData: Partial<QuizQuestion>,
): Promise<QuizQuestion> {
  const response = await privateApi.post<QuizQuestion>(
    "/quiz-questions/",
    questionData,
  );
  return response.data;
}

export async function updateQuizQuestion(
  questionId: number | string,
  questionData: Partial<QuizQuestion>,
): Promise<QuizQuestion> {
  const response = await privateApi.patch<QuizQuestion>(
    `/quiz-questions/${questionId}/`,
    questionData,
  );
  return response.data;
}

export async function deleteQuizQuestion(
  questionId: number | string,
): Promise<any> {
  const response = await privateApi.delete(`/quiz-questions/${questionId}/`);
  return response.data;
}

// ============================================================================
// Question Option API Functions
// ============================================================================

export async function getQuestionOptions(): Promise<QuestionOption[]> {
  const response = await publicApi.get<QuestionOption[]>("/question-options/");
  return response.data;
}

export async function getOptionsByQuestionId(
  questionId: number | string,
): Promise<QuestionOption[]> {
  const response = await publicApi.get<QuestionOption[]>("/question-options/", {
    params: { question: questionId },
  });
  return response.data;
}

export async function createQuestionOption(
  optionData: Partial<QuestionOption>,
): Promise<QuestionOption> {
  const response = await privateApi.post<QuestionOption>(
    "/question-options/",
    optionData,
  );
  return response.data;
}

export async function updateQuestionOption(
  optionId: number | string,
  optionData: Partial<QuestionOption>,
): Promise<QuestionOption> {
  const response = await privateApi.patch<QuestionOption>(
    `/question-options/${optionId}/`,
    optionData,
  );
  return response.data;
}

export async function deleteQuestionOption(
  optionId: number | string,
): Promise<any> {
  const response = await privateApi.delete(`/question-options/${optionId}/`);
  return response.data;
}

// ============================================================================
// Reference API Functions
// ============================================================================

export async function getReferences(): Promise<Reference[]> {
  const response = await publicApi.get<Reference[]>("/references/");
  return response.data;
}

export async function getReferencesByLessonId(
  lessonId: number | string,
): Promise<Reference[]> {
  const response = await publicApi.get<Reference[]>("/references/", {
    params: { lesson: lessonId },
  });
  return response.data;
}

export async function createReference(
  referenceData: Partial<Reference>,
): Promise<Reference> {
  const response = await privateApi.post<Reference>(
    "/references/",
    referenceData,
  );
  return response.data;
}

export async function updateReference(
  referenceId: number | string,
  referenceData: Partial<Reference>,
): Promise<Reference> {
  const response = await privateApi.patch<Reference>(
    `/references/${referenceId}/`,
    referenceData,
  );
  return response.data;
}

export async function deleteReference(
  referenceId: number | string,
): Promise<any> {
  const response = await privateApi.delete(`/references/${referenceId}/`);
  return response.data;
}

export async function generateReferences(params: any): Promise<any> {
  try {
    const response = await privateApi.post("/references/generate/", params);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        JSON.stringify(error.response.data) ||
          `HTTP error! status ${error.response.status}`,
      );
    }
    throw error;
  }
}

// ============================================================================
// External API Functions (Gemini, Perplexica)
// ============================================================================

export async function geminiApiRequest(query: string): Promise<any> {
  try {
    const response = await privateApi.post("/gemini/", {
      message: query,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

const perplexicaConfig = {
  chatModel: {
    providerId: "911b44dc-7dd9-451e-aeb3-2928514eb103",
    key: "models/gemini-2.0-flash-lite",
  },
  embeddingModel: {
    providerId: "4e928a3d-eca5-40aa-80d4-957ab0151b0b",
    key: "Xenova/all-MiniLM-L6-v2",
  },
  optimizationMode: "balanced",
  focusMode: "webSearch",
  sources: ["web"],
  stream: false,
};

export async function queryPerplexica(query: string): Promise<any> {
  try {
    const response = await perplexicaApi.post("/search", {
      ...perplexicaConfig,
      query,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function dummyQuizApi(): Quiz[] {
  const quizzes: Quiz[] = [
    {
      id: 1,
      lesson: 0,
      quiz_title: "Lesson Knowledge Check",
      quiz_description: "Test your understanding of the key concepts",
      created_at: "2026-02-02T14:51:00Z",
      questions: [
        {
          id: 1,
          quiz: 1,
          question_text:
            "What is the main purpose of the concept discussed in this lesson?",
          explanation:
            "Review the introduction section to understand the primary purpose and motivation behind this concept.",
          order: 1,
          created_at: "2026-02-02T14:51:00Z",
          options: [
            {
              id: 1,
              question: 1,
              option_text: "To solve a specific technical problem efficiently",
              is_correct: true,
              order: 1,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 2,
              question: 1,
              option_text: "To make code more complex",
              is_correct: false,
              order: 2,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 3,
              question: 1,
              option_text: "To replace all existing solutions",
              is_correct: false,
              order: 3,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 4,
              question: 1,
              option_text: "To increase memory usage",
              is_correct: false,
              order: 4,
              created_at: "2026-02-02T14:51:00Z",
            },
          ],
        },
      ],
    },
  ];
  return quizzes;
}
