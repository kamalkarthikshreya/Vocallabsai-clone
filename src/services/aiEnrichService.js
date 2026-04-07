/**
 * Capitalizes the first letter of a string and trims whitespace.
 */
const formatOutput = (text) => {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

/**
 * Improved Fallback Function for general questions.
 */
const generateFallbackAnswer = (text) => {
  const cleanText = text.replace(/[?,.]/g, "").trim();
  return `Explanation:\n\n${cleanText} can be understood by exploring its meaning, key concepts, and real-world applications. It plays an important role in its domain and helps in solving practical problems.`;
};

/**
 * Refined Hybrid AI Enrichment Service
 * Provides cleaner queries, reliable Wikipedia integration, and natural fallbacks.
 */
export const enrichText = async (text) => {
  try {
    // Handle empty or whitespace-only input
    if (!text || !text.trim()) {
      return "Please provide a valid query.";
    }

    // STEP 1: Fix Query Cleaning (CRITICAL)
    const query = text
      .toLowerCase()
      .replace(/what is|who is|define|explain|tell me about|what are/gi, "")
      .replace(/[?,.]/g, "")
      .trim();

    // If query is empty after cleaning, use the original text for the fallback
    if (!query) {
      return formatOutput(generateFallbackAnswer(text));
    }

    // STEP 2: Improve Wikipedia Fetch Logic
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );

    if (res.ok) {
      const data = await res.json();
      // If Wikipedia gives valid result -> return the extract
      if (data.extract) {
        return formatOutput(data.extract);
      }
    }

    // STEP 3: Improve Fallback Response
    return formatOutput(generateFallbackAnswer(text));

  } catch (error) {
    console.error("Refined Enrichment Error:", error);
    // If API fails -> fallback safely with formatted output
    return formatOutput(generateFallbackAnswer(text));
  }
};
