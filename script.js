// script.js for CloudAI Studio - AI Website Generator
// This file handles all frontend interactivity and backend connection

// Global Variables
let currentModel = "gpt";
let isRecording = false;
let recognition = null;
let generatedCode = { html: "", css: "", js: "" };
let projectHistory = JSON.parse(localStorage.getItem("projectHistory") || "[]");
let uploadedFiles = [];

// Initialize App
window.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  loadHistory();
  setupEventListeners();
  createParticles();
});

function initializeApp() {
  // Set initial theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.className = savedTheme;
  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    themeIcon.className = savedTheme === "dark" ? "fas fa-moon" : "fas fa-sun";
  }

  // Initialize speech recognition
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      const promptInput = document.getElementById("promptInput");
      promptInput.value += (promptInput.value ? " " : "") + transcript;
    };

    recognition.onerror = function () {
      stopVoiceRecording();
    };
    recognition.onend = function () {
      stopVoiceRecording();
    };
  } else {
    document.getElementById("voiceBtn").style.display = "none";
  }
}

function setupEventListeners() {
  // Model selection
  document.querySelectorAll(".model-option").forEach((option) => {
    option.addEventListener("click", function () {
      document
        .querySelectorAll(".model-option")
        .forEach((o) => o.classList.remove("active"));
      this.classList.add("active");
      currentModel = this.dataset.model;
    });
  });

  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      switchTab(this.dataset.tab);
    });
  });

  // File upload
  const fileInput = document.getElementById("fileInput");
  const fileDropArea = document.getElementById("fileDropArea");
  fileInput.addEventListener("change", handleFileSelect);
  fileDropArea.addEventListener("dragover", handleDragOver);
  fileDropArea.addEventListener("drop", handleFileDrop);
  fileDropArea.addEventListener("dragleave", handleDragLeave);

  // Sidebar toggle for mobile
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth <= 768) sidebarToggle.style.display = "block";
  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("open");
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768) {
      sidebarToggle.style.display = "block";
    } else {
      sidebarToggle.style.display = "none";
      sidebar.classList.remove("open");
    }
  });

  // Prompt input enhancements
  const promptInput = document.getElementById("promptInput");
  promptInput.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") generateWebsite();
  });

  // Generate button
  document
    .getElementById("generateBtn")
    .addEventListener("click", generateWebsite);

  // Theme toggle
  document
    .querySelector(".theme-toggle")
    .addEventListener("click", toggleTheme);

  // Voice button
  document
    .getElementById("voiceBtn")
    .addEventListener("click", toggleVoiceRecording);

  // Download button
  document
    .getElementById("downloadBtn")
    .addEventListener("click", downloadProject);
}

// Email Section Logic
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("userEmail");
  const status = document.getElementById("emailStatus");
  const saveBtn = document.getElementById("saveEmailBtn");
  if (emailInput && saveBtn) {
    // Load saved email
    const saved = localStorage.getItem("userEmail");
    if (saved) emailInput.value = saved;
    saveBtn.addEventListener("click", function () {
      const email = emailInput.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        status.textContent = "Please enter a valid email address.";
        status.style.color = "var(--danger)";
        return;
      }
      localStorage.setItem("userEmail", email);
      status.textContent = "Email saved!";
      status.style.color = "var(--success)";
    });
  }
});

function createParticles() {
  const animatedBg = document.querySelector(".animated-bg");
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 15 + "s";
    particle.style.animationDuration = Math.random() * 10 + 10 + "s";
    animatedBg.appendChild(particle);
  }
}

function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById("themeIcon");
  const currentTheme = body.classList.contains("dark") ? "dark" : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  body.className = newTheme;
  localStorage.setItem("theme", newTheme);
  if (themeIcon) {
    themeIcon.className = newTheme === "dark" ? "fas fa-moon" : "fas fa-sun";
  }
}

// Set theme and icon on load
window.addEventListener("DOMContentLoaded", function () {
  // Set initial theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.className = savedTheme;
  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    themeIcon.className = savedTheme === "dark" ? "fas fa-moon" : "fas fa-sun";
  }
});

// Ensure theme toggle button works
window.addEventListener("DOMContentLoaded", function () {
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }
});

function toggleVoiceRecording() {
  if (!recognition) return;
  if (isRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}
function startVoiceRecording() {
  const voiceBtn = document.getElementById("voiceBtn");
  voiceBtn.classList.add("recording");
  voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
  isRecording = true;
  recognition.start();
}
function stopVoiceRecording() {
  const voiceBtn = document.getElementById("voiceBtn");
  voiceBtn.classList.remove("recording");
  voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
  isRecording = false;
  if (recognition) recognition.stop();
}

// --- File Upload: Support TXT, MD, PDF, DOC, DOCX ---
// Ensure file input and drop area are set up and clickable
window.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  const fileDropArea = document.getElementById("fileDropArea");
  if (fileDropArea && fileInput) {
    // Make drop area clickable to open file dialog
    fileDropArea.addEventListener("click", function (e) {
      // Only trigger if not clicking on a child button
      if (e.target === fileDropArea) fileInput.click();
    });
    // Accept correct file types
    fileInput.setAttribute("accept", ".txt,.md,.pdf,.doc,.docx");
    // Prevent default browser behavior for drag/drop
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      fileDropArea.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    // Visual feedback for drag
    fileDropArea.addEventListener("dragover", function () {
      fileDropArea.classList.add("dragover");
    });
    fileDropArea.addEventListener("dragleave", function () {
      fileDropArea.classList.remove("dragover");
    });
    fileDropArea.addEventListener("drop", function () {
      fileDropArea.classList.remove("dragover");
    });
  }
});

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  processFiles(files);
}
function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("dragover");
}
function handleDragLeave(event) {
  event.currentTarget.classList.remove("dragover");
}
function handleFileDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove("dragover");
  const files = Array.from(event.dataTransfer.files);
  processFiles(files);
}
function processFiles(files) {
  files.forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return;
    }
    const ext = file.name.split(".").pop().toLowerCase();
    if (["txt", "md"].includes(ext)) {
      // Read as text
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const promptInput = document.getElementById("promptInput");
        promptInput.value += `\n\n[Content from ${
          file.name
        }]:\n${content.substring(0, 1000)}${
          content.length > 1000 ? "..." : ""
        }`;
      };
      reader.readAsText(file);
    } else if (["pdf"].includes(ext)) {
      // Read PDF as ArrayBuffer and use PDF.js if available
      const reader = new FileReader();
      reader.onload = function (e) {
        if (window.pdfjsLib) {
          const loadingTask = window.pdfjsLib.getDocument({
            data: e.target.result,
          });
          loadingTask.promise.then(function (pdf) {
            pdf.getPage(1).then(function (page) {
              page.getTextContent().then(function (textContent) {
                const text = textContent.items
                  .map((item) => item.str)
                  .join(" ");
                const promptInput = document.getElementById("promptInput");
                promptInput.value += `\n\n[Content from ${
                  file.name
                }]:\n${text.substring(0, 1000)}${
                  text.length > 1000 ? "..." : ""
                }`;
              });
            });
          });
        } else {
          alert("PDF.js library not loaded. PDF preview not supported.");
        }
      };
      reader.readAsArrayBuffer(file);
      // Optionally, load PDF.js if not present
      if (!window.pdfjsLib) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        script.onload = function () {
          window.pdfjsLib = window["pdfjs-dist/build/pdf"];
        };
        document.head.appendChild(script);
      }
    } else if (["doc", "docx"].includes(ext)) {
      // Read DOC/DOCX as ArrayBuffer and use mammoth.js if available
      const reader = new FileReader();
      reader.onload = function (e) {
        if (window.mammoth) {
          window.mammoth
            .convertToHtml({ arrayBuffer: e.target.result })
            .then(function (result) {
              // Strip HTML tags for prompt
              const text = result.value.replace(/<[^>]+>/g, " ");
              const promptInput = document.getElementById("promptInput");
              promptInput.value += `\n\n[Content from ${
                file.name
              }]:\n${text.substring(0, 1000)}${
                text.length > 1000 ? "..." : ""
              }`;
            });
        } else {
          alert(
            "Mammoth.js library not loaded. DOC/DOCX preview not supported."
          );
        }
      };
      reader.readAsArrayBuffer(file);
      // Optionally, load mammoth.js if not present
      if (!window.mammoth) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.7.0/mammoth.browser.min.js";
        script.onload = function () {
          window.mammoth = window.mammoth;
        };
        document.head.appendChild(script);
      }
    } else {
      alert(`File type not supported: ${file.name}`);
      return;
    }
    uploadedFiles.push(file);
    addFileTag(file);
  });
}
function addFileTag(file) {
  const uploadedFilesContainer = document.getElementById("uploadedFiles");
  const fileTag = document.createElement("div");
  fileTag.className = "file-tag";
  fileTag.innerHTML = `
    <i class="fas fa-file"></i>
    ${file.name}
    <button onclick="removeFile('${file.name}')">&times;</button>
  `;
  uploadedFilesContainer.appendChild(fileTag);
}
window.removeFile = function (fileName) {
  uploadedFiles = uploadedFiles.filter((file) => file.name !== fileName);
  const fileTag = Array.from(document.querySelectorAll(".file-tag")).find(
    (tag) => tag.textContent.includes(fileName)
  );
  if (fileTag) fileTag.remove();
};

