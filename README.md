# UltraVox AI Voice Translation App

A beautiful real-time voice translation application powered by UltraVox AI, supporting English, Hindi, and Arabic with legally accurate translations.

## Features

- 🎤 **Real-time Voice Recording** - High-quality audio capture
- 🌍 **3-Language Support** - English, Hindi, and Arabic
- ⚖️ **Legal Translation Accuracy** - Professional-grade translations suitable for legal contexts
- 🎨 **Beautiful UI** - Modern glassmorphism design with smooth animations
- 🔄 **Live Transcription** - See what you're saying in real-time
- 📝 **Text Output** - Copy and use translations instantly
- 🚫 **No Voice Output** - Text-only translations to avoid audio interference

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure UltraVox API

1. Get your API key from [UltraVox Dashboard](https://dashboard.ultravox.ai)
2. Update `.env.local` with your API key

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

## How to Use

1. **Select Languages**: Choose your source and target languages from the dropdowns
2. **Start Recording**: Click the large blue record button to begin
3. **Speak**: Talk clearly in your source language
4. **Get Translation**: View the legally accurate translation in real-time
5. **Copy Text**: Use the copy button to copy translations
6. **Stop Recording**: Click the red stop button to end the session

## System Prompt Features

The application uses a sophisticated system prompt that ensures:

- **Legal Accuracy**: Translations are contextually appropriate for legal documents
- **Professional Language**: Uses formal, professional register appropriate for legal contexts
- **Terminology Preservation**: Maintains technical and legal terms accurately
- **Conservative Interpretation**: Uses safe interpretations when terminology is unclear
- **Cultural Sensitivity**: Considers jurisdictional differences in legal concepts
- **Formatting Preservation**: Maintains document structure and numerical values
