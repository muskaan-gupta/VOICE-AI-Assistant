

# VOICE: Voice Operated Intelligent Conversational Engine

[![Development Status](https://img.shields.io/badge/Status-Under%20Development-yellow?style=for-the-badge)](https://github.com/your-username/VOICE-Your-Language-Assistant)
[![Built with Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Python%20Flask-blue?style=for-the-badge&logo=python)](https://flask.palletsprojects.com/)
[![AI Framework](https://img.shields.io/badge/AI-LangChain-green?style=for-the-badge)](https://langchain-ai.github.io/langchain/)

## 🎯 Project Overview

**VOICE** is a cutting-edge, fully voice-based full-duplex AI communication system designed to revolutionize language learning and communication. Our mission is to help users improve their spoken English and other languages through real-time grammar detection and natural spoken feedback.

### 🌟 Key Features

- **Half-Duplex Conversation**: Seamless, fluid conversations without much delays or rigid turn-taking
- **Real-Time Grammar Detection**: Instant identification and correction of grammatical errors
- **Natural Voice Feedback**: Human-like responses through advanced text-to-speech technology
- **Adaptive Learning**: AI that adapts to casual, spoken, and even grammatically incorrect inputs
- **Multi-Language Support**: Extensible architecture for multiple language learning

## 🏗️ System Architecture

VOICE leverages a sophisticated tech stack to deliver a seamless conversational experience:

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js 14 with TypeScript
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: Zustand for global state
- **Authentication**: JWT-based auth system
- **Real-time Communication**: WebSocket integration for live voice interaction

### Backend (Python Flask)
- **API Framework**: Flask with CORS support
- **AI Orchestration**: LangGraph for conversation flow management
- **Speech Processing**: OpenAI Whisper for speech-to-text
- **Grammar Analysis**: LanguageTool integration for real-time grammar checking
- **Voice Synthesis**: Murf API for natural text-to-speech
- **LLM Integration**: OpenAI GPT and Groq for intelligent responses

### AI/ML Components
- **Conversation Management**: LangGraph workflows
- **Grammar Detection**: LanguageTool + fine-tuned language models
- **Speech Recognition**: OpenAI Whisper
- **Natural Language Processing**: LangChain ecosystem
- **Voice Generation**: Murf TTS engine

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.8+
- OpenAI API key
- Groq API key (optional)
- Murf API key for TTS

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/chinmaypandey62/VOICE-Your-Language-Assistant.git
cd VOICE-Your-Language-Assistant
```

2. **Install frontend dependencies**
```bash
pnpm install
```

3. **Setup backend environment**
```bash
# On Windows
npm run setup:backend:windows

# On Unix/Linux/macOS
npm run setup:backend
```

4. **Configure environment variables**
Create `.env.local` in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
MURF_API_KEY=your_murf_api_key
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

5. **Run the development environment**
```bash
# Run both frontend and backend
npm run dev:all

# Or run separately
npm run dev          # Frontend only
npm run dev:backend  # Backend only
```



## 📚 Technical Documentation

### Project Structure
```
├── app/                    # Next.js app directory
├── backend/               # Python Flask backend
├── components/           # React components
├── hooks/               # Custom React hooks
├── lib/                # Utility functions and configs
└── public/             # Static assets
```

### Key Technologies
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Python, Flask, LangChain, LangGraph
- **AI/ML**: OpenAI GPT, Groq, Whisper, LanguageTool
- **Voice**: Murf TTS, Web Speech API
- **Database**: MongoDB
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)


## 🙏 Acknowledgments

- Built with the power of LangChain and LangGraph
- UI components powered by Radix UI
- Voice processing enhanced by OpenAI Whisper
- Natural voice synthesis by Murf

---

**VOICE** - Empowering fluent communication through intelligent conversation technology.