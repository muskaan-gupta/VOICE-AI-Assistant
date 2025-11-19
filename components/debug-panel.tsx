import React from 'react';
import { apiClient } from '@/lib/api-client';

export function DebugPanel({ messages, voiceState }: any) {
  const testBackend = async () => {
    try {
      console.log("Testing backend connection...");
      const response = await apiClient.processConversation("test message");
      console.log("✅ Backend test successful:", response);
      alert("Backend working! Check console for details.");
    } catch (error) {
      console.error("❌ Backend test failed:", error);
      alert("Backend test failed! Check console for details.");
    }
  };

  const testHealth = async () => {
    try {
      console.log("Testing backend health...");
      const response = await apiClient.healthCheck();
      console.log("✅ Health check successful:", response);
      alert("Backend healthy! Check console for details.");
    } catch (error) {
      console.error("❌ Health check failed:", error);
      alert("Backend health check failed! Check console for details.");
    }
  };

  return (
    <div className="fixed top-20 right-4 w-80 bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      
      <div className="mb-2">
        <strong>Voice State:</strong>
        <div className="text-sm">
          <div>Listening: {voiceState.isListening ? '✅' : '❌'}</div>
          <div>Processing: {voiceState.isProcessing ? '✅' : '❌'}</div>
          <div>Speaking: {voiceState.isSpeaking ? '🔊' : '🔇'}</div>
          <div>Current Transcript: "{voiceState.currentTranscript}"</div>
        </div>
      </div>
      
      <div className="mb-2">
        <strong>Messages ({messages.length}):</strong>
        <div className="max-h-40 overflow-y-auto text-sm">
          {messages.slice(-3).map((msg: any, idx: number) => (
            <div key={idx} className="border-b py-1">
              <div className="font-medium">{msg.type}:</div>
              <div className="truncate">{msg.content}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-2">
        <strong>Backend Status:</strong>
        <div className="text-sm">
          <div>API URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}</div>
        </div>
      </div>

      <div className="space-y-2">
        <button 
          onClick={testHealth}
          className="w-full px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Test Backend Health
        </button>
        <button 
          onClick={testBackend}
          className="w-full px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Test Backend API
        </button>
      </div>
    </div>
  );
}
