# Nexhil AI - AI Website Generator

---

## Page 1: Project Overview & Purpose

### Project Title

**Nexhil AI - AI Website Generator**

### Purpose

Nexhil AI is a modern, responsive web application that allows users to generate complete website code (HTML, CSS, JS) using AI. It is designed for both desktop and mobile, with a professional UI/UX and features like file upload, voice input, and live preview.

### Key Features

- AI model selector (GPT, Claude, Gemini)
- Project prompt input (text & voice)
- File upload (drag-and-drop & click)
- Output panel with tabs (Preview, HTML, CSS, JS)
- Responsive design (mobile-first)
- Modals for settings, templates, about, feedback
- Dark mode by default

### Target Users

- Developers, students, and non-coders who want to quickly generate website code using AI.

---

## Page 2: Technologies Used & Architecture

### Frontend Technologies

- **HTML5**: Semantic structure, accessibility
- **CSS3**: Flexbox, media queries, custom properties (variables), glassmorphism, gradients, dark/light themes
- **JavaScript (ES6+)**: All interactivity, event handling, modal logic, file uploads, dynamic UI

### Libraries & Assets

- **Font Awesome**: Iconography (CDN)
- **Google Fonts (Inter)**: Typography (CDN)
- **No frameworks**: Pure vanilla JS and CSS

### Project Structure

```
PRACTICE/
  home.html      # Main app (UI, CSS, JS)
  script.js      # Additional JS logic (referenced)
  style.css      # (if present, for extra styles)
```

- All main logic and UI are in `home.html`.

### Responsive Design

- Uses CSS media queries for mobile, tablet, and desktop.
- Mobile: Top toolbar replaces sidebar, panels stack vertically.
- Desktop: Sidebar, main content area, and output panel side-by-side.

---

## Page 3: UI/UX & Feature Breakdown

### Layout

- **Sidebar (desktop)**: Logo, model selector, navigation
- **Top Toolbar (mobile)**: Logo, model selector, nav buttons
- **Main Content**:
  - Top bar (title, status, theme toggle, export)
  - Content area: Input panel (prompt, mic, file upload, history), Output panel (tabs, preview, code editors)

### Input Panel

- **Prompt textarea**: For website description
- **Voice input**: Mic button (visible, accessible)
- **File upload**: Button and drag-and-drop area (all clickable)
- **Recent projects**: History section

### Output Panel

- **Tabs**: Preview, HTML, CSS, JS
- **Live preview**: Iframe updates with generated code
- **Code editors**: Read-only, syntax-highlighted

### Modals

- **Settings**: Theme, preferences
- **Templates**: Predefined project templates
- **About**: App info, credits
- **Feedback**: User feedback form

### Accessibility & Usability

- All interactive elements are keyboard and screen-reader accessible.
- Color contrast and button visibility optimized for dark mode.

---

## Page 4: How It Works & Customization

### How It Works (Frontend)

1. **User opens app** (dark mode by default, responsive layout)
2. **Selects AI model** (UI only, backend integration required for real AI)
3. **Enters prompt** (text or voice)
4. **Uploads files** (optional, via drag-and-drop or click)
5. **Clicks Generate** (triggers code generation, requires backend)
6. **Views output** in Preview, HTML, CSS, JS tabs
7. **Exports ZIP** (if enabled)
8. **Uses modals** for settings, templates, about, feedback

### Customization & Extensibility

- **Theme**: Easily switchable via CSS classes
- **AI Integration**: Connect to OpenAI, Anthropic, or Google APIs in backend
- **File Handling**: Extend supported file types in input
- **Export**: Add more export formats (PDF, DOCX, etc.)
- **Accessibility**: Further ARIA roles and keyboard navigation

### Deployment

- Can be hosted on any static web server (Netlify, Vercel, GitHub Pages)
- No build step required; pure HTML/CSS/JS

### Limitations

- No backend/AI logic included in this file (requires server-side integration)
- All code generation and preview are frontend-only

---

## (How to Export as PDF)

1. Copy this content into a Word, Google Doc, or Markdown editor.
2. Format with headings, bullet points, and page breaks as needed.
3. Export or print as PDF.
