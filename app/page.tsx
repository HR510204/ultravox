"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mic,
  MicOff,
  Languages,
  Volume2,
  RotateCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  UltravoxSession,
  UltravoxSessionStatus,
  Medium,
} from "ultravox-client";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<UltravoxSessionStatus>(UltravoxSessionStatus.DISCONNECTED);
  const [error, setError] = useState<string>("");
  const [translations, setTranslations] = useState<string[]>([]);

  const sessionRef = useRef<UltravoxSession | null>(null);
  const joinUrlRef = useRef<string>("");
  const translationHistoryRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "ar", name: "Arabic" },
  ];

  const getLanguageName = (code: string) => {
    return languages.find((lang) => lang.code === code)?.name || code;
  };
  const createSystemPrompt = () => {
    const fromLang = getLanguageName(fromLanguage);
    const toLang = getLanguageName(toLanguage);

    return `You are a professional legal translator specializing in ${fromLang} to ${toLang} translation. Your expertise ensures legally accurate and contextually appropriate translations.

  INTERACTION PROTOCOL:
  - Do NOT greet the user or provide any introduction
  - Wait silently for the user to speak first
  - Only respond when you receive speech input to translate
  - Never initiate conversation or provide welcome messages
  
  CRITICAL TRANSLATION REQUIREMENTS:
  - You are translating from ${fromLang} to ${toLang}
  - Provide ONLY the translated text in ${toLang}
  - Ensure translations are legally accurate and contextually appropriate
  - Maintain the original meaning, tone, and legal implications
  - Use formal, professional language appropriate for legal contexts
  - Preserve technical terms and legal terminology accurately
  - Do NOT add explanations, greetings, or commentary
  - Do NOT provide audio output - text response only
  - If legal terminology is unclear, use the most conservative/safe interpretation

  RESPONSE FORMAT:
  - Return ONLY the translated text
  - No additional commentary or explanations
  - Maintain original sentence structure where grammatically appropriate
  - Use proper punctuation and formatting for ${toLang}

  ERROR HANDLING:
  - If audio is unclear: "Audio unclear, please repeat"
  - If no speech detected: "No speech detected"
  - If translation is impossible: "Unable to translate - please rephrase"

  LEGAL ACCURACY STANDARDS:
  - Ensure contractual terms are accurately translated
  - Maintain legal document structure and formatting
  - Preserve numerical values, dates, and proper nouns
  - Use appropriate legal register for ${toLang}
  - Consider cultural and jurisdictional differences in legal concepts

  Example flow:
  User speaks in ${fromLang}: [Legal content]
  Your response: [Accurate ${toLang} translation only]

  Remember: Provide ONLY the legally accurate translation in ${toLang}, nothing else. Stay silent until the user speaks first.`;
  };

  const canRecord = fromLanguage && toLanguage && fromLanguage !== toLanguage;

  // Get Ultravox join URL from your backend
  const fetchJoinUrl = async () => {
    try {
      // Replace this with your actual API endpoint to get join URL
      // This should call your backend which creates an Ultravox call with the system prompt
      const response = await fetch("/api/ultravox/create-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemPrompt: createSystemPrompt(),
          temperature: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Ultravox call");
      }

      const data = await response.json();
      return data.joinUrl;
    } catch (error) {
      console.error("Error fetching join URL:", error);
      // For demo purposes, using a placeholder
      throw new Error("Please configure your Ultravox API endpoint");
    }
  };

  const startUltravoxSession = async () => {
    if (!canRecord) return;

    setIsConnecting(true);
    setError("");

    try {
      // Create a new Ultravox session
      const session = new UltravoxSession({
        experimentalMessages: new Set(["transcript"]),
      });

      sessionRef.current = session;

      // Set up event listeners
      session.addEventListener("status", () => {
        const status = session.status;
        setConnectionStatus(status);

        if (
          status === UltravoxSessionStatus.SPEAKING ||
          status === UltravoxSessionStatus.LISTENING ||
          status === UltravoxSessionStatus.THINKING
        ) {
          session?.setOutputMedium(Medium.TEXT);
        }
        if (
          status === UltravoxSessionStatus.IDLE ||
          status === UltravoxSessionStatus.LISTENING
        ) {
          setIsConnecting(false);
          setIsRecording(true);
        } else if (status === UltravoxSessionStatus.DISCONNECTED) {
          setIsRecording(false);
          setIsConnecting(false);
        }
      });

      interface Transcript {
        text: string;
        speaker: "user" | "agent";
      }

      session.addEventListener("transcripts", () => {
        const transcripts = session.transcripts;

        const agentTranscripts = transcripts
          ?.map((t: Transcript) => (t.speaker === "agent" ? t.text : null))
          .filter((text): text is string => text !== null);
        setTranslations(agentTranscripts);
      });

      // Listen for experimental messages that might contain translations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session.addEventListener("experimental_message", (event: any) => {
        console.log("Experimental message received:", event.message);
      });

      // Get join URL and connect
      const joinUrl = await fetchJoinUrl();
      joinUrlRef.current = joinUrl;

      session.joinCall(joinUrl);
    } catch (error) {
      console.error("Failed to start Ultravox session:", error);
      setError(error instanceof Error ? error.message : "Failed to connect");
      setIsConnecting(false);
      setConnectionStatus(UltravoxSessionStatus.DISCONNECTED);
    }
  };

  const stopUltravoxSession = async () => {
    if (sessionRef.current) {
      await sessionRef.current.leaveCall();
      sessionRef.current = null;
    }
    setIsRecording(false);
    setConnectionStatus(UltravoxSessionStatus.DISCONNECTED);
  };

  const handleRecording = async () => {
    console.log("handleRecording called, isRecording:", isRecording);

    if (isRecording) {
      await stopUltravoxSession();
    } else {
      await startUltravoxSession();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.leaveCall();
      }
    };
  }, []);

  // Auto-scroll to bottom when translations update
  useEffect(() => {
    if (translationHistoryRef.current && translations.length > 0) {
      translationHistoryRef.current.scrollTop =
        translationHistoryRef.current.scrollHeight;
    }
  }, [translations]);

  const swapLanguages = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <Languages className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Live Translations
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              onClick={handleRecording}
              disabled={!canRecord || isConnecting}
              size="lg"
              className={`relative w-40 h-20 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl border-0 overflow-hidden group ${
                isRecording
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {/* Animated background overlay */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Button content */}
              <div className="relative z-10 flex items-center justify-center gap-3">
                <AnimatePresence mode="wait">
                  {isConnecting ? (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </motion.div>
                  ) : isRecording ? (
                    <motion.div
                      key="recording"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MicOff className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Mic className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <span className="font-semibold">
                  {isConnecting
                    ? "Connecting..."
                    : isRecording
                    ? "Stop"
                    : "Record"}
                </span>
              </div>

              {/* Pulse animation for recording state */}
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-4 border-red-300"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 0, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <Card
            className={`shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-300 ${
              !canRecord ? "ring-2 ring-yellow-300 dark:ring-yellow-600" : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
                Select Languages
                {!canRecord && (
                  <span className="text-yellow-500 text-sm">*Required</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    From <span className="text-red-500">*</span>
                  </label>
                  <Select value={fromLanguage} onValueChange={setFromLanguage}>
                    <SelectTrigger
                      className={`w-full h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 ${
                        !fromLanguage
                          ? "border-red-300 dark:border-red-600"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select source language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem
                          key={lang.code}
                          value={lang.code}
                          disabled={lang.code === toLanguage}
                        >
                          {lang.name}
                          {lang.code === toLanguage &&
                            " (Already selected as target)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapLanguages}
                    disabled={!fromLanguage || !toLanguage}
                    className="rounded-full w-12 h-12 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </motion.div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                    To <span className="text-red-500">*</span>
                  </label>
                  <Select value={toLanguage} onValueChange={setToLanguage}>
                    <SelectTrigger
                      className={`w-full h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 ${
                        !toLanguage ? "border-red-300 dark:border-red-600" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem
                          key={lang.code}
                          value={lang.code}
                          disabled={lang.code === fromLanguage}
                        >
                          {lang.name}
                          {lang.code === fromLanguage &&
                            " (Already selected as source)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Translation Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
                <Volume2 className="w-5 h-5" />
                Translation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <>
                <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
                  <h3 className="text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                    Translation History
                  </h3>
                  <div
                    className="max-h-[200px] overflow-y-auto space-y-2"
                    ref={translationHistoryRef}
                  >
                    {translations.map((text, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-slate-50 dark:bg-slate-700 text-sm"
                      >
                        <p className="text-slate-700 dark:text-slate-300">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-8"
        >
          {error ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          ) : (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isConnecting
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : isRecording
                  ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  : !canRecord
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnecting
                    ? "bg-blue-500 animate-pulse"
                    : isRecording
                    ? "bg-red-500 animate-pulse"
                    : !canRecord
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />
              {isConnecting
                ? "Connecting to Ultravox..."
                : isRecording
                ? `Listening for ${getLanguageName(
                    fromLanguage
                  )}... (Status: ${connectionStatus})`
                : !fromLanguage || !toLanguage
                ? "Please select both languages to start recording"
                : fromLanguage === toLanguage
                ? "Please select different languages"
                : "Ready to record - Legal translation mode"}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
