from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import tempfile
from grammar_checker import grammarCheckTool
from langchain_core.prompts import ChatPromptTemplate
from textToSpeech import generate_speech_file
from speechToText import transcribe_audio_file, initializeModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = Flask(__name__)
CORS(app, origins=[frontend])  # Allow Next.js frontend

# Initialize models
groq_llm = ChatGroq(model="llama3-70b-8192",
                    api_key=os.getenv("GROQ_API_KEY"))

# Define the system prompt
system_prompt = """You are a helpful assistant. 
You will be given a sentence and you need to check for grammatical errors using the grammar checker tool. 
If there are any errors, provide suggestions for correction. 
If there are no errors, simply continue the conversation and don't talk about grammar at all.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}")
])

# Bind tools and system prompt
llm_with_tools = groq_llm.bind_tools([grammarCheckTool]).bind(system_message=system_prompt)
chain = prompt | groq_llm 

# Initialize voice model
voiceModel = initializeModel()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Voice Assistant API is running"})

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio to text"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No audio file selected"}), 400
        
        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            audio_file.save(tmp_file.name)
            
            # Transcribe audio
            text = transcribe_audio_file(voiceModel, tmp_file.name)
            os.unlink(tmp_file.name)  # Clean up temp file
            
            return jsonify({"text": text})
    
    except Exception as e:
        logger.error(f"Error in transcribe_audio: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/conversation', methods=['POST'])
def process_conversation():
    """Process conversation with LLM"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        input_text = data['text']
        
        # Process with LLM
        response = chain.invoke({"input": input_text})
        
        return jsonify({
            "response": response.content,
            "input": input_text
        })
    
    except Exception as e:
        logger.error(f"Error in process_conversation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/speak', methods=['POST'])
def text_to_speech():
    """Convert text to speech"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        
        # Generate speech file
        audio_file_path = generate_speech_file(text)
        
        return send_file(audio_file_path, 
                        mimetype='audio/wav',
                        as_attachment=True,
                        download_name='speech.wav')
    
    except Exception as e:
        logger.error(f"Error in text_to_speech: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/grammar-check', methods=['POST'])
def check_grammar():
    """Check grammar of provided text"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        corrected_text = grammarCheckTool.invoke({"string": text})
        
        return jsonify({
            "original": text,
            "corrected": corrected_text,
            "has_errors": corrected_text != ""
        })
    
    except Exception as e:
        logger.error(f"Error in check_grammar: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
