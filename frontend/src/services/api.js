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
        JSON.stringify(errorData) || `HTTP error! status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini API error: ", error);
    throw error;
  }
}

export async function createCourse() {
  try {
    const response = await fetch("http://localhost:8000/api/create_course/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        JSON.stringify(response.data) || `HTTP error! status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
