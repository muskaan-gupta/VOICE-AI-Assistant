import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authApiClient, AuthResponse } from "./auth-client"

interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface VoiceState {
  isListening: boolean
  isProcessing: boolean
  isSpeaking: boolean
  currentTranscript: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkAuth: () => Promise<void>
}

interface VoiceStore {
  voiceState: VoiceState
  messages: Message[]
  showFullTranscript: boolean
  setListening: (listening: boolean) => void
  setProcessing: (processing: boolean) => void
  setSpeaking: (speaking: boolean) => void
  setCurrentTranscript: (transcript: string) => void
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  toggleTranscript: () => void
  clearMessages: () => void
}

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApiClient.login({ email, password })
          
          if (response.success && response.user) {
            set({ 
              user: response.user, 
              isAuthenticated: true,
              isLoading: false 
            })
            return { success: true }
          } else {
            set({ isLoading: false })
            return { 
              success: false, 
              error: response.error || 'Login failed' 
            }
          }
        } catch (error: any) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.message || 'Login failed' 
          }
        }
      },
      
      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApiClient.register({ name, email, password })
          
          if (response.success && response.user) {
            set({ 
              user: response.user, 
              isAuthenticated: true,
              isLoading: false 
            })
            return { success: true }
          } else {
            set({ isLoading: false })
            return { 
              success: false, 
              error: response.error || 'Registration failed' 
            }
          }
        } catch (error: any) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.message || 'Registration failed' 
          }
        }
      },
      
      logout: () => {
        authApiClient.logout()
        set({ user: null, isAuthenticated: false })
      },
      
      checkAuth: async () => {
        if (authApiClient.isAuthenticated()) {
          set({ isLoading: true })
          try {
            const response = await authApiClient.getCurrentUser()
            
            if (response.success && response.user) {
              set({ 
                user: response.user, 
                isAuthenticated: true,
                isLoading: false 
              })
            } else {
              set({ 
                user: null, 
                isAuthenticated: false,
                isLoading: false 
              })
            }
          } catch (error) {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            })
          }
        }
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user 
      })
    },
  ),
)

// Voice Store
export const useVoiceStore = create<VoiceStore>((set, get) => ({
  voiceState: {
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    currentTranscript: "",
  },
  messages: [],
  showFullTranscript: false,
  setListening: (listening) =>
    set((state) => ({
      voiceState: { ...state.voiceState, isListening: listening },
    })),
  setProcessing: (processing) =>
    set((state) => ({
      voiceState: { ...state.voiceState, isProcessing: processing },
    })),
  setSpeaking: (speaking) =>
    set((state) => ({
      voiceState: { ...state.voiceState, isSpeaking: speaking },
    })),
  setCurrentTranscript: (transcript) =>
    set((state) => ({
      voiceState: { ...state.voiceState, currentTranscript: transcript },
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
      ],
    })),
  toggleTranscript: () => set((state) => ({ showFullTranscript: !state.showFullTranscript })),
  clearMessages: () => set({ messages: [] }),
}))

// Theme Store
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setTheme: (isDark) => set({ isDark }),
    }),
    {
      name: "theme-storage",
    },
  ),
)
