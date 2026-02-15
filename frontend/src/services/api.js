// ============================================================================
// Base Configuration
// ============================================================================

const API_BASE_URL = "http://localhost:8000/api";

// ============================================================================
// Course API Functions
// ============================================================================

/**
 * Get all courses
 * @returns {Promise<Array>} List of courses
 */
export async function getCourse() {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific course by ID
 * @param {number} courseId - Course ID or Course Slug
 * @returns {Promise<Object>} Course data
 */
export async function getCourseById(courseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new course
 * @param {Object} courseData - Course data
 * @returns {Promise<Object>} Created course
 */
export async function createCourse(courseData) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      throw new Error(
        JSON.stringify(response.data) ||
          `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Update course status
 * @param {number} courseId - Course ID
 * @param {string} newStatus - New status value
 * @returns {Promise<Object>} Updated course
 */
export async function changeCourseStatus(courseId, newStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error(
        JSON.stringify(response.data) ||
          `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a course
 * @param {number} courseId - Course ID
 * @returns {Promise<void>}
 */
export async function deleteCourse(courseId) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Generate course structure using AI (simple prompt)
 * @param {string} prompt - Course generation prompt
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateCourse(prompt) {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/generate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(
        JSON.stringify(response.data) ||
          `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Generate course structure with detailed parameters
 * @param {Object} params - Course generation parameters
 * @param {string} params.topic - Main topic (required)
 * @param {string} params.num_modules - Number of modules (optional)
 * @param {string} params.target_audience - Target audience (optional)
 * @param {string} params.difficulty_level - Difficulty level (optional)
 * @param {string} params.learning_objectives - Learning objectives (optional)
 * @param {string} params.course_duration - Course duration (optional)
 * @param {string} params.prerequisites - Prerequisites (optional)
 * @param {string} params.language - Output language (optional)
 * @returns {Promise<Object>} Generated course structure
 */
export async function generateCourseStructured(params) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/courses/generate-structured/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      },
    );

    if (!response.ok) {
      throw new Error(
        JSON.stringify(response.data) ||
          `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Generate dummy course for testing
 * @returns {Promise<Object>} Dummy course structure
 */
export async function generateDummyCourse() {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/generate-dummy/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// Lesson API Functions
// ============================================================================

/**
 * Get all lessons
 * @returns {Promise<Array>} List of lessons
 */
export async function getLessons() {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific lesson by ID
 * @param {number} lessonId - Lesson ID
 * @returns {Promise<Object>} Lesson data
 */
export async function getLessonById(lessonId) {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new lesson
 * @param {Object} lessonData - Lesson data
 * @returns {Promise<Object>} Created lesson
 */
export async function createLesson(lessonData) {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message ||
          errorData.detail ||
          `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    // Check if it's a network error (backend not responding)
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw new Error(
        "Cannot connect to server. Please check your internet connection or try again later.",
      );
    }
    throw error;
  }
}

/**
 * Edit lesson content (partial update)
 * @param {number} lessonId - Lesson ID
 * @param {string} lessonContent - New lesson content
 * @returns {Promise<Object>} Updated lesson
 */
export async function editLesson(lessonId, lessonContent) {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lesson_content: lessonContent }),
    });

    if (!response.ok) {
      throw new Error(
        JSON.stringify(response.data) ||
          `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a lesson
 * @param {number} lessonId - Lesson ID
 * @returns {Promise<void>}
 */
export async function deleteLesson(lessonId) {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Generate lesson content using AI
 * @param {string} courseStructure - Overview of course syllabus
 * @param {string} lessonTopic - Specific lesson topic to generate
 * @returns {Promise<Object>} Generated lesson content
 */
export async function generateCourseLesson(courseStructure, lessonTopic) {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/generate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course_structure: courseStructure,
        lesson_topic: lessonTopic,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Error on GenerateCourseLesson API: ${JSON.stringify(response.data)}` ||
          `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
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
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get quiz by ID
 * @param {number} quizId - Quiz ID
 * @returns {Promise<Object>} Quiz data
 */
export async function getQuizById(quizId) {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get quizzes by lesson ID with optional detail level
 * @param {number} lessonId - Lesson ID
 * @param {string} detail - Detail level: 'simple', 'full', or 'questions' (default: 'simple')
 * @returns {Promise<Array>} List of quizzes for the lesson
 */
export async function getQuizByLessonId(lessonId, detail = "simple") {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/?lesson=${lessonId}&detail=${detail}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get quiz detail by lesson ID (with full questions and options)
 * @param {number} lessonId - Lesson ID
 * @returns {Promise<Array>} Quiz with complete details
 */
export async function getQuizDetailbyLessonId(lessonId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/?lesson=${lessonId}&detail=full`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new quiz with questions and options
 * @param {Object} quizData - Quiz data including lesson, title, description, and questions
 * @returns {Promise<Object>} Created quiz
 */
export async function createQuiz(quizData) {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.detail ||
          `HTTP error! status: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Update a quiz
 * @param {number} quizId - Quiz ID
 * @param {Object} quizData - Updated quiz data
 * @returns {Promise<Object>} Updated quiz
 */
export async function updateQuiz(quizId, quizData) {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a quiz
 * @param {number} quizId - Quiz ID
 * @returns {Promise<void>}
 */
export async function deleteQuiz(quizId) {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Generate quiz using AI
 * @param {Object} params - Quiz generation parameters
 * @param {string} params.lesson_summary - Lesson summary for context
 * @param {string} params.prompt - Quiz generation prompt
 * @param {number} params.num_questions - Number of questions (default: 3)
 * @param {number} params.num_options - Number of options per question (default: 4)
 * @returns {Promise<Object>} Generated quiz structure
 */
export async function generateQuiz(params) {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/generate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lesson_summary: params.lesson_summary || "",
        prompt: params.prompt,
        num_questions: params.num_questions || 3,
        num_options: params.num_options || 4,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
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
  try {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get questions by quiz ID
 * @param {number} quizId - Quiz ID
 * @returns {Promise<Array>} List of questions for the quiz
 */
export async function getQuestionsByQuizId(quizId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quiz-questions/?quiz=${quizId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new quiz question
 * @param {Object} questionData - Question data
 * @returns {Promise<Object>} Created question
 */
export async function createQuizQuestion(questionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/quiz-questions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Update a quiz question
 * @param {number} questionId - Question ID
 * @param {Object} questionData - Updated question data
 * @returns {Promise<Object>} Updated question
 */
export async function updateQuizQuestion(questionId, questionData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quiz-questions/${questionId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a quiz question
 * @param {number} questionId - Question ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteQuizQuestion(questionId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quiz-questions/${questionId}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// Question Option API Functions
// ============================================================================

/**
 * Get all question options
 * @returns {Promise<Array>} List of question options
 */
export async function getQuestionOptions() {
  try {
    const response = await fetch(`${API_BASE_URL}/question-options/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new question option
 * @param {Object} optionData - Option data
 * @returns {Promise<Object>} Created option
 */
export async function createQuestionOption(optionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/question-options/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(optionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Update a question option
 * @param {number} optionId - Option ID
 * @param {Object} optionData - Updated option data
 * @returns {Promise<Object>} Updated option
 */
export async function updateQuestionOption(optionId, optionData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/question-options/${optionId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(optionData),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a question option
 * @param {number} optionId - Option ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteQuestionOption(optionId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/question-options/${optionId}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
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
    const response = await fetch(`${API_BASE_URL}/gemini/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: query,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        JSON.stringify(errorData) || `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini API error: ", error);
    throw error;
  }
}

const PERPLEXICA_API_URL = "http://100.122.67.1:3000";

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
    const response = await fetch(`${PERPLEXICA_API_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...perplexicaConfig,
        query,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Perplexica API error:", error);
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
