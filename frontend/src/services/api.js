import axios from "axios";

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

privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
        const { data } = await publicApi.post("/token/refresh/", { refresh });
        localStorage.setItem("accessToken", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
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

// Authentication (new)
export async function loginToGetAuthToken(username_, password_) {
  const response = await publicApi.post("/token/", {
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
 * @returns {Promise<Array>} List of courses
 */
export async function getCourse() {
  const response = await publicApi.get("/courses/");
  return response.data;
}

/**
 * Get a specific course by ID
 * @param {number|string} courseId - Course ID or Course Slug
 * @returns {Promise<Object>} Course data
 */
export async function getCourseById(courseId) {
  const response = await publicApi.get(`/courses/${courseId}/`);
  return response.data;
}

/**
 * Create a new course
 * @param {Object} courseData - Course data (course_name, course_description, course_learning_objectives, course_tags)
 * @returns {Promise<Object>} Created course
 */
export async function createCourse(courseData) {
  try {
    const response = await privateApi.post("/courses/", courseData);
    return response.data;
  } catch (error) {
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
 * @returns {Promise<Object>} Updated course
 */
export async function changeCourseStatus(courseId, newStatus) {
  try {
    const response = await privateApi.patch(`/courses/${courseId}/`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Update a course
 * @param {number|string} courseId - Course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise<Object>} Updated course
 */
export async function updateCourse(courseId, courseData) {
  try {
    const response = await privateApi.patch(
      `/courses/${courseId}/`,
      courseData,
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Delete a course
 * @param {number|string} courseId - Course ID
 * @returns {Promise<void>}
 */
export async function deleteCourse(courseId) {
  const response = await privateApi.delete(`/courses/${courseId}/`);
  return response.data;
}

/**
 * Generate course structure using AI (simple prompt)
 * @param {string} prompt - Course generation prompt
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateCourse(prompt) {
  try {
    const response = await privateApi.post("/courses/generate/", { prompt });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Generate course structure with detailed parameters
 * @param {Object} params - Course generation parameters
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateCourseStructured(params) {
  try {
    const response = await privateApi.post(
      "/courses/generate-structured/",
      params,
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Generate dummy course for testing
 * @returns {Promise<Object>} Dummy course structure
 */
export async function generateDummyCourse() {
  const response = await privateApi.post("/courses/generate-dummy/", {});
  return response.data;
}

// ============================================================================
// Lesson API Functions
// ============================================================================

/**
 * Get all lessons
 * @returns {Promise<Array>} List of lessons
 */
export async function getLessons() {
  const response = await publicApi.get("/lessons/");
  return response.data;
}

/**
 * Get a specific lesson by ID
 * @param {number|string} lessonId - Lesson ID
 * @returns {Promise<Object>} Lesson data
 */
export async function getLessonById(lessonId) {
  const response = await publicApi.get(`/lessons/${lessonId}/`);
  return response.data;
}

/**
 * Create a new lesson
 * @param {Object} lessonData - Lesson data
 * @returns {Promise<Object>} Created lesson
 */
export async function createLesson(lessonData) {
  try {
    const response = await privateApi.post("/lessons/", lessonData);
    return response.data;
  } catch (error) {
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
 * Edit lesson content (partial update)
 * @param {number|string} lessonId - Lesson ID
 * @param {string} lessonContent - New lesson content
 * @returns {Promise<Object>} Updated lesson
 */
export async function editLesson(lessonId, lessonContent) {
  try {
    const response = await privateApi.patch(`/lessons/${lessonId}/`, {
      lesson_content: lessonContent,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}

/**
 * Delete a lesson
 * @param {number|string} lessonId - Lesson ID
 * @returns {Promise<void>}
 */
export async function deleteLesson(lessonId) {
  const response = await privateApi.delete(`/lessons/${lessonId}/`);
  return response.data;
}

/**
 * Generate lesson content using AI
 * @param {string} courseStructure - Overview of course syllabus
 * @param {string} lessonTopic - Specific lesson topic to generate
 * @returns {Promise<Object>} Generated lesson content
 */
export async function generateCourseLesson(courseStructure, lessonTopic) {
  try {
    const response = await privateApi.post("/lessons/generate/", {
      course_structure: courseStructure,
      lesson_topic: lessonTopic,
    });
    return response.data;
  } catch (error) {
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

/**
 * Get all quizzes
 * @returns {Promise<Array>} List of quizzes
 */
export async function getQuizzes() {
  const response = await publicApi.get("/quizzes/");
  return response.data;
}

/**
 * Get quiz by ID
 * @param {number|string} quizId - Quiz ID
 * @returns {Promise<Object>} Quiz data
 */
export async function getQuizById(quizId) {
  const response = await publicApi.get(`/quizzes/${quizId}/`);
  return response.data;
}

/**
 * Get quizzes by lesson ID with optional detail level
 * @param {number|string} lessonId - Lesson ID
 * @param {string} detail - Detail level: 'simple', 'full', or 'questions' (default: 'simple')
 * @returns {Promise<Array>} List of quizzes for the lesson
 */
export async function getQuizByLessonId(lessonId, detail = "simple") {
  const response = await publicApi.get("/quizzes/", {
    params: { lesson: lessonId, detail },
  });
  return response.data;
}

/**
 * Get quiz detail by lesson ID (with full questions and options)
 * @param {number|string} lessonId - Lesson ID
 * @returns {Promise<Array>} Quiz with complete details
 */
export async function getQuizDetailbyLessonId(lessonId) {
  const response = await publicApi.get("/quizzes/", {
    params: { lesson: lessonId, detail: "full" },
  });
  return response.data;
}

/**
 * Create a new quiz with questions and options
 * @param {Object} quizData - Quiz data
 * @returns {Promise<Object>} Created quiz
 */
export async function createQuiz(quizData) {
  try {
    const response = await privateApi.post("/quizzes/", quizData);
    return response.data;
  } catch (error) {
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

/**
 * Update a quiz
 * @param {number|string} quizId - Quiz ID
 * @param {Object} quizData - Updated quiz data
 * @returns {Promise<Object>} Updated quiz
 */
export async function updateQuiz(quizId, quizData) {
  const response = await privateApi.patch(`/quizzes/${quizId}/`, quizData);
  return response.data;
}

/**
 * Delete a quiz
 * @param {number|string} quizId - Quiz ID
 * @returns {Promise<void>}
 */
export async function deleteQuiz(quizId) {
  const response = await privateApi.delete(`/quizzes/${quizId}/`);
  return response.data;
}

/**
 * Generate quiz using AI
 * @param {Object} params - Quiz generation parameters
 * @returns {Promise<Object>} Generated quiz structure
 */
export async function generateQuiz(params) {
  try {
    const response = await privateApi.post("/quizzes/generate/", {
      lesson_summary: params.lesson_summary || "",
      prompt: params.prompt || "",
      num_questions: params.num_questions || 3,
      num_options: params.num_options || 4,
    });
    return response.data;
  } catch (error) {
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

/**
 * Get all quiz questions
 * @returns {Promise<Array>} List of quiz questions
 */
export async function getQuizQuestions() {
  const response = await publicApi.get("/quiz-questions/");
  return response.data;
}

/**
 * Get questions by quiz ID
 * @param {number|string} quizId - Quiz ID
 * @returns {Promise<Array>} List of questions for the quiz
 */
export async function getQuestionsByQuizId(quizId) {
  const response = await publicApi.get("/quiz-questions/", {
    params: { quiz: quizId },
  });
  return response.data;
}

/**
 * Create/Replace a complete Multiple Quiz with Question, Options, Explanations
 * @param {object} Quizzes - Quizzes Data with lesson_id (lesson)
 * @returns {Promise<Object>} Created Quiz
 */
export async function createQuizzes(quizzes) {
  const response = await privateApi.post("/quizzes/", quizzes);
  return response.data;
}

/**
 * Create a new quiz question
 * @param {Object} questionData - Question data
 * @returns {Promise<Object>} Created question
 */
export async function createQuizQuestion(questionData) {
  const response = await privateApi.post("/quiz-questions/", questionData);
  return response.data;
}

/**
 * Update a quiz question
 * @param {number|string} questionId - Question ID
 * @param {Object} questionData - Updated question data
 * @returns {Promise<Object>} Updated question
 */
export async function updateQuizQuestion(questionId, questionData) {
  const response = await privateApi.patch(
    `/quiz-questions/${questionId}/`,
    questionData,
  );
  return response.data;
}

/**
 * Delete a quiz question
 * @param {number|string} questionId - Question ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteQuizQuestion(questionId) {
  const response = await privateApi.delete(`/quiz-questions/${questionId}/`);
  return response.data;
}

// ============================================================================
// Question Option API Functions
// ============================================================================

/**
 * Get all question options
 * @returns {Promise<Array>} List of question options
 */
export async function getQuestionOptions() {
  const response = await publicApi.get("/question-options/");
  return response.data;
}

/**
 * Get options by question ID
 * @param {number|string} questionId - Question ID
 * @returns {Promise<Array>} List of options for the question
 */
export async function getOptionsByQuestionId(questionId) {
  const response = await publicApi.get("/question-options/", {
    params: { question: questionId },
  });
  return response.data;
}

/**
 * Create a new question option
 * @param {Object} optionData - Option data
 * @returns {Promise<Object>} Created option
 */
export async function createQuestionOption(optionData) {
  const response = await privateApi.post("/question-options/", optionData);
  return response.data;
}

/**
 * Update a question option
 * @param {number|string} optionId - Option ID
 * @param {Object} optionData - Updated option data
 * @returns {Promise<Object>} Updated option
 */
export async function updateQuestionOption(optionId, optionData) {
  const response = await privateApi.patch(
    `/question-options/${optionId}/`,
    optionData,
  );
  return response.data;
}

/**
 * Delete a question option
 * @param {number|string} optionId - Option ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteQuestionOption(optionId) {
  const response = await privateApi.delete(`/question-options/${optionId}/`);
  return response.data;
}

// ============================================================================
// Reference API Functions
// ============================================================================

/**
 * Get all references
 * @returns {Promise<Array>} List of references
 */
export async function getReferences() {
  const response = await publicApi.get("/references/");
  return response.data;
}

/**
 * Get references by lesson ID
 * @param {number|string} lessonId - Lesson ID
 * @returns {Promise<Array>} List of references for the lesson
 */
export async function getReferencesByLessonId(lessonId) {
  const response = await publicApi.get("/references/", {
    params: { lesson: lessonId },
  });
  return response.data;
}

/**
 * Create a new reference
 * @param {Object} referenceData - Reference data
 * @returns {Promise<Object>} Created reference
 */
export async function createReference(referenceData) {
  const response = await privateApi.post("/references/", referenceData);
  return response.data;
}

/**
 * Update a reference
 * @param {number|string} referenceId - Reference ID
 * @param {Object} referenceData - Updated reference data
 * @returns {Promise<Object>} Updated reference
 */
export async function updateReference(referenceId, referenceData) {
  const response = await privateApi.patch(
    `/references/${referenceId}/`,
    referenceData,
  );
  return response.data;
}

/**
 * Delete a reference
 * @param {number|string} referenceId - Reference ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteReference(referenceId) {
  const response = await privateApi.delete(`/references/${referenceId}/`);
  return response.data;
}

/**
 * Generate references using AI
 * @param {Object} params - Reference generation parameters
 * @returns {Promise<Object>} Generated references
 */
export async function generateReferences(params) {
  try {
    const response = await privateApi.post("/references/generate/", params);
    return response.data;
  } catch (error) {
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

/**
 * Query Gemini API
 * @param {string} query - Query message
 * @returns {Promise<Object>} Gemini API response
 */
export async function geminiApiRequest(query) {
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

/**
 * Query Perplexica API for web search
 * @param {string} query - Search query
 * @returns {Promise<Object>} Perplexica search results
 */
export async function queryPerplexica(query) {
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

/**
 * Get dummy quiz data for testing
 * @returns {Array} Dummy quiz data
 */
export function dummyQuizApi() {
  const quizzes = [
    {
      id: 1,
      lesson_id: 0,
      quiz_title: "Lesson Knowledge Check",
      quiz_description: "Test your understanding of the key concepts",
      created_at: "2026-02-02T14:51:00Z",
      questions: [
        {
          id: 1,
          quiz_id: 1,
          question_text:
            "What is the main purpose of the concept discussed in this lesson?",
          explanation:
            "Review the introduction section to understand the primary purpose and motivation behind this concept.",
          order: 1,
          created_at: "2026-02-02T14:51:00Z",
          options: [
            {
              id: 1,
              question_id: 1,
              option_text: "To solve a specific technical problem efficiently",
              is_correct: true,
              order: 1,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 2,
              question_id: 1,
              option_text: "To make code more complex",
              is_correct: false,
              order: 2,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 3,
              question_id: 1,
              option_text: "To replace all existing solutions",
              is_correct: false,
              order: 3,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 4,
              question_id: 1,
              option_text: "To increase memory usage",
              is_correct: false,
              order: 4,
              created_at: "2026-02-02T14:51:00Z",
            },
          ],
        },
        {
          id: 2,
          quiz_id: 1,
          question_text:
            "Which scenario is best suited for applying this technique?",
          explanation:
            "The lesson covers specific use cases where this approach provides the most benefit.",
          order: 2,
          created_at: "2026-02-02T14:51:00Z",
          options: [
            {
              id: 5,
              question_id: 2,
              option_text:
                "When performance and scalability are critical requirements",
              is_correct: true,
              order: 1,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 6,
              question_id: 2,
              option_text: "Only in legacy systems",
              is_correct: false,
              order: 2,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 7,
              question_id: 2,
              option_text: "When you want to avoid best practices",
              is_correct: false,
              order: 3,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 8,
              question_id: 2,
              option_text: "Never in production environments",
              is_correct: false,
              order: 4,
              created_at: "2026-02-02T14:51:00Z",
            },
          ],
        },
        {
          id: 3,
          quiz_id: 1,
          question_text:
            "What is a key consideration when implementing this approach?",
          explanation:
            "Understanding trade-offs and limitations is essential for proper implementation.",
          order: 3,
          created_at: "2026-02-02T14:51:00Z",
          options: [
            {
              id: 9,
              question_id: 3,
              option_text:
                "Understanding the trade-offs and potential limitations",
              is_correct: true,
              order: 1,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 10,
              question_id: 3,
              option_text: "Ignoring documentation and best practices",
              is_correct: false,
              order: 2,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 11,
              question_id: 3,
              option_text: "Using the most complex solution available",
              is_correct: false,
              order: 3,
              created_at: "2026-02-02T14:51:00Z",
            },
            {
              id: 12,
              question_id: 3,
              option_text: "Avoiding testing entirely",
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
/**
 * Submit feedback for a lesson
 * @param {Object} feedbackData - Feedback data (lesson, rating, comment)
 * @returns {Promise<Object>} Created feedback
 */
export async function submitLessonFeedback(feedbackData) {
  try {
    const response = await publicApi.post("/lesson-feedbacks/", feedbackData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
}
