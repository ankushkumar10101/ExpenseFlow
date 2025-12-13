const express = require('express');
const router = express.Router();
const User = require("../models/user");
const UserStats = require("../models/userStats");
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        console.log("Received chat request:", message); // Debug log


        // Check for authentication
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }


        // Check message limit using UserStats
        let userStats = await UserStats.findOne({ user: req.user._id });
        
        if (!userStats) {
            // Create stats if not exists
            userStats = await UserStats.create({ user: req.user._id });
        }

        if (userStats.aiMessageCount >= 10) {
             return res.status(403).json({ error: "You have reached your free message limit of 10 messages." });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: "Server API Key is not configured" });
        }

        // Construct a chat-like prompt
        const systemPrompt = `
            You are a helpful and friendly financial assistant chatbot. 
            You have access to the user's transaction history provided below.
            
            Current Date: ${new Date().toLocaleDateString()}
            
            User's Transaction History:
            ${JSON.stringify(history)}

            Instructions:
            1. Answer the user's question based strictly on the provided transaction history.
            2. If the user asks for a budget, propose one based on their spending habits.
            3. Be concise, encouraging, and easy to understand.
            4. If the data doesn't contain the answer (e.g., "What did I buy in 2010?" but data is only 2024), say you don't have that information.
            5. Do not output JSON unless asked. Output natural language.
            6. CRITICAL: Do NOT makeup or invent any data. If there are no transactions for the requested period (e.g. today), explicitly state that you see no transactions for that date.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        });

        const text = completion.choices[0].message.content;
        console.log("AI Response generated successfully"); // Debug log

        res.json({ reply: text });

        // Increment message count in UserStats
        userStats.aiMessageCount += 1;
        await userStats.save();

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ error: "Failed to generate chat response. " + error.message });
    }
});

module.exports = router;