async function generateWebsite() {
  const prompt = document.getElementById("promptInput").value.trim();
  if (!prompt) {
    alert("Please enter a description for your website.");
    return;
  }
  showLoading();
  try {
    let sampleCode;
    try {
      // Automatically select backend URL based on environment
      const BACKEND_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://nexhil-ai.onrender.com";
      // Try backend API call (JSON POST)
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Backend error");
      sampleCode = await response.json(); // expects { html, css, js }
    } catch (err) {
      // Fallback to local demo if backend fails
      sampleCode = generateSampleCode(prompt);
    }
    generatedCode = sampleCode;
    updatePreview();
    enableExportZip();
    saveToHistory(prompt, sampleCode);
  } catch (error) {
    alert(
      "Sorry, there was an error generating your website. Please try again."
    );
  } finally {
    hideLoading();
  }
}

function updatePreview() {
  const previewFrame = document.getElementById("previewFrame");
  const html = generatedCode.html || "";
  const css = generatedCode.css || "";
  const js = generatedCode.js || "";
  const fullHTML = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
  previewFrame.srcdoc = fullHTML;
  document.getElementById("htmlEditor").value =
    html || "No HTML code generated yet.";
  document.getElementById("cssEditor").value =
    css || "No CSS code generated yet.";
  document.getElementById("jsEditor").value =
    js || "No JavaScript code generated yet.";
}

function switchTab(tab) {
  const previewFrame = document.getElementById("previewFrame");
  const htmlEditor = document.getElementById("htmlEditor");
  const cssEditor = document.getElementById("cssEditor");
  const jsEditor = document.getElementById("jsEditor");
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.querySelector(`.tab[data-tab='${tab}']`).classList.add("active");
  previewFrame.style.display = tab === "preview" ? "block" : "none";
  htmlEditor.style.display = tab === "html" ? "block" : "none";
  cssEditor.style.display = tab === "css" ? "block" : "none";
  jsEditor.style.display = tab === "js" ? "block" : "none";
}

// --- Animated Code Reveal (Claude AI style) ---
function animateCodeReveal(editorId, code) {
  const editor = document.getElementById(editorId);
  editor.value = "";
  let i = 0;
  const lines = code.split("\n");
  function typeLine(lineIdx) {
    if (lineIdx < lines.length) {
      editor.value += (lineIdx > 0 ? "\n" : "") + lines[lineIdx];
      editor.scrollTop = editor.scrollHeight;
      setTimeout(() => typeLine(lineIdx + 1), 18 + Math.random() * 30);
    }
  }
  typeLine(0);
}
// Patch switchTab to animate code
window.switchTab = function (tab) {
  const previewFrame = document.getElementById("previewFrame");
  const htmlEditor = document.getElementById("htmlEditor");
  const cssEditor = document.getElementById("cssEditor");
  const jsEditor = document.getElementById("jsEditor");
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.querySelector(`.tab[data-tab='${tab}']`).classList.add("active");
  previewFrame.style.display = tab === "preview" ? "block" : "none";
  htmlEditor.style.display = tab === "html" ? "block" : "none";
  cssEditor.style.display = tab === "css" ? "block" : "none";
  jsEditor.style.display = tab === "js" ? "block" : "none";
  if (tab === "html")
    animateCodeReveal(
      "htmlEditor",
      generatedCode.html || "No HTML code generated yet."
    );
  if (tab === "css")
    animateCodeReveal(
      "cssEditor",
      generatedCode.css || "No CSS code generated yet."
    );
  if (tab === "js")
    animateCodeReveal(
      "jsEditor",
      generatedCode.js || "No JavaScript code generated yet."
    );
};

