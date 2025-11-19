#!/usr/bin/env python3
"""
Quick test script to verify backend functionality
"""
import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing imports...")
    from flask import Flask
    print("✓ Flask imported successfully")
    
    from flask_cors import CORS
    print("✓ Flask-CORS imported successfully")
    
    from langchain_groq import ChatGroq
    print("✓ LangChain Groq imported successfully")
    
    from dotenv import load_dotenv
    print("✓ python-dotenv imported successfully")
    
    import tempfile
    import logging
    print("✓ Standard libraries imported successfully")
    
    # Test custom modules
    from grammar_checker import grammarCheckTool
    print("✓ Grammar checker imported successfully")
    
    from textToSpeech import generate_speech_file
    print("✓ Text-to-speech imported successfully")
    
    from speechToText import transcribe_audio_file, initializeModel
    print("✓ Speech-to-text imported successfully")
    
    print("\n" + "="*50)
    print("✅ All imports successful!")
    print("✅ Backend should work correctly!")
    print("="*50)
    
    # Test environment loading
    load_dotenv()
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        print(f"✓ GROQ_API_KEY found (length: {len(groq_key)})")
    else:
        print("⚠️  GROQ_API_KEY not found in environment")
    
    print("\nTo start the backend, run:")
    print("python app.py")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\nTo fix this, run:")
    print("pip install -r requirements.txt")
    
except Exception as e:
    print(f"❌ Unexpected error: {e}")
