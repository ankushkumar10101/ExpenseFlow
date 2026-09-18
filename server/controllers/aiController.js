const UserStats = require("../models/UserStats");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Handle AI financial assistant chat requests
 */
async function chatWithAi(req, res) {
  try {
    const { message, history } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res
        .status(500)
        .json({ error: "Server API Key is not configured" });
    }

    // Check message limit using UserStats
    let userStats = await UserStats.findOne({ user: req.user._id });
    if (!userStats) {
      userStats = await UserStats.create({ user: req.user._id });
    }

    if (userStats.aiMessageCount >= 10) {
      return res.status(403).json({
        error: "You have reached your free message limit of 10 messages.",
      });
    }

    // Construct financial context prompt
    const systemPrompt = `
      You are a helpful and friendly financial assistant chatbot. 
      You have access to the user's transaction history provided below.
      
      Current Date: ${new Date().toLocaleDateString()}
      
      User's Transaction History:
      ${JSON.stringify(history || [])}

      Instructions:
      1. Answer the user's question based strictly on the provided transaction history.
      2. If the user asks for a budget, propose one based on their spending habits.
      3. Be concise, encouraging, and easy to understand.
      4. If the data doesn't contain the answer (e.g., "What did I buy in 2010?" but data is only 2024), say you don't have that information.
      5. Do not output JSON unless asked. Output natural language.
      6. CRITICAL: Do NOT make up or invent any data. If there are no transactions for the requested period, state that clearly.
    `;

    let text = "";
    const primaryModel = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    try {
      const completion = await groq.chat.completions.create({
        model: primaryModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        reasoning_effort: "medium",
        stream: true,
        stop: null,
      });

      for await (const chunk of completion) {
        text += chunk.choices[0]?.delta?.content || "";
      }
    } catch (modelErr) {
      console.warn(`Model ${primaryModel} failed (${modelErr.message}), trying fallback to llama-3.1-8b-instant...`);
      // Fallback in case openai/gpt-oss-120b is not enabled on account
      const fallbackCompletion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        stream: true,
      });

      for await (const chunk of fallbackCompletion) {
        text += chunk.choices[0]?.delta?.content || "";
      }
    }

    // Increment message count in UserStats
    userStats.aiMessageCount += 1;
    await userStats.save();

    return res.status(200).json({ reply: text });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      error: "Failed to generate chat response: " + error.message,
    });
  }
}

module.exports = {
  chatWithAi,
};