function showLoading() {
  // Show loading only over the preview section
  let loadingOverlay = document.getElementById("loadingOverlay");
  const previewFrame = document.getElementById("previewFrame");
  if (!loadingOverlay) return;
  if (previewFrame) {
    // Style overlay to cover only the preview area
    Object.assign(loadingOverlay.style, {
      display: "flex",
      position: "absolute",
      top: previewFrame.offsetTop + "px",
      left: previewFrame.offsetLeft + "px",
      width: previewFrame.offsetWidth + "px",
      height: previewFrame.offsetHeight + "px",
      background: "rgba(24,26,34,0.85)",
      zIndex: 20,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "0.75rem",
      pointerEvents: "auto",
    });
    // Place overlay inside preview's parent for correct stacking
    if (
      previewFrame.parentElement &&
      loadingOverlay.parentElement !== previewFrame.parentElement
    ) {
      previewFrame.parentElement.appendChild(loadingOverlay);
    }
  } else {
    loadingOverlay.style.display = "flex";
  }
}
function hideLoading() {
  let loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) loadingOverlay.style.display = "none";
}
function enableDownload() {
  document.getElementById("downloadBtn").disabled = false;
}

// Enable Export ZIP button when code is generated
function enableExportZip() {
  const btn = document.getElementById("exportZipBtn");
  if (btn) btn.disabled = false;
}

// Export ZIP functionality using JSZip
function exportProjectZip() {
  if (!window.JSZip) {
    alert("ZIP library not loaded. Please try again in a moment.");
    return;
  }
  const zip = new JSZip();
  zip.file("index.html", generatedCode.html || "");
  zip.file("style.css", generatedCode.css || "");
  zip.file("script.js", generatedCode.js || "");
  zip.generateAsync({ type: "blob" }).then(function (content) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "website.zip";
    a.click();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const exportBtn = document.getElementById("exportZipBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportProjectZip);
});

function downloadProject() {
  const zip = new JSZip();
  zip.file("index.html", generatedCode.html);
  zip.file("style.css", generatedCode.css);
  zip.file("script.js", generatedCode.js);
  zip.generateAsync({ type: "blob" }).then(function (content) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "website.zip";
    a.click();
  });
}
function saveToHistory(prompt, code) {
  projectHistory.unshift({ prompt, code, date: new Date().toISOString() });
  if (projectHistory.length > 10) projectHistory = projectHistory.slice(0, 10);
  localStorage.setItem("projectHistory", JSON.stringify(projectHistory));
  loadHistory();
}
function loadHistory() {
  const historySection = document.getElementById("historySection");
  historySection.innerHTML = "";
  projectHistory.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `<h4>Project #${idx + 1}</h4><p>${item.prompt}</p>`;
    div.addEventListener("click", function () {
      generatedCode = item.code;
      updatePreview();
      enableExportZip();
    });
    historySection.appendChild(div);
  });
}
// Demo fallback code generator
function generateSampleCode(prompt) {
  // ...same as before, or you can expand this for more demo types...
  return {
    html: `<!DOCTYPE html><html><head><title>Demo</title></head><body><h1>Demo Website</h1><p>This is a fallback demo for: ${prompt}</p></body></html>`,
    css: `body { font-family: sans-serif; background: #f8fafc; color: #222; } h1 { color: #3b82f6; }`,
    js: `console.log('Demo website loaded.');`,
  };
}
// JSZip CDN loader for download feature
(function loadJSZip() {
  if (!window.JSZip) {
    var script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = function () {
      window.JSZip = JSZip;
    };
    document.head.appendChild(script);
  }
})();

// --- Feedback Modal Logic ---
document.addEventListener("DOMContentLoaded", function () {
  // Add Feedback button to sidebar if not present
  if (!document.getElementById("feedbackNavItem")) {
    const feedbackBtn = document.createElement("a");
    feedbackBtn.href = "#";
    feedbackBtn.className = "nav-item";
    feedbackBtn.id = "feedbackNavItem";
    feedbackBtn.innerHTML = '<i class="fas fa-comment-dots"></i>Feedback';
    document.querySelector(".nav-section").appendChild(feedbackBtn);
    feedbackBtn.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("feedbackModal").style.display = "flex";
    });
    document.getElementById("closeFeedbackModal").onclick = function () {
      document.getElementById("feedbackModal").style.display = "none";
      document.getElementById("feedbackText").value = "";
      document.getElementById("feedbackStatus").textContent = "";
    };
    document.getElementById("sendFeedbackBtn").onclick = function () {
      const text = document.getElementById("feedbackText").value.trim();
      const status = document.getElementById("feedbackStatus");
      if (!text) {
        status.textContent = "Please enter your feedback.";
        status.style.color = "var(--danger)";
        return;
      }
      // Simulate feedback send
      status.textContent = "Thank you for your feedback!";
      status.style.color = "var(--success)";
      setTimeout(() => {
        document.getElementById("feedbackModal").style.display = "none";
        document.getElementById("feedbackText").value = "";
        status.textContent = "";
      }, 1500);
    };
  }
});

// --- Export/Download Options ---
function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
function addExportOptions() {
  const topBar = document.querySelector(".top-bar-right");
  if (!document.getElementById("saveSessionBtn")) {
    // Save Session
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-secondary";
    saveBtn.id = "saveSessionBtn";
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Session';
    saveBtn.onclick = function () {
      localStorage.setItem("projectHistory", JSON.stringify(projectHistory));
      alert("Session saved!");
    };
    topBar.appendChild(saveBtn);
  }
  if (!document.getElementById("downloadHtmlBtn")) {
    // Download HTML
    const htmlBtn = document.createElement("button");
    htmlBtn.className = "btn btn-secondary";
    htmlBtn.id = "downloadHtmlBtn";
    htmlBtn.innerHTML = '<i class="fab fa-html5"></i> HTML';
    htmlBtn.onclick = function () {
      downloadFile("index.html", generatedCode.html || "");
    };
    topBar.appendChild(htmlBtn);
  }
  if (!document.getElementById("downloadCssBtn")) {
    // Download CSS
    const cssBtn = document.createElement("button");
    cssBtn.className = "btn btn-secondary";
    cssBtn.id = "downloadCssBtn";
    cssBtn.innerHTML = '<i class="fab fa-css3-alt"></i> CSS';
    cssBtn.onclick = function () {
      downloadFile("style.css", generatedCode.css || "");
    };
    topBar.appendChild(cssBtn);
  }
  if (!document.getElementById("downloadJsBtn")) {
    // Download JS
    const jsBtn = document.createElement("button");
    jsBtn.className = "btn btn-secondary";
    jsBtn.id = "downloadJsBtn";
    jsBtn.innerHTML = '<i class="fab fa-js"></i> JS';
    jsBtn.onclick = function () {
      downloadFile("script.js", generatedCode.js || "");
    };
    topBar.appendChild(jsBtn);
  }
}
document.addEventListener("DOMContentLoaded", addExportOptions);

