import whisper
# import pyaudio  # Removed for cloud deployment
import wave
import tempfile

def initializeModel():
    model = whisper.load_model("base", device="cpu")  # Options: tiny, base, small, medium, large
    return model

def transcribe_audio_file(model, audio_file_path):
    """Transcribe audio file to text"""
    try:
        result = model.transcribe(audio_file_path, language="en", fp16=False)
        return result["text"]
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return ""

# Note: record_and_transcribe function removed for cloud deployment
# The app uses browser-based recording instead of server-side recording
# 
# def record_and_transcribe(model):
#     """This function requires PyAudio which doesn't work in cloud environments"""
#     # Implementation removed for cloud compatibility
#     pass