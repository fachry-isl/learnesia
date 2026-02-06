export async function getCourse() {
  try {
    const response = await fetch("http://localhost:8000/api/courses/", {
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

export async function getQuizDetailbyLessonId(lesson_id) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/quiz/?lesson=${lesson_id}&detail=full`,
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

export async function editLesson(lessonId, lesson_content) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/lessons/${lessonId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lesson_content }),
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

export async function generateCourse(prompt) {
  try {
    const response = await fetch("http://localhost:8000/api/generate_course/", {
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

export async function generatCourseLesson(course_structure_, lesson_topic_) {
  try {
    frontend / dist;
    const response = await fetch(
      "http://localhost:8000/api/generate_course_lesson/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_structure: course_structure_,
          lesson_topic: lesson_topic_,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Error onGenerateCourseLesson API: ${JSON.stringify(response.data)}` ||
          `HTTP error! status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function changeCourseStatus(course_id, newStatus) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/courses/${course_id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
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

export async function createCourse(courseData) {
  try {
    const response = await fetch("http://localhost:8000/api/courses/", {
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

export async function createLesson(lessonData) {
  try {
    const response = await fetch("http://localhost:8000/api/lessons/", {
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

export async function geminiApiRequest(query) {
  try {
    const response = await fetch("http://localhost:8000/api/gemini/", {
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
