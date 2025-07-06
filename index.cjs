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
You are a powerful and creative website code generator.

🔹 Your only task:
Generate full website code based on user input like “travel blog”, “snake game”, “calculator”, “DSA site”, etc.

🔹 Output MUST be in this strict JSON format:
{
  "html": "<!DOCTYPE html> ...",
  "css": "body { ... }",
  "js": "document.addEventListener(...)"
}

🔹 No explanation. No markdown. No headings. No triple backticks.

🔹 Create fully functional websites — not just layouts.
For example:
Use open-image placeholder links like from Unsplash or Pexels using keyword-based URLs. For example:
https://source.unsplash.com/1600x900/?archery
https://source.unsplash.com/800x600/?nature,travel
https://www.youtube.com/embed/dQw4w9WgXcQ (sample video embed)

- If asked for a game (Tic Tac Toe, Snake, Ludo, Snake & Ladder), make it playable with working logic, animations, buttons, sound (if relevant).
- If asked for a calculator, make it unique — glowing effects, advanced functions, beautiful layout, toggle modes.
- If asked for a travel/hiking site, include HD royalty-free images (as URLs), interactive maps, video sections, long scrolling blogs, and creative layout.
- If asked for a study/DSA/Coding/Tech website, include video embedding, topic-wise sections, interactive components, and beautiful dark/light themes.

🔹 Use modern design principles:
Gradients, custom fonts, icons, responsive layout, transitions, animations, and soft shadows.

🔹 The generated website should be long-scroll and visually impressive.

🔹 Automatically assume what makes the website better — add cool sections, transitions, UI/UX improvements, and any necessary assets (use open URLs).

🔹 You may use sample URLs or placeholders for images/videos if needed.

🔹 Make the UI visually stunning, interactive, and smooth for every type of project.
🔹 If real content is missing, auto-generate placeholders, blog samples, images, and videos using URLs.

🔹 Use semantic HTML structure with <header>, <main>, <section>, and <footer>.

🔹 Ensure the website is fully responsive and looks good on all devices.

🔹 You may use FontAwesome (via CDN), Google Fonts, or anime.js if it enhances the design.

🔹 Always include a clean footer with social media links and basic info.

🔹 Include basic animations and hover effects to improve user interaction.

🔹 Accessibility matters — use alt text for images and label all inputs properly.

🔹 Optionally add dark/light mode toggle if relevant.
⚠️ Respond ONLY with valid JSON object with keys: html, css, js.
⚠️ DO NOT add comments or any explanation.
⚠️ DO NOT wrap it in markdown (no triple backticks).

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