// New Project button logic
window.addEventListener("DOMContentLoaded", function () {
  const newProjectBtn = Array.from(document.querySelectorAll(".nav-item")).find(
    (el) => el.textContent.trim().toLowerCase().includes("new project")
  );
  if (newProjectBtn) {
    newProjectBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // Clear prompt
      const promptInput = document.getElementById("promptInput");
      if (promptInput) promptInput.value = "";
      // Clear uploaded files
      uploadedFiles = [];
      const uploadedFilesContainer = document.getElementById("uploadedFiles");
      if (uploadedFilesContainer) uploadedFilesContainer.innerHTML = "";
      // Clear generated code
      generatedCode = { html: "", css: "", js: "" };
      // Clear editors
      ["htmlEditor", "cssEditor", "jsEditor"].forEach((id) => {
        const ed = document.getElementById(id);
        if (ed) ed.value = "";
      });
      // Reset preview
      const previewFrame = document.getElementById("previewFrame");
      if (previewFrame) previewFrame.srcdoc = "";
      // Optionally, reset other UI elements if needed
    });
  }
});

// Recent Projects button logic
window.addEventListener("DOMContentLoaded", function () {
  const recentProjectsBtn = Array.from(
    document.querySelectorAll(".nav-item")
  ).find((el) =>
    el.textContent.trim().toLowerCase().includes("recent projects")
  );
  if (recentProjectsBtn) {
    recentProjectsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const historySection = document.getElementById("historySection");
      if (historySection) {
        historySection.scrollIntoView({ behavior: "smooth", block: "center" });
        historySection.style.boxShadow = "0 0 0 3px var(--primary)";
        setTimeout(() => {
          historySection.style.boxShadow = "";
        }, 1200);
      }
    });
  }
});

// Templates button logic
window.addEventListener("DOMContentLoaded", function () {
  const templatesBtn = Array.from(document.querySelectorAll(".nav-item")).find(
    (el) => el.textContent.trim().toLowerCase().includes("templates")
  );
  const templatesModal = document.getElementById("templatesModal");
  const closeTemplatesModal = document.getElementById("closeTemplatesModal");
  if (templatesBtn && templatesModal) {
    templatesBtn.addEventListener("click", function (e) {
      e.preventDefault();
      templatesModal.style.display = "flex";
    });
    // Close templates modal when clicking outside the modal box
    templatesModal.addEventListener("mousedown", function (event) {
      // The modal box is the first child div inside templatesModal
      const modalBox = templatesModal.querySelector("div");
      if (event.target === templatesModal) {
        templatesModal.style.display = "none";
      }
    });
  }
  if (closeTemplatesModal && templatesModal) {
    closeTemplatesModal.addEventListener("click", function () {
      templatesModal.style.display = "none";
    });
  }
});

