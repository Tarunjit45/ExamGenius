# 🎯 ExamGenius — Gamified AI Study Planner & Syllabus Adventure

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**ExamGenius** is a gamified AI study companion that transforms dry exam syllabi into an interactive RPG-style study adventure. Powered by Google's Gemini API (`@google/genai`), ExamGenius parses curriculum documents or camera-scanned syllabi, breaks them down into mastery quests, and generates adaptive study notes, interactive quizzes, and countdown trackers.

---

## ✨ Key Features

* 🗺️ **Syllabus-to-Quest Conversion:** Upload or camera-scan your syllabus. ExamGenius breaks heavy textbooks and courses into manageable quest milestones.
* 🤖 **AI-Generated Study Notes:** Generates concise, high-yield summary cheat sheets, memory mnemonics, and conceptual breakdowns on demand.
* ⚔️ **Interactive Knowledge Battles:** Turn revisions into gamified quiz challenges with real-time scoring, streaks, and explanations for incorrect answers.
* 📸 **Camera OCR Ingestion:** Integrated camera permission capture allowing students to snap photos of physical exam routines or textbooks.
* 🏆 **XP & Progression Tracking:** Visual level-ups, mastery badges, and study streaks that defeat procrastination and maintain momentum.

---

## 🛠️ Architecture & Tech Stack

```
+-------------------------------------------------------------+
|                      ExamGenius Frontend                    |
|             (React 18 + TypeScript + Vite + Tailwind)       |
+-------------------------------------------------------------+
         | (Syllabus Input / OCR)             ^ (Quests & Quizzes)
         v                                    |
+-------------------------------------------------------------+
|                   Gemini AI Service Layer                   |
|                   `services/geminiService.ts`               |
|            (@google/genai SDK — Gemini 2.5 Flash)           |
+-------------------------------------------------------------+
         |                                    ^
         v                                    |
+-------------------------------------------------------------+
|                Gamification Engine & State                  |
|          XP, Mastery Levels, Quests & Quizzes Schema        |
+-------------------------------------------------------------+
```

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons.
* **AI Engine:** Google Gemini API (`@google/genai`).
* **Tooling:** Vite, ESLint, PostCSS.

---

## 📁 Repository Structure

```text
ExamGenius/
├── App.tsx             # Main dashboard, quest log & study room view
├── index.tsx           # React DOM bootstrap
├── index.html          # HTML5 entry with meta viewport & font imports
├── components/         # Gamified UI components (Quests, Quizzes, Notes, XP Bar)
├── services/           # Gemini API client & prompt engineering services
├── constants.tsx       # Pre-configured syllabus templates & quest types
├── metadata.json       # Project manifest & capability declarations
├── tsconfig.json       # TypeScript compiler options
├── package.json        # Dependencies & scripts
├── LICENSE             # MIT License
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
* Node.js 18 or higher
* A [Google Gemini API Key](https://aistudio.google.com/)

### 2. Installation
```bash
git clone https://github.com/Tarunjit45/ExamGenius.git
cd ExamGenius

npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
