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