// Populate templates modal with demo templates
window.addEventListener("DOMContentLoaded", function () {
  const templatesModal = document.getElementById("templatesModal");
  const templatesList = document.getElementById("templatesList");
  // Remove any unnecessary white section or heading inside the modal
  if (templatesModal) {
    // Remove any child nodes that are not the modalBox (which contains templatesList)
    Array.from(templatesModal.childNodes).forEach((node) => {
      if (
        node.nodeType === 1 &&
        !node.classList.contains("templates-modal-box") &&
        node !== templatesList
      ) {
        templatesModal.removeChild(node);
      }
    });
  }
  if (templatesModal && templatesList) {
    // Style modal as a centered, scrollable, dark box
    Object.assign(templatesModal.style, {
      display: "none",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.45)", // semi-transparent overlay
      zIndex: 1000,
      justifyContent: "center",
      alignItems: "center",
    });
    // Create or style the inner box
    let modalBox = templatesModal.querySelector(".templates-modal-box");
    if (!modalBox) {
      modalBox = document.createElement("div");
      modalBox.className = "templates-modal-box";
      templatesModal.appendChild(modalBox);
      // Move templatesList into modalBox
      modalBox.appendChild(templatesList);
    }
    Object.assign(modalBox.style, {
      background: "#181a22",
      color: "#fff",
      borderRadius: "1rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      padding: "2rem 1.5rem 1.5rem 1.5rem",
      maxWidth: "420px",
      width: "90vw",
      maxHeight: "80vh",
      overflowY: "auto",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
    });
    // Add close (cut) button if not present
    let closeBtn = modalBox.querySelector(".templates-close-btn");
    if (!closeBtn) {
      closeBtn = document.createElement("button");
      closeBtn.className = "templates-close-btn";
      closeBtn.innerHTML = "&times;";
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: "0.5rem",
        right: "0.8rem",
        fontSize: "2rem",
        background: "none",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        zIndex: 10,
        lineHeight: 1,
      });
      closeBtn.title = "Close";
      modalBox.insertBefore(closeBtn, modalBox.firstChild);
      closeBtn.addEventListener("click", function () {
        templatesModal.style.display = "none";
      });
    }
    // 30+ template ideas (unchanged)
    const templates = [
      {
        name: "Portfolio Website",
        prompt:
          "A modern, responsive portfolio website with sections for About, Projects, Skills, and Contact. Include a hero image and social links.",
      },
      {
        name: "Blog",
        prompt:
          "A clean blog layout with a homepage, post list, and individual post pages. Include a sidebar for categories and a search bar.",
      },
      {
        name: "Landing Page",
        prompt:
          "A product landing page with a hero section, features, testimonials, pricing table, and a call-to-action button.",
      },
      {
        name: "Restaurant Website",
        prompt:
          "A restaurant website with menu, gallery, reservation form, and Google Maps integration.",
      },
      {
        name: "E-commerce Store",
        prompt:
          "A simple e-commerce homepage with product grid, filters, shopping cart icon, and featured products banner.",
      },
      {
        name: "Personal Resume",
        prompt:
          "A digital resume with sections for experience, education, skills, and a downloadable PDF option.",
      },
      {
        name: "Photography Gallery",
        prompt:
          "A photo gallery website with grid layout, lightbox, and categories for different albums.",
      },
      {
        name: "Event Page",
        prompt:
          "An event landing page with schedule, speakers, registration form, and location map.",
      },
      {
        name: "Fitness Trainer",
        prompt:
          "A fitness trainer website with class schedule, trainer bios, testimonials, and contact form.",
      },
      {
        name: "Travel Blog",
        prompt:
          "A travel blog with featured destinations, map integration, and Instagram feed.",
      },
      {
        name: "Online Course",
        prompt:
          "A course landing page with curriculum, instructor bio, pricing, and enrollment form.",
      },
      {
        name: "Nonprofit Organization",
        prompt:
          "A nonprofit website with mission statement, donation form, volunteer signup, and news section.",
      },
      {
        name: "Tech Startup",
        prompt:
          "A tech startup homepage with product features, team bios, investor info, and newsletter signup.",
      },
      {
        name: "Music Band",
        prompt:
          "A band website with music player, tour dates, photo gallery, and merch store.",
      },
      {
        name: "Podcast Website",
        prompt:
          "A podcast site with episode list, audio player, show notes, and subscription links.",
      },
      {
        name: "Real Estate Listing",
        prompt:
          "A real estate site with property grid, filters, map, and contact agent form.",
      },
      {
        name: "Medical Clinic",
        prompt:
          "A clinic website with doctor profiles, appointment booking, services, and patient testimonials.",
      },
      {
        name: "Wedding Invitation",
        prompt:
          "A digital wedding invite with RSVP form, event schedule, gallery, and location map.",
      },
      {
        name: "Bookstore",
        prompt:
          "An online bookstore with book grid, search, categories, and shopping cart.",
      },
      {
        name: "Job Board",
        prompt:
          "A job board with job listings, filters, company profiles, and application form.",
      },
      {
        name: "News Portal",
        prompt:
          "A news portal with categories, featured articles, trending section, and newsletter signup.",
      },
      {
        name: "Crypto Dashboard",
        prompt:
          "A crypto dashboard with live price charts, portfolio tracker, and news feed.",
      },
      {
        name: "SaaS Product",
        prompt:
          "A SaaS landing page with pricing, features, testimonials, and signup form.",
      },
      {
        name: "Fitness App Promo",
        prompt:
          "A promo site for a fitness app with feature highlights, screenshots, and download links.",
      },
      {
        name: "Interior Design Studio",
        prompt:
          "A design studio site with project gallery, services, team, and contact form.",
      },
      {
        name: "Pet Adoption",
        prompt:
          "A pet adoption site with animal profiles, adoption form, and success stories.",
      },
      {
        name: "Online Forum",
        prompt:
          "A forum with categories, threads, user profiles, and post editor.",
      },
      {
        name: "Recipe Website",
        prompt:
          "A recipe site with categories, featured recipes, search, and user submissions.",
      },
      {
        name: "Consulting Agency",
        prompt:
          "A consulting agency site with services, case studies, team, and contact form.",
      },
      {
        name: "Charity Fundraiser",
        prompt:
          "A fundraiser page with progress bar, donation form, and campaign updates.",
      },
      {
        name: "Fashion Lookbook",
        prompt:
          "A fashion lookbook with seasonal collections, image grid, and designer bios.",
      },
      {
        name: "Language School",
        prompt:
          "A language school site with course list, teacher bios, testimonials, and enrollment form.",
      },
      {
        name: "Kids Learning",
        prompt:
          "A kids learning site with colorful design, games, and interactive lessons.",
      },
      {
        name: "Minimal Blog",
        prompt:
          "A minimal blog with clean typography, dark mode, and featured posts.",
      },
      {
        name: "AI Tool Showcase",
        prompt:
          "A landing page for an AI tool with feature highlights, demo video, and signup form.",
      },
      {
        name: "Travel Agency",
        prompt:
          "A travel agency site with destination grid, booking form, and testimonials.",
      },
      {
        name: "Freelancer Profile",
        prompt:
          "A freelancer profile with portfolio, services, testimonials, and contact form.",
      },
      {
        name: "Online Magazine",
        prompt:
          "A magazine site with categories, featured articles, and newsletter signup.",
      },
      {
        name: "Startup Pitch",
        prompt:
          "A startup pitch site with product overview, team, and investor info.",
      },
      {
        name: "Art Portfolio",
        prompt: "An art portfolio with gallery, artist bio, and contact form.",
      },
      {
        name: "Conference Website",
        prompt:
          "A conference site with schedule, speakers, registration, and sponsors.",
      },
      {
        name: "Resume Builder",
        prompt:
          "A resume builder with form input, preview, and download as PDF.",
      },
      {
        name: "Online Storefront",
        prompt:
          "A storefront with product grid, shopping cart, and checkout form.",
      },
      {
        name: "Newsletter Signup",
        prompt:
          "A newsletter signup page with feature highlights and email form.",
      },
      {
        name: "Digital Agency",
        prompt:
          "A digital agency site with services, portfolio, team, and contact form.",
      },
      {
        name: "Yoga Studio",
        prompt:
          "A yoga studio site with class schedule, instructor bios, and booking form.",
      },
      {
        name: "Podcast Landing",
        prompt:
          "A podcast landing page with episode list, audio player, and subscription links.",
      },
      {
        name: "Photography Portfolio",
        prompt:
          "A photography portfolio with grid gallery, about section, and contact form.",
      },
      {
        name: "Online Learning Platform",
        prompt:
          "A learning platform with course list, instructor bios, and enrollment form.",
      },
      {
        name: "Personal Blog",
        prompt:
          "A personal blog with featured posts, about section, and contact form.",
      },
      {
        name: "Fitness Tracker Dashboard",
        prompt:
          "A fitness tracker dashboard with charts, activity log, and goal setting.",
      },
      {
        name: "Music Streaming",
        prompt: "A music streaming site with playlist, player, and album grid.",
      },
      {
        name: "Recipe App",
        prompt: "A recipe app with search, categories, and user submissions.",
      },
      {
        name: "Travel Portfolio",
        prompt: "A travel portfolio with map, photo gallery, and trip stories.",
      },
      {
        name: "Startup Landing",
        prompt:
          "A startup landing page with hero section, features, and signup form.",
      },
      {
        name: "Book Review Blog",
        prompt:
          "A book review blog with featured books, reviews, and author bios.",
      },
      {
        name: "Charity Event",
        prompt:
          "A charity event page with schedule, donation form, and gallery.",
      },
      {
        name: "Minimal Portfolio",
        prompt:
          "A minimal portfolio with clean design, project grid, and contact form.",
      },
      {
        name: "Online Marketplace",
        prompt:
          "A marketplace with product listings, filters, and shopping cart.",
      },
      {
        name: "Resume Website",
        prompt:
          "A resume website with sections for experience, education, and skills.",
      },
      {
        name: "Wedding Website",
        prompt: "A wedding website with event details, RSVP form, and gallery.",
      },
      {
        name: "Fitness Blog",
        prompt:
          "A fitness blog with workout routines, nutrition tips, and progress tracker.",
      },
      {
        name: "Podcast Directory",
        prompt: "A podcast directory with show list, categories, and player.",
      },
      {
        name: "Startup Blog",
        prompt: "A startup blog with news, team bios, and product updates.",
      },
      {
        name: "Personal Dashboard",
        prompt:
          "A personal dashboard with widgets for weather, calendar, and notes.",
      },
      {
        name: "Crypto Portfolio",
        prompt: "A crypto portfolio tracker with charts, news, and alerts.",
      },
      {
        name: "Online CV",
        prompt:
          "An online CV with sections for experience, education, and skills.",
      },
      {
        name: "Event Countdown",
        prompt:
          "An event countdown page with timer, event info, and RSVP form.",
      },
      {
        name: "Minimal Landing",
        prompt: "A minimal landing page with hero section and call-to-action.",
      },
      {
        name: "Product Showcase",
        prompt:
          "A product showcase with image slider, features, and testimonials.",
      },
      {
        name: "Newsletter Landing",
        prompt:
          "A newsletter landing page with signup form and feature highlights.",
      },
      {
        name: "Freelancer Portfolio",
        prompt:
          "A freelancer portfolio with project grid, testimonials, and contact form.",
      },
      {
        name: "Online Store",
        prompt:
          "An online store with product grid, shopping cart, and checkout.",
      },
      {
        name: "Personal Site",
        prompt: "A personal site with about, blog, and contact sections.",
      },
      {
        name: "Photography Blog",
        prompt:
          "A photography blog with featured photos, stories, and gallery.",
      },
      {
        name: "Digital Product",
        prompt:
          "A digital product landing page with features, pricing, and download links.",
      },
      {
        name: "Fitness Landing",
        prompt:
          "A fitness landing page with hero section, features, and signup form.",
      },
      {
        name: "Travel Blog",
        prompt:
          "A travel blog with featured destinations, stories, and gallery.",
      },
      {
        name: "Minimal Resume",
        prompt: "A minimal resume with clean design and downloadable PDF.",
      },
      {
        name: "Startup Portfolio",
        prompt:
          "A startup portfolio with project grid, team, and contact form.",
      },
      {
        name: "Online Portfolio",
        prompt:
          "An online portfolio with project showcase, about, and contact.",
      },
      {
        name: "Personal Landing",
        prompt: "A personal landing page with hero section and about info.",
      },
      {
        name: "Product Landing",
        prompt:
          "A product landing page with features, testimonials, and pricing.",
      },
      {
        name: "Minimal Blog",
        prompt: "A minimal blog with clean design and featured posts.",
      },
      {
        name: "Resume Landing",
        prompt: "A resume landing page with experience, education, and skills.",
      },
      {
        name: "Portfolio Landing",
        prompt: "A portfolio landing page with project grid and about section.",
      },
      {
        name: "Personal Blog",
        prompt: "A personal blog with featured posts and about section.",
      },
    ];
    templatesList.style.margin = "0";
    templatesList.style.padding = "0";
    templatesList.style.listStyle = "none";
    templatesList.innerHTML = templates
      .map(
        (tpl, i) =>
          `<li style=\"margin-bottom:1rem;\"><button style=\"width:100%;padding:0.75rem 1rem;border-radius:0.5rem;border:1px solid var(--glass-border);background:rgba(30,30,40,0.98);color:#fff;cursor:pointer;font-size:1rem;text-align:left;transition:background 0.2s;\" data-tpl-idx=\"${i}\" onmouseover=\"this.style.background='#222'\" onmouseout=\"this.style.background='rgba(30,30,40,0.98)'\">${tpl.name}</button></li>`
      )
      .join("");
    templatesList.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = this.getAttribute("data-tpl-idx");
        const promptInput = document.getElementById("promptInput");
        if (promptInput) promptInput.value = templates[idx].prompt;
        templatesModal.style.display = "none";
      });
    });
  }
});

