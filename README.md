# StudyMate AI – Smart Study & Quiz Assistant

> Built for InfinityX Hackathon

**StudyMate AI** is a full-stack, AI-powered academic learning companion that transforms raw, passive study notes into an interactive, high-yield mastery experience. Designed for students facing information overload, StudyMate AI extracts structured summaries, generates customizable multiple-choice quizzes with comprehensive rationales, tracks revision topics in a live analytics dashboard, and provides a student-friendly 24/7 AI tutor grounded directly in study notes.

**To Use The StudyMate-AI App**

https://studymate-ai-2-mfoo.onrender.com/
---

## 🚀 Problem It Solves

Students frequently struggle with:
1. **Passive Reading vs. Active Recall:** Merely reading notes or textbooks leads to the "illusion of competence." Students don't know what they don't know until test day.
2. **Time-Consuming Quiz Creation:** Writing high-quality flashcards or practice questions manually takes hours away from actual learning.
3. **Lack of Immediate Explanations:** When answering questions incorrectly, standard textbooks rarely explain *why* wrong distractors were wrong.
4. **Disorganized Revision:** After studying multiple chapters, students lose track of specific weak concepts that need re-review.

**StudyMate AI** solves this by leveraging state-of-the-art Gemini 3.8 Flash AI to automatically synthesize notes into core takeaways, generate adaptive multi-choice quizzes with detailed rationales, maintain a persistent topic revision checklist, and provide real-time explanations through conversational Q&A.

---

## ✨ Features

### 1. Study Notes Input & Synthesis
- **Flexible Note Ingestion:** Paste study notes, lecture transcripts, formula lists, or textbook excerpts of any length.
- **1-Click Sample Notes:** Quick-load curated topics (Cellular Respiration in Biology, The Industrial Revolution in History, Big-O Sorting Algorithms in Computer Science) for instant testing.
- **Empty Notes Validation:** Guards against accidental empty or insufficient submissions before sending API requests.

### 2. Comprehensive AI Study Material
- **Concise Executive Summary:** 2–3 structured paragraphs synthesizing the core theme of the notes.
- **Key Takeaways & Points:** Bullet points with interactive checkmarks to support active recall tracking.
- **Key Terms & Vocabulary:** Definitions paired with contextual relevance ("Why it matters").
- **"In Plain English" Explainer:** Student-friendly intuitive analogies that translate technical jargon into relatable concepts.
- **Export & Copy:** 1-click clipboard export for Notion, Obsidian, or printable study sheets.

### 3. Adaptive AI Quiz Generator
- **Custom Question Count:** Choose between **5, 10, or 15** questions.
- **Difficulty Calibration:** Select **Easy** (definitions & recall), **Moderate** (conceptual applications), or **Hard** (edge cases & synthesis).
- **Structured Assessment:** Each question contains four distinct options, one validated correct answer, and an in-depth pedagogical explanation.
- **Backend Validation:** Validates JSON schema integrity and ensures options are clean before reaching the frontend.

### 4. Interactive Quiz Interface
- **Dual Display Modes:**
  - *Single Question Stepper:* Focused, one-question-at-a-time view with navigation arrows and quick-jump pills.
  - *All Questions List:* Comprehensive scrollable list for rapid review.
- **Test Integrity:** Correct answers and explanations remain strictly hidden until the quiz is submitted.
- **Unanswered Warning:** Alerts students if any questions remain unselected before final submission.

### 5. Detailed Results & Diagnostics
- **Performance Overview:** Total score, correct count, incorrect count, and percentage score.
- **Rationales for Every Question:** Color-coded review showing user selection vs. correct answer with detailed explanations.
- **Filtered Review:** Toggle between "All Questions" and "Missed Only".
- **AI Performance Diagnostic:** Highlights knowledge gaps and generates personalized study tips.
- **Seamless Recovery:** Retake the quiz, generate a new quiz, or launch "Ask StudyMate" pre-filled with missed questions.

