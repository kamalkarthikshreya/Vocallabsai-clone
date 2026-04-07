/**
 * grokService.js
 * Simulated service for xAI Grok balance as requested.
 */

export async function fetchGrokBalance() {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    // Mocking the balance data as requested
    return {
      total: 100,
      used: 40,
      remaining: 60,
      model: "grok-1",
      status: "healthy"
    };
  } catch (error) {
    console.error("Grok Service Error:", error);
    throw new Error("Failed to fetch Grok balance");
  }
}