// --- Settings Modal Logic ---
window.addEventListener("DOMContentLoaded", function () {
  const settingsBtn = Array.from(document.querySelectorAll(".nav-item")).find(
    (el) => el.textContent.trim().toLowerCase().includes("settings")
  );
  const settingsModal = document.getElementById("settingsModal");
  const closeSettingsModal = document.getElementById("closeSettingsModal");
  const settingsContent = document.getElementById("settingsContent");
  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // Make settings modal background dark and modal box small, centered, scrollable
      const modalBox =
        settingsModal.querySelector(".settings-modal-box") ||
        settingsModal.firstElementChild;
      if (modalBox) {
        Object.assign(modalBox.style, {
          background: "#181a22",
          color: "#fff",
          borderRadius: "1rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          padding: "2rem",
          maxWidth: "400px",
          width: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        });
        // Make the close (cut) button white
        const closeBtn = modalBox.querySelector("#closeSettingsModal");
        if (closeBtn) {
          closeBtn.style.color = "#fff";
          closeBtn.style.background = "none";
        }
      }
      // Populate settings content dynamically with more features
      if (settingsContent) {
        settingsContent.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 1.2rem;">
            <div>
              <label style="font-weight:600;">Theme:</label><br>
              <button id="settingsThemeToggle" class="btn btn-secondary" style="margin-top:0.5rem;">
                Toggle Theme
              </button>
            </div>
            <div>
              <label style="font-weight:600;">Clear Project History:</label><br>
              <button id="clearHistoryBtn" class="btn btn-danger" style="margin-top:0.5rem;">
                Clear History
              </button>
            </div>
            <div>
              <label style="font-weight:600;">Reset All Settings:</label><br>
              <button id="resetSettingsBtn" class="btn btn-danger" style="margin-top:0.5rem;">
                Reset Settings
              </button>
            </div>
            <div>
              <label style="font-weight:600;">Export Project History (JSON):</label><br>
              <button id="exportHistoryBtn" class="btn btn-secondary" style="margin-top:0.5rem;">
                Export History
              </button>
            </div>
            <div>
              <label style="font-weight:600;">Import Project History (JSON):</label><br>
              <input type="file" id="importHistoryInput" accept="application/json" style="margin-top:0.5rem; color:#fff;" />
            </div>
            <div>
              <label style="font-weight:600;">Set Custom Profile Name:</label><br>
              <input type="text" id="profileNameInput" placeholder="Enter your name..." style="margin-top:0.5rem; padding:0.5rem; border-radius:0.4rem; border:1px solid #333; background:#222; color:#fff;" />
              <button id="saveProfileNameBtn" class="btn btn-secondary" style="margin-top:0.5rem;">Save Name</button>
            </div>
            <div>
              <label style="font-weight:600;">Set Custom Profile Image URL:</label><br>
              <input type="text" id="profileImgInput" placeholder="Paste image URL..." style="margin-top:0.5rem; padding:0.5rem; border-radius:0.4rem; border:1px solid #333; background:#222; color:#fff;" />
              <button id="saveProfileImgBtn" class="btn btn-secondary" style="margin-top:0.5rem;">Save Image</button>
            </div>
            <div>
              <label style="font-weight:600;">Enable/Disable Voice Input:</label><br>
              <button id="toggleVoiceBtn" class="btn btn-secondary" style="margin-top:0.5rem;">Toggle Voice Input</button>
            </div>
            <div>
              <label style="font-weight:600;">Show/Hide Recent Projects:</label><br>
              <button id="toggleHistoryBtn" class="btn btn-secondary" style="margin-top:0.5rem;">Toggle History</button>
            </div>
          </div>
        `;
        // Theme toggle
        document.getElementById("settingsThemeToggle").onclick = toggleTheme;
        // Clear history
        document.getElementById("clearHistoryBtn").onclick = function () {
          if (confirm("Are you sure you want to clear your project history?")) {
            localStorage.removeItem("projectHistory");
            projectHistory = [];
            loadHistory();
            alert("Project history cleared.");
          }
        };
        // Reset settings
        document.getElementById("resetSettingsBtn").onclick = function () {
          if (confirm("Reset all settings and clear all data?")) {
            localStorage.clear();
            projectHistory = [];
            loadHistory();
            document.getElementById("promptInput").value = "";
            alert("All settings and data reset. Reloading page...");
            setTimeout(() => location.reload(), 800);
          }
        };
        // Export history
        document.getElementById("exportHistoryBtn").onclick = function () {
          const data = localStorage.getItem("projectHistory") || "[]";
          const blob = new Blob([data], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "project_history.json";
          a.click();
        };
        // Import history
        document.getElementById("importHistoryInput").onchange = function (e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function (evt) {
            try {
              const imported = JSON.parse(evt.target.result);
              if (Array.isArray(imported)) {
                localStorage.setItem(
                  "projectHistory",
                  JSON.stringify(imported)
                );
                projectHistory = imported;
                loadHistory();
                alert("Project history imported!");
              } else {
                alert("Invalid history file.");
              }
            } catch {
              alert("Invalid JSON file.");
            }
          };
          reader.readAsText(file);
        };
        // Set custom profile name
        const profileNameInput = document.getElementById("profileNameInput");
        const saveProfileNameBtn =
          document.getElementById("saveProfileNameBtn");
        if (profileNameInput && saveProfileNameBtn) {
          // Load saved name
          const savedName = localStorage.getItem("profileName") || "";
          profileNameInput.value = savedName;
          saveProfileNameBtn.onclick = function () {
            const name = profileNameInput.value.trim();
            if (name) {
              localStorage.setItem("profileName", name);
              // Update sidebar name
              const userName = document.querySelector(".user-details h4");
              if (userName) userName.textContent = name;
              alert("Profile name updated!");
            }
          };
        }
        // Set custom profile image
        const profileImgInput = document.getElementById("profileImgInput");
        const saveProfileImgBtn = document.getElementById("saveProfileImgBtn");
        if (profileImgInput && saveProfileImgBtn) {
          // Load saved image
          const savedImg = localStorage.getItem("profileImg") || "";
          profileImgInput.value = savedImg;
          saveProfileImgBtn.onclick = function () {
            const url = profileImgInput.value.trim();
            if (url) {
              localStorage.setItem("profileImg", url);
              const profilePic = document.getElementById("profilePic");
              if (profilePic) profilePic.src = url;
              alert("Profile image updated!");
            }
          };
        }
        // Enable/Disable voice input
        document.getElementById("toggleVoiceBtn").onclick = function () {
          const voiceBtn = document.getElementById("voiceBtn");
          if (voiceBtn.style.display === "none") {
            voiceBtn.style.display = "inline-flex";
            localStorage.setItem("voiceInputEnabled", "1");
            alert("Voice input enabled.");
          } else {
            voiceBtn.style.display = "none";
            localStorage.setItem("voiceInputEnabled", "0");
            alert("Voice input disabled.");
          }
        };
        // Show/Hide recent projects
        document.getElementById("toggleHistoryBtn").onclick = function () {
          const historySection = document.getElementById("historySection");
          if (historySection.style.display === "none") {
            historySection.style.display = "block";
            localStorage.setItem("historyVisible", "1");
            alert("Recent projects shown.");
          } else {
            historySection.style.display = "none";
            localStorage.setItem("historyVisible", "0");
            alert("Recent projects hidden.");
          }
        };
      }
      settingsModal.style.display = "flex";
    });
    // Close settings modal when clicking outside the modal box
    settingsModal.addEventListener("mousedown", function (event) {
      const modalBox =
        settingsModal.querySelector(".settings-modal-box") ||
        settingsModal.firstElementChild;
      if (event.target === settingsModal) {
        settingsModal.style.display = "none";
      }
    });
  }
  if (closeSettingsModal && settingsModal) {
    closeSettingsModal.addEventListener("click", function () {
      settingsModal.style.display = "none";
    });
    // Make sure close (cut) button is white
    closeSettingsModal.style.color = "#fff";
    closeSettingsModal.style.background = "none";
  }
  // On load, apply saved profile image and name, voice input, and history visibility
  window.addEventListener("DOMContentLoaded", function () {
    const savedImg = localStorage.getItem("profileImg");
    if (savedImg) {
      const profilePic = document.getElementById("profilePic");
      if (profilePic) profilePic.src = savedImg;
    }
    const savedName = localStorage.getItem("profileName");
    if (savedName) {
      const userName = document.querySelector(".user-details h4");
      if (userName) userName.textContent = savedName;
    }
    const voiceInputEnabled = localStorage.getItem("voiceInputEnabled");
    if (voiceInputEnabled === "0") {
      const voiceBtn = document.getElementById("voiceBtn");
      if (voiceBtn) voiceBtn.style.display = "none";
    }
    const historyVisible = localStorage.getItem("historyVisible");
    if (historyVisible === "0") {
      const historySection = document.getElementById("historySection");
      if (historySection) historySection.style.display = "none";
    }
  });
});

// --- Hide Scrollbar in Modals (Settings, Templates, etc.) ---
(function hideModalScrollbars() {
  const style = document.createElement("style");
  style.innerHTML = `
    /* Hide scrollbar for modal boxes but keep scroll functionality */
    .settings-modal-box, .templates-modal-box {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE 10+ */
    }
    .settings-modal-box::-webkit-scrollbar, .templates-modal-box::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  `;
  document.head.appendChild(style);
})();

// --- Firebase Auth for Google Sign-In ---
// Add Firebase SDK
(function addFirebaseScript() {
  if (!window.firebase) {
    var script = document.createElement("script");
    script.src =
      "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
    script.onload = function () {
      var authScript = document.createElement("script");
      authScript.src =
        "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js";
      document.head.appendChild(authScript);
    };
    document.head.appendChild(script);
  }
})();

// Initialize Firebase after SDK loads
function initFirebaseAuth() {
  if (!window.firebase || !window.firebase.auth)
    return setTimeout(initFirebaseAuth, 200);
  // TODO: Replace with your Firebase config
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    appId: "YOUR_APP_ID",
  };
  if (!window.firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const googleBtn = document.getElementById("googleSignInBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const emailInput = document.getElementById("userEmail");
  const status = document.getElementById("emailStatus");
  if (googleBtn) {
    googleBtn.onclick = function () {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth
        .signInWithPopup(provider)
        .then((result) => {
          const user = result.user;
          if (user && user.email) {
            emailInput.value = user.email;
            localStorage.setItem("userEmail", user.email);
            status.textContent = "Signed in with Google!";
            status.style.color = "var(--success)";
            googleBtn.style.display = "none";
            logoutBtn.style.display = "inline-block";
          }
        })
        .catch((err) => {
          status.textContent = "Google sign-in failed.";
          status.style.color = "var(--danger)";
        });
    };
  }
  if (logoutBtn) {
    logoutBtn.onclick = function () {
      auth.signOut().then(() => {
        emailInput.value = "";
        localStorage.removeItem("userEmail");
        status.textContent = "Logged out.";
        status.style.color = "var(--success)";
        googleBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
      });
    };
  }
  // Show/hide buttons based on auth state
  auth.onAuthStateChanged(function (user) {
    if (user && user.email) {
      emailInput.value = user.email;
      googleBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      status.textContent = "Signed in with Google!";
      status.style.color = "var(--success)";
    } else {
      googleBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    }
  });
}
window.addEventListener("DOMContentLoaded", initFirebaseAuth);

// --- Sidebar Auth Section Logic (Email/Password + Google) ---
function renderAuthSection(user) {
  const authSection = document.getElementById("authSection");
  if (!authSection) return;
  if (user && user.email) {
    // Show user info and logout
    authSection.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
        <div style="font-size:1.1rem;font-weight:600;">${
          user.displayName ? user.displayName : user.email
        }</div>
        <div style="font-size:0.9rem;opacity:0.7;">${user.email}</div>
        <button class="btn btn-secondary" id="sidebarLogoutBtn" style="margin-top:0.5rem;width:100%;">Logout</button>
      </div>
    `;
    document.getElementById("sidebarLogoutBtn").onclick = function () {
      firebase.auth().signOut();
    };
  } else {
    // Show login/register form and Google button
    authSection.innerHTML = `
      <form id="sidebarAuthForm" style="display:flex;flex-direction:column;gap:0.5rem;width:100%;">
        <input type="email" id="sidebarAuthEmail" placeholder="Email" required style="padding:0.5rem;border-radius:0.4rem;border:1px solid #333;background:#222;color:#fff;" autocomplete="username" />
        <input type="password" id="sidebarAuthPassword" placeholder="Password" required style="padding:0.5rem;border-radius:0.4rem;border:1px solid #333;background:#222;color:#fff;" autocomplete="current-password" />
        <button type="submit" class="btn btn-primary" style="width:100%;">Login / Register</button>
        <button type="button" class="btn btn-secondary" id="sidebarGoogleBtn" style="background:#fff;color:#222;border:1px solid #ccc;width:100%;"><i class="fab fa-google"></i> Continue with Google</button>
        <div id="sidebarAuthStatus" style="font-size:0.9rem;margin-top:0.25rem;"></div>
      </form>
    `;
    // Email/password login/register
    document.getElementById("sidebarAuthForm").onsubmit = function (e) {
      e.preventDefault();
      const email = document.getElementById("sidebarAuthEmail").value.trim();
      const password = document.getElementById("sidebarAuthPassword").value;
      const status = document.getElementById("sidebarAuthStatus");
      if (!email || !password) {
        status.textContent = "Please enter both email and password.";
        status.style.color = "var(--danger)";
        return;
      }
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          status.textContent = "Logged in!";
          status.style.color = "var(--success)";
        })
        .catch((err) => {
          // If user not found, try to register
          if (err.code === "auth/user-not-found") {
            firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then(() => {
                status.textContent = "Registered and logged in!";
                status.style.color = "var(--success)";
              })
              .catch((err2) => {
                status.textContent = err2.message;
                status.style.color = "var(--danger)";
              });
          } else {
            status.textContent = err.message;
            status.style.color = "var(--danger)";
          }
        });
    };
    // Google sign-in
    document.getElementById("sidebarGoogleBtn").onclick = function () {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .catch((err) => {
          document.getElementById("sidebarAuthStatus").textContent =
            "Google sign-in failed.";
          document.getElementById("sidebarAuthStatus").style.color =
            "var(--danger)";
        });
    };
  }
}
// Wait for Firebase SDK to load, then set up auth state observer
function setupSidebarAuth() {
  if (!window.firebase || !window.firebase.auth)
    return setTimeout(setupSidebarAuth, 200);
  firebase.auth().onAuthStateChanged(renderAuthSection);
}
window.addEventListener("DOMContentLoaded", setupSidebarAuth);