### 6. Ask StudyMate (Interactive AI Tutor)
- **Context-Grounded Q&A:** Answers questions strictly anchored in the user's uploaded notes.
- **Suggested Prompts:** 1-click ideas for real-life analogies, common exam traps, memory mnemonics, and scenario questions.
- **Rich Markdown Formatting:** Bold highlights, bulleted steps, and clear visual organization.

### 7. Study Session Dashboard & Revision Tracker
- **Key Metrics:** Questions Attempted, Correct Answers, Cumulative Accuracy %, and Quizzes Completed.
- **Topics to Revise Checklist:** Automatically logs subtopics where questions were missed, with an interactive toggle to mark topics as "Mastered".
- **Session History:** Historical log of recent quiz attempts with score tags and timestamps.
- **Local Persistence:** Retains study notes, study guides, and analytics across page refreshes via browser `localStorage`.

---

## 🛠️ Technology Used

- **Frontend:**
  - React 19 (TypeScript)
  - Tailwind CSS v4 (Modern responsive utility design)
  - Lucide React (Clean icon set)
  - Vite 8 (Ultra-fast build tooling and HMR)
- **Backend:**
  - Node.js & Express
  - TSX runtime for TypeScript execution
  - `@google/genai` (Official Google Gen AI TypeScript SDK)
  - Express middleware integration for Vite SPA serving
- **AI Model:**
  - **Google Gemini 3.8 Flash** (`gemini-3.8-flash`)
  - Server-side structured JSON schema enforcement (`responseSchema`)
  - Telemetry User-Agent header (`aistudio-build`)
  - Secure server-side API key handling (keys are never exposed to browser bundles)

---

## 🧠 How the AI Works

1. **Study Material Generation (`/api/study-material`):**
   - The server receives the raw notes and calls Gemini 3.8 Flash with a strict `responseSchema`.
   - The AI identifies the overarching topic, extracts high-yield takeaways, isolates core terms with definitions, creates a mental analogy, and identifies subtopics.
   
2. **Structured Quiz Creation (`/api/generate-quiz`):**
   - The prompt instructs Gemini to formulate plausible distractors and one unambiguous correct answer matching the selected difficulty.
   - The JSON schema forces the output into `{ questions: [{ question, options, correctAnswer, explanation, topic }] }`.
   - The backend validates array lengths and option indices before returning the payload to the frontend.

3. **Contextual Q&A (`/api/ask-studymate`):**
   - The student's question, current study notes, and conversation history are injected into a pedagogical system prompt.
   - Gemini produces empathetic, student-tailored explanations with analogies and memory tricks.

4. **Performance Analysis (`/api/analyze-results`):**
   - Analyzes quiz mistakes and generates tailored revision recommendations and study tips.

---

## 💻 Installation & Local Setup

### Prerequisites
- Node.js (version 18+ or 20+ recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repo-url>
cd study-mate-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
# GEMINI_API_KEY: Your Google Gemini API Key
GEMINI_API_KEY="your_api_key_here"

# Port (default 3000)
PORT=3000
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```
This builds the production frontend bundle into `dist/`.

### Run in Production
```bash
npm start
```
The Express server (`server.ts`) will serve the static production assets from `dist/` and handle all `/api/*` endpoints.

---

## 🔮 Future Improvements

- **Document & PDF Upload:** Add direct PDF and DOCX file parsing for lecture slide decks.
- **Audio Flashcards / TTS:** Integrate `gemini-3.8-flash-lite-tts` for hands-free audio study while commuting.
- **Spaced Repetition System (SRS):** Add Leitner-box scheduling for automated review notifications.
- **Multi-student Study Groups:** Add collaborative quiz sessions and study room links.

---

## 🏆 Built for InfinityX Hackathon

Developed for the **InfinityX Hackathon** to demonstrate how modern Generative AI can empower self-directed learners with real-time active recall, personalized study diagnostics, and zero hard-coded responses.
