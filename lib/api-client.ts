const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000')
  : 'http://localhost:5000';

export interface TranscribeResponse {
  text: string;
}

export interface ConversationResponse {
  response: string;
  input: string;
}

export interface GrammarCheckResponse {
  original: string;
  corrected: string;
  has_errors: boolean;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async transcribeAudio(audioFile: File): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${this.baseURL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    return response.json();
  }

  async processConversation(text: string): Promise<ConversationResponse> {
    const response = await fetch(`${this.baseURL}/api/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Conversation processing failed: ${response.statusText}`);
    }

    return response.json();
  }

  async textToSpeech(text: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Text-to-speech failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async checkGrammar(text: string): Promise<GrammarCheckResponse> {
    const response = await fetch(`${this.baseURL}/api/grammar-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Grammar check failed: ${response.statusText}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseURL}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new APIClient();
