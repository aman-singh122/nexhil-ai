// index.js

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { promisify } from "util";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Gemini API Setup
const ai = new GoogleGenAI({
  apiKey: "AIzaSyDclIvm2iuYgxOhMP64LPwP5VtjQUXX6bA", // 🔁 Replace with your actual Gemini API key
});

const writeFileAsync = promisify(fs.writeFile);

// 👇 Function tool declaration (if needed later)
const executeCommandDeclaration = {
  name: "executeCommand",
  description: "Execute commands or create files",
  parameters: {
    type: "OBJECT",
    properties: {
      command: { type: "STRING" },
      content: { type: "STRING" },
      filePath: { type: "STRING" },
    },
  },
};

// ⛳ Main API route
app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const History = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  try {
    while (true) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: History,
        config: {
          systemInstruction: `
You are a website code generator.

🔹Your only task:
Respond ONLY in this format:

{
  "html": "<!DOCTYPE html> ...",
  "css": "body { ... }",
  "js": "document.addEventListener(...)"
}

⚠️ DO NOT write explanation, markdown, triple backticks, or commentary.
⚠️ Your response MUST be valid JSON.
⚠️ Keys must be exactly "html", "css", "js".
          `,
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        // Function call handling (if any)
        const { name, args } = response.functionCalls[0];
        History.push({
          role: "model",
          parts: [{ functionCall: response.functionCalls[0] }],
        });
        History.push({
          role: "user",
          parts: [
            { functionResponse: { name, response: { result: "executed" } } },
          ],
        });
      } else {
        // Final response
        let json;

        try {
          console.log("AI raw response:", response.text);
          let aiText = response.text.trim();
          // Remove code block markers if present
          if (aiText.startsWith("```")) {
            aiText = aiText
              .replace(/^```(?:json)?/i, "")
              .replace(/```$/, "")
              .trim();
          }
          json = JSON.parse(aiText); // Parse cleaned JSON
        } catch (err) {
          return res
            .status(500)
            .json({
              error: "AI response is not valid JSON",
              raw: response.text,
            });
        }

        // Ensure all keys exist for frontend
        json.html = json.html || "";
        json.css = json.css || "";
        json.js = json.js || "";

        return res.json(json);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
