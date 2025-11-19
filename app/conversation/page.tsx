"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VoiceAnimation } from "@/components/voice-animation"
import { TypewriterText } from "@/components/typewriter-text"
import { useAuthStore, useVoiceStore } from "@/lib/store"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { Play, Pause, Square, MessageSquare, X } from "lucide-react"

export default function ConversationPage() {
  const router = useRouter()
  const { isAuthenticated, checkAuth } = useAuthStore()
  const { voiceState, messages, showFullTranscript, toggleTranscript, clearMessages } = useVoiceStore()
  const { isSupported, startListening, stopListening } = useSpeechRecognition()

  useEffect(() => {
    // Check authentication status on mount (unless bypassed for development)
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== 'true') {
      checkAuth()
    }
  }, [checkAuth])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== 'true' && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== 'true' && !isAuthenticated) {
    return null
  }

  const currentMessage = messages[messages.length - 1]
  const isUserSpeaking = voiceState.isListening
  const isAISpeaking = voiceState.isProcessing
  const isAITalking = voiceState.isSpeaking

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen pt-16">
        {/* Left Panel - Animation */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center"
          >
            <VoiceAnimation />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isUserSpeaking ? "Listening..." : isAISpeaking ? "Processing..." : isAITalking ? "Speaking..." : "Ready to Chat"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isUserSpeaking
                  ? "Speak clearly and naturally"
                  : isAISpeaking
                    ? "Generating response..."
                    : isAITalking
                      ? "AI is speaking..."
                      : "Click start to begin conversation"}
              </p>
            </motion.div>

            {/* Control Buttons - Centered and Accessible */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center items-center space-x-4 mt-8"
            >
              {!voiceState.isListening ? (
                <Button
                  onClick={startListening}
                  disabled={!isSupported}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button
                  onClick={stopListening}
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}

              <Button onClick={clearMessages} variant="outline" size="lg" className="bg-white dark:bg-gray-800">
                <Square className="w-5 h-5 mr-2" />
                Clear
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Panel - Transcript */}
        <div className="flex-1 p-8">
          <Card className="h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Live Transcript</h3>
                <Button onClick={toggleTranscript} variant="outline" size="sm" className="bg-white dark:bg-gray-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {showFullTranscript ? "Hide History" : "Show History"}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Current Live Text */}
                {voiceState.currentTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500"
                  >
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">You (speaking...)</div>
                    <div className="text-gray-900 dark:text-white">{voiceState.currentTranscript}</div>
                  </motion.div>
                )}

                {/* Current Message with Typewriter */}
                {currentMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      currentMessage.type === "user"
                        ? "bg-gray-50 dark:bg-gray-700 ml-8"
                        : "bg-purple-50 dark:bg-purple-900/20 mr-8 border-l-4 border-purple-500"
                    }`}
                  >
                    <div
                      className={`text-sm mb-1 ${
                        currentMessage.type === "user"
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {currentMessage.type === "user" ? "You" : "AI Assistant"}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {currentMessage.type === "ai" ? (
                        <TypewriterText text={currentMessage.content} />
                      ) : (
                        currentMessage.content
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Full Transcript History */}
                <AnimatePresence>
                  {showFullTranscript && messages.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Previous Messages</h4>
                      {messages.slice(0, -1).map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg text-sm ${
                            message.type === "user"
                              ? "bg-gray-100 dark:bg-gray-700 ml-8"
                              : "bg-purple-100 dark:bg-purple-900/20 mr-8"
                          }`}
                        >
                          <div
                            className={`text-xs mb-1 ${
                              message.type === "user"
                                ? "text-gray-500 dark:text-gray-400"
                                : "text-purple-500 dark:text-purple-400"
                            }`}
                          >
                            {message.type === "user" ? "You" : "AI"}
                          </div>
                          <div className="text-gray-800 dark:text-gray-200">{message.content}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col p-4">
        {/* Animation Section */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center">
            <VoiceAnimation />

            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isUserSpeaking ? "Listening..." : isAISpeaking ? "Processing..." : isAITalking ? "Speaking..." : "Ready to Chat"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isUserSpeaking
                  ? "Speak clearly and naturally"
                  : isAISpeaking
                    ? "Generating response..."
                    : isAITalking
                      ? "AI is speaking..."
                      : "Tap start to begin"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Live Text Display */}
        <AnimatePresence>
          {(voiceState.currentTranscript || currentMessage) && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="mb-6"
            >
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md">
                <CardContent className="p-4">
                  {voiceState.currentTranscript ? (
                    <div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">You (speaking...)</div>
                      <div className="text-gray-900 dark:text-white">{voiceState.currentTranscript}</div>
                    </div>
                  ) : (
                    currentMessage && (
                      <div>
                        <div
                          className={`text-sm mb-1 ${
                            currentMessage.type === "user"
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {currentMessage.type === "user" ? "You" : "AI Assistant"}
                        </div>
                        <div className="text-gray-900 dark:text-white">
                          {currentMessage.type === "ai" ? (
                            <TypewriterText text={currentMessage.content} />
                          ) : (
                            currentMessage.content
                          )}
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Buttons - Responsive Bottom Positioning */}
        <div className="flex justify-center items-center space-x-4 mt-auto pt-6 pb-6 px-4">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center space-x-4"
          >
          {!voiceState.isListening ? (
            <Button
              onClick={startListening}
              disabled={!isSupported}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 px-8 py-3 text-white font-semibold rounded-lg shadow-lg touch-manipulation min-h-[48px] min-w-[100px]"
            >
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 px-8 py-3 text-white font-semibold rounded-lg shadow-lg touch-manipulation min-h-[48px] min-w-[100px]"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}

          <Button 
            onClick={toggleTranscript} 
            variant="outline" 
            size="lg" 
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 px-4 py-3 rounded-lg shadow-lg touch-manipulation min-h-[48px] min-w-[48px]"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          </motion.div>
        </div>

        {/* Full Transcript Modal for Mobile */}
        <AnimatePresence>
          {showFullTranscript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end lg:hidden"
              onClick={toggleTranscript}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="w-full bg-white dark:bg-gray-800 rounded-t-xl max-h-[70vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation History</h3>
                  <Button onClick={toggleTranscript} variant="outline" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(70vh-80px)] space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.type === "user" ? "bg-gray-100 dark:bg-gray-700" : "bg-purple-100 dark:bg-purple-900/20"
                      }`}
                    >
                      <div
                        className={`text-xs mb-1 ${
                          message.type === "user"
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-purple-500 dark:text-purple-400"
                        }`}
                      >
                        {message.type === "user" ? "You" : "AI Assistant"}
                      </div>
                      <div className="text-gray-800 dark:text-gray-200 text-sm">{message.content}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Browser Support Warning */}
      {!isSupported && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96"
        >
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Browser not supported:</strong> Speech recognition requires a modern browser like Chrome, Edge,
                or Safari.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
