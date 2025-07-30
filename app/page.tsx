"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Languages, Volume2, Copy, RotateCw } from "lucide-react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "ar", name: "Arabic" },
  ];

  const canRecord = fromLanguage && toLanguage && fromLanguage !== toLanguage;

  const handleRecording = () => {
    if (!canRecord) return;
    setIsRecording(!isRecording);
    // Add your recording logic here
  };

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
              UltraVox
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Real-time voice translation powered by AI
          </p>
        </motion.div>

        {/* Recording Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="relative">
            <Button
              onClick={handleRecording}
              disabled={!canRecord}
              size="lg"
              className={`w-32 h-32 rounded-full text-white font-semibold text-lg transition-all duration-300 ${
                !canRecord
                  ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed shadow-lg opacity-50"
                  : isRecording
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl shadow-red-500/25"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-2xl shadow-blue-500/25"
              }`}
            >
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div
                    key="recording"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex flex-col items-center"
                  >
                    <MicOff className="w-8 h-8 mb-2" />
                    <span className="text-sm">Stop</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="stopped"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex flex-col items-center"
                  >
                    <Mic className="w-8 h-8 mb-2" />
                    <span className="text-sm">Record</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Pulse animation for recording */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </div>
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
              <div className="space-y-4">
                <Textarea
                  placeholder="Your translated text will appear here..."
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  className="min-h-[200px] resize-none bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-lg leading-relaxed"
                />

                {translatedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(translatedText)
                      }
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        /* Add text-to-speech logic */
                      }}
                      className="flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Play
                    </Button>
                  </motion.div>
                )}
              </div>
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
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              isRecording
                ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                : !canRecord
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : !canRecord
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />
            {isRecording
              ? "Recording in progress..."
              : !fromLanguage || !toLanguage
              ? "Please select both languages to start recording"
              : fromLanguage === toLanguage
              ? "Please select different languages"
              : "Ready to record"}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
