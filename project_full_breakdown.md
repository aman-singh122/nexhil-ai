# Complete Project Breakdown: Nexhil AI Website Generator

---

## 1. Languages & Core Technologies

- **HTML5**: Markup for the frontend UI (`home.html`)
- **CSS3**: Styling, layout, responsiveness, theming (in `<style>` in `home.html`)
- **JavaScript (ES6+)**: Frontend interactivity and backend logic (`home.html`, `script.js`, `index.cjs`)
- **Node.js**: Backend runtime environment (`index.cjs`)
- **JSON**: Data exchange format between frontend and backend

---

## 2. Frontend Libraries & Assets

- **Font Awesome**: Icon library (CDN)
- **Google Fonts (Inter)**: Font family (CDN)
- **No frontend frameworks**: All logic is vanilla JS and CSS

---

## 3. Backend Libraries (Node.js, from `package.json`)

- **@google/genai**: ^1.7.0 (Google Gemini AI API integration)
- **cors**: ^2.8.5 (Enable CORS for frontend-backend communication)
- **express**: ^5.1.0 (Web server and routing)
- **firebase**: ^11.9.1 (Not used in main code, but installed)
- **readline-sync**: ^1.4.10 (Not used in main code, but installed)
- **body-parser**: (Used in code, but not listed in package.json; should be installed)
- **dotenv**: (Used in code, but not listed in package.json; should be installed)
- **fs**: Node.js file system module
- **util**: Node.js utility module (for promisify)
- **path**: Node.js path module

---

## 4. Project Structure & Files

```
PRACTICE/
  home.html      # Main frontend app (UI, CSS, JS)
  script.js      # Additional frontend JS logic (if present)
  style.css      # Additional CSS (if present)
  index.cjs      # Node.js backend server (API, Gemini integration)
  .env           # Environment variables (GEMINI_API_KEY, etc.)
  package.json   # Node.js dependencies and scripts
  public/        # (optional) Static files for production
```

---

## 5. Environment Variables (`.env`)

- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: (optional) Port for the backend server

---

## 6. Key Features & Concepts

- **Responsive Design**: CSS media queries for mobile, tablet, desktop
- **Dark/Light Theme**: CSS variables and classes, default to dark
- **Sidebar (desktop) / Top Toolbar (mobile)**: Navigation and model selection
- **Project Input Panel**: Textarea, voice input, file upload (drag-and-drop and click)
- **Output Panel**: Tabbed interface for HTML, CSS, JS, and live Preview
- **Modals**: For settings, templates, about, feedback
- **File Upload**: Supports multiple file types, drag-and-drop and click
- **Accessibility**: Keyboard and screen-reader accessible elements

---

## 7. Backend API Endpoints (`index.cjs`)

- `/api/health`: Health check endpoint, checks API key
- `/api/generate`: Main endpoint for generating website code using Gemini AI

---

## 8. Google Gemini AI Integration

- Uses `@google/genai` to send prompts and receive code (HTML, CSS, JS) as JSON
- Strict system prompt to ensure only valid JSON is returned

---

## 9. Static File Serving (Production)

- Serves static files from `public/` directory if present and in production mode

---

## 10. Deployment & Hosting

- Can be deployed on Vercel, Render, or any Node.js-compatible host
- Can be run locally with `node index.cjs` (after installing dependencies and setting up `.env`)

---

## 11. Miscellaneous

- **console.log**: For debugging and status messages
- **Error handling**: For missing API keys, invalid prompts, and API errors
- **No database**: Stateless, API-only architecture
- **No build step required**: Pure HTML/CSS/JS for frontend, Node.js for backend

---

## 12. `package.json` (Dependencies)

```json
{
  "dependencies": {
    "@google/genai": "^1.7.0",
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "firebase": "^11.9.1",
    "readline-sync": "^1.4.10"
  }
}
```

---

## 13. How Everything Connects

- User interacts with `home.html` (frontend)
- Frontend sends prompt to backend (`index.cjs`) via `/api/generate`
- Backend uses Gemini API to generate code, returns result as JSON
- Frontend displays the generated HTML, CSS, JS, and live preview

---

## 14. Notes

- All main logic and UI are in `home.html`
- All backend logic is in `index.cjs`
- All configuration is via `.env`
- No database is used (stateless, API-only)
- No build step required; pure HTML/CSS/JS for frontend, Node.js for backend