// Hide scrollbars but keep scrolling functional for modals and editors
function hideScrollbars() {
  // Hide scrollbars for modals
  const modalBoxes = document.querySelectorAll(
    ".templates-modal-box, .settings-modal-box"
  );
  modalBoxes.forEach((box) => {
    box.style.scrollbarWidth = "none"; // Firefox
    box.style.msOverflowStyle = "none"; // IE/Edge
    box.style.overflowY = "auto";
    // For Webkit browsers
    box.style.setProperty("scrollbar-width", "none", "important");
    box.style.setProperty("overflow-y", "auto", "important");
    // Add webkit CSS via style tag if not present
    if (!box.querySelector("style[data-hide-scrollbar]")) {
      const style = document.createElement("style");
      style.setAttribute("data-hide-scrollbar", "1");
      style.innerHTML = `
        .templates-modal-box::-webkit-scrollbar, .settings-modal-box::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          background: transparent !important;
        }
      `;
      box.appendChild(style);
    }
  });
  // Hide scrollbars for code editors
  ["htmlEditor", "cssEditor", "jsEditor"].forEach((id) => {
    const ed = document.getElementById(id);
    if (ed) {
      ed.style.scrollbarWidth = "none";
      ed.style.msOverflowStyle = "none";
      ed.style.overflowY = "auto";
      ed.style.setProperty("scrollbar-width", "none", "important");
      ed.style.setProperty("overflow-y", "auto", "important");
      if (!ed.querySelector("style[data-hide-scrollbar]")) {
        const style = document.createElement("style");
        style.setAttribute("data-hide-scrollbar", "1");
        style.innerHTML = `
          #${id}::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            background: transparent !important;
          }
        `;
        ed.appendChild(style);
      }
    }
  });
}
window.addEventListener("DOMContentLoaded", hideScrollbars);

// --- Fullscreen Preview Logic ---
window.addEventListener("DOMContentLoaded", function () {
  const openBtn = document.getElementById("openPreviewFullscreen");
  const modal = document.getElementById("fullscreenPreviewModal");
  const closeBtn = document.getElementById("closeFullscreenPreview");
  const previewFrame = document.getElementById("previewFrame");
  const fullscreenFrame = document.getElementById("fullscreenPreviewFrame");
  if (openBtn && modal && closeBtn && previewFrame && fullscreenFrame) {
    openBtn.addEventListener("click", function () {
      fullscreenFrame.srcdoc = previewFrame.srcdoc;
      modal.style.display = "flex";
    });
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
      fullscreenFrame.srcdoc = "";
    });
    // Optional: close on overlay click
    modal.addEventListener("mousedown", function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
        fullscreenFrame.srcdoc = "";
      }
    });
  }
});
