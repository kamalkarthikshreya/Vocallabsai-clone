/**
 * groqService.js
 * Handles all Groq REST API calls:
 *  - fetchGroqModels()      → list available LLM models
 *  - fetchGroqAccountInfo() → validate key + return model count
 */

const GROQ_BASE = "https://api.groq.com/openai/v1";

/**
 * Fetch list of available Groq models.
 * @param {string} apiKey
 * @returns {Promise<{object: string, data: Array}>}
 */
export async function fetchGroqModels(apiKey) {
  const res = await fetch(`${GROQ_BASE}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Convenience: validate Groq key and return account summary.
 * Returns { modelCount, models, status } or throws.
 * @param {string} apiKey
 */
export async function fetchGroqAccountInfo(apiKey) {
  const data = await fetchGroqModels(apiKey);
  const models = data?.data ?? [];

  // Filter to active/owned models only
  const activeModels = models.filter((m) => m.active !== false);

  return {
    status: "Active",
    modelCount: activeModels.length,
    models: activeModels.map((m) => m.id),
    // Groq does not expose a balance/credit API publicly
    // so we show "Unlimited" for free-tier usage display
    balance: "Pay-as-you-go",
    units: "",
  };
}
