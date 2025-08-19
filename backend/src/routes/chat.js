import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are an AI chatbot designed exclusively for the "Illegal Construction & Encroachment Reporting System" of Indore.  

Your role is to assist citizens and officials by:  
- Answering queries about illegal construction, encroachment cases, and citizen reports.  
- Explaining how to file or check the status of complaints.  
- Providing information about land parcels, boundary data, and reports stored in the system.  
- Helping users understand how satellite/drone/citizen reports are integrated.  
- Assisting with dashboards, alerts, and report visualization.  

Strict Rules:  
- If a user asks anything outside the scope of **illegal construction, encroachment, reporting system, Indore GIS data, land parcel info, or complaint handling**, politely refuse and say:  
  **"I'm the Indore Illegal Construction Chatbot. I can only answer questions related to illegal construction and encroachment reporting in Indore."**  

- Never answer unrelated general knowledge or personal questions.  

Your answers must always stay relevant to **illegal construction detection, complaint management, parcel data, and Indore city GIS workflows.**

Keep your responses concise, helpful, and professional.`;

// POST /api/chat - Handle chat messages
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required and must be a string",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "AI service is not configured. Please contact support.",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Combine system prompt with user message
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${message}\n\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      message: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    // Handle specific Gemini API errors
    if (error.message?.includes("API_KEY")) {
      return res.status(500).json({
        error: "AI service configuration error. Please contact support.",
      });
    }

    if (
      error.message?.includes("models/") &&
      error.message?.includes("not found")
    ) {
      return res.status(500).json({
        error: "AI model configuration error. Please contact support.",
      });
    }

    if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      return res.status(429).json({
        error:
          "AI service is temporarily unavailable due to high usage. Please try again later.",
      });
    }

    res.status(500).json({
      error: "AI is unavailable, please try later.",
    });
  }
});

export default router;
