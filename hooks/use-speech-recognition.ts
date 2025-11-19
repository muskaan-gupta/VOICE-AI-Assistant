"use client"

import { useEffect, useRef, useState } from "react"
import { useVoiceStore } from "@/lib/store"
import { apiClient } from "@/lib/api-client"

// Define types for Speech Recognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition?: {
      new (): SpeechRecognition
    }
  }
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { voiceState, setListening, setProcessing, setSpeaking, setCurrentTranscript, addMessage } = useVoiceStore()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition || navigator.mediaDevices) {
        setIsSupported(true)
        
        // Load voices for speech synthesis
        if ('speechSynthesis' in window) {
          const loadVoices = () => {
            speechSynthesis.getVoices()
          }
          
          // Load voices immediately if available
          loadVoices()
          
          // Also load when voices change (some browsers load asynchronously)
          speechSynthesis.addEventListener('voiceschanged', loadVoices)
        }
        
        // Initialize Web Speech API if available
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition()
          const recognition = recognitionRef.current
          recognition.continuous = false  // Changed to false for better control
          recognition.interimResults = true
          recognition.lang = "en-US"

          recognition.onstart = () => {
            console.log('Speech recognition started')
            setListening(true)
          }

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = ""
            let finalTranscript = ""

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript
              if (event.results[i].isFinal) {
                finalTranscript += transcript
              } else {
                interimTranscript += transcript
              }
            }
            
            // Update transcript immediately for responsiveness
            if (interimTranscript || finalTranscript) {
              setCurrentTranscript(interimTranscript || finalTranscript)
            }

            if (finalTranscript.trim()) {
              setCurrentTranscript("") // Clear the current transcript
              handleUserInput(finalTranscript.trim())
            }
          }

          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error)
            setListening(false)
          }

          recognition.onend = () => {
            console.log('Speech recognition ended')
            setListening(false)
            setCurrentTranscript("")
          }
        }
      }
    }
  }, [setListening, setCurrentTranscript, addMessage])

  const handleUserInput = async (text: string) => {
    if (!text.trim()) return

    // Add user message
    addMessage({
      type: "user",
      content: text,
    })

    try {
      setProcessing(true)
      
      // Process conversation with backend
      const response = await apiClient.processConversation(text)
      
      // Add AI response
      addMessage({
        type: "ai",
        content: response.response,
      })

      // Enable text-to-speech for AI response (always enabled)
      await playAIResponse(response.response)
      
    } catch (error) {
      console.error("Error processing conversation:", error)
      addMessage({
        type: "ai",
        content: "Sorry, I encountered an error processing your request. Please try again.",
      })
    } finally {
      setProcessing(false)
    }
  }

  const playAIResponse = async (text: string) => {
    try {
      setSpeaking(true) // Set speaking state
      
      // Option 1: Use backend text-to-speech
      try {
        const audioBlob = await apiClient.textToSpeech(text)
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setSpeaking(false)
        }
        
        audio.onerror = () => {
          playBrowserTTS(text)
        }
        
        await audio.play()
        
      } catch (backendError) {
        playBrowserTTS(text)
      }
      
    } catch (error) {
      console.error("Error playing AI response:", error)
      setSpeaking(false)
    }
  }

  const playBrowserTTS = (text: string) => {
    // Fallback to browser's built-in speech synthesis
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      // Get available voices and prefer a female voice
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Zira') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Google UK English Female')
      )
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      utterance.onstart = () => {
        setSpeaking(true)
      }
      utterance.onend = () => {
        setSpeaking(false)
      }
      utterance.onerror = (e) => {
        console.error("Browser TTS error:", e)
        setSpeaking(false)
      }
      
      speechSynthesis.speak(utterance)
    } else {
      setSpeaking(false)
    }
  }

  const startListening = async () => {
    // Prevent multiple starts
    if (voiceState.isListening) {
      console.log('Already listening, ignoring start request')
      return
    }

    try {
      // Try Web Speech API first (for real-time recognition)
      if (recognitionRef.current) {
        console.log('Starting Web Speech API recognition')
        recognitionRef.current.start()
        return
      }

      // Fallback to MediaRecorder for backend transcription
      console.log('Starting MediaRecorder fallback')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' })
        
        try {
          setProcessing(true)
          const transcription = await apiClient.transcribeAudio(audioFile)
          
          if (transcription.text.trim()) {
            handleUserInput(transcription.text.trim())
          }
        } catch (error) {
          console.error("Error transcribing audio:", error)
          addMessage({
            type: "ai",
            content: "Sorry, I couldn't understand what you said. Please try again.",
          })
        } finally {
          setProcessing(false)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      setListening(true)
      mediaRecorder.start()
      
    } catch (error) {
      console.error("Error starting audio recording:", error)
      setListening(false)
      addMessage({
        type: "ai",
        content: "Error accessing microphone. Please check your permissions.",
      })
    }
  }

  const stopListening = () => {
    console.log('Stopping listening...')
    
    if (recognitionRef.current && voiceState.isListening) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop()
      } catch (error) {
        console.error('Error stopping media recorder:', error)
      }
    }
    
    setListening(false)
    setCurrentTranscript("")
  }

  return {
    isSupported,
    startListening,
    stopListening,
  }
}
