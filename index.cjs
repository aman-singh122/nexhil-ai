// index.cjs

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const { promisify } = require("util");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("[DEBUG] __dirname:", __dirname);
console.log("[DEBUG] .env expected at:", path.join(__dirname, ".env"));
console.log(
  "[DEBUG] GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "Loaded" : "NOT loaded"
);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files in production (for Vercel/Render or local build)
if (process.env.NODE_ENV === "production") {
  // Only serve static files if the 'public' folder exists
  const publicDir = path.join(__dirname, "public");
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get("*", (req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    });
  } else {
    console.warn(
      "[WARNING] 'public' folder not found. Static file serving is disabled."
    );
  }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ status: "error", message: "GEMINI_API_KEY missing in .env" });
  }
  res.json({ status: "ok", message: "Server running and API key loaded" });
});

// Gemini API Setup
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in .env. Server will not work.");
}
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "", // fallback to empty string
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
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY missing in .env" });
  }
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
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: History,
          config: {
            systemInstruction: `
You are an expert Website builder. Follow these steps:
                    
                    1. FIRST create the project folder: mkdir project-name
                    2. THEN create files with COMPLETE TEMPLATES:
                       - index.html (with basic HTML5 structure)
                       - style.css (with basic styles)
                       - script.js (with basic functionality)
                    
                    IMPORTANT:
                    - Use the 'content' parameter to send COMPLETE file content
                    - Always include the 'filePath' parameter when writing files
                    - For folders, use the 'command' parameter with mkdir
                    - Include proper DOCTYPE, meta tags, and semantic HTML
                    - Include responsive CSS (viewport meta, flexible units)
                    - Include DOMContentLoaded event in JavaScript
                    - Use clear, descriptive class names
                    - Use comments to explain complex parts
                    - Use modern HTML5, CSS3, and ES6+ JavaScript features
                     
                    EXAMPLE for a calculator:
                    1. {command: "mkdir calculator"}
                    2. {content: "<!DOCTYPE html>...", filePath: "calculator/index.html"}
                    3. {content: "body { font-family: Arial...}", filePath: "calculator/style.css"}
                    4. {content: "document.addEventListener...", filePath: "calculator/script.js"}

            `,
          },
        });
      } catch (apiErr) {
        return res
          .status(500)
          .json({ error: "Gemini API error", details: apiErr.message });
      }
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
          return res.status(500).json({
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
  if (process.env.GEMINI_API_KEY) {
    console.log(
      `🚀 Server running at http://localhost:${PORT} (API key loaded)`
    );
  } else {
    console.log(`🚀 Server running at http://localhost:${PORT} (No API key!)`);
  }
});
