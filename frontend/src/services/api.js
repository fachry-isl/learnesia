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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Perplexica API error:", error);
    throw error;
  }
}
