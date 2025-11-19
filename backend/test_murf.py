#!/usr/bin/env python3
"""
Test script for Murf TTS integration
Run this to test if Murf API is working correctly
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from textToSpeech import generate_speech_file

def test_murf_tts():
    """Test Murf text-to-speech functionality"""
    print("Testing Murf TTS integration...")
    
    test_text = "Hello! This is a test of the Murf text-to-speech integration."
    
    try:
        audio_file = generate_speech_file(test_text)
        
        if audio_file and os.path.exists(audio_file):
            file_size = os.path.getsize(audio_file)
            print(f"✅ Success! Generated audio file: {audio_file}")
            print(f"📁 File size: {file_size} bytes")
            print(f"📝 Text: {test_text}")
            return True
        else:
            print("❌ Failed to generate audio file")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Murf TTS: {e}")
        return False

if __name__ == "__main__":
    success = test_murf_tts()
    if success:
        print("\n🎉 Murf TTS integration is working!")
    else:
        print("\n💥 Murf TTS integration failed. Check your API key and dependencies.")
