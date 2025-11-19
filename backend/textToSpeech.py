import tempfile
import requests
import os
import threading
import time
from murf import Murf

# Initialize Murf client
MURF_API_KEY = os.getenv("MURF_API_KEY")
client = Murf(api_key=MURF_API_KEY)

# Store temp files for cleanup
temp_files = []

def cleanup_temp_files():
    """Clean up old temporary files"""
    global temp_files
    current_time = time.time()
    files_to_remove = []
    
    for file_info in temp_files[:]:  # Create a copy to iterate over
        file_path, creation_time = file_info
        # Remove files older than 5 minutes
        if current_time - creation_time > 300:  # 5 minutes
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                files_to_remove.append(file_info)
            except Exception as e:
                print(f"Error removing temp file {file_path}: {e}")
    
    # Remove cleaned files from the list
    for file_info in files_to_remove:
        temp_files.remove(file_info)

def schedule_cleanup(file_path):
    """Schedule cleanup of a temp file after 5 minutes"""
    temp_files.append((file_path, time.time()))
    
    def delayed_cleanup():
        time.sleep(300)  # Wait 5 minutes
        cleanup_temp_files()
    
    # Run cleanup in background thread
    threading.Thread(target=delayed_cleanup, daemon=True).start()

def speak(text):
    """Generate speech using Murf API and play it"""
    try:
        # Generate audio using Murf
        audio = client.text_to_speech.generate(
            text=text,
            voice_id="en-US-natalie",
        )

        # Download to a temp file safely (Windows-friendly)
        response = requests.get(audio.audio_file)
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        tmp_file.write(response.content)
        tmp_file.close()

        try:
            # For server use, we don't need to play the audio here
            # Just return the file path for the API to serve
            return tmp_file.name
        except Exception as e:
            print(f"Error with audio file: {e}")
            return None
        finally:
            # Clean up temp file after a delay (optional)
            pass
            
    except Exception as e:
        print(f"Error generating speech with Murf: {e}")
        return None

def generate_speech_file(text):
    """Generate speech file from text using Murf API and return file path"""
    try:
        # Generate audio using Murf
        audio = client.text_to_speech.generate(
            text=text,
            voice_id="en-US-natalie",
        )

        # Download to a temp file safely (Windows-friendly)
        response = requests.get(audio.audio_file)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file.write(response.content)
        temp_file.close()
        
        # Schedule cleanup of temp file
        schedule_cleanup(temp_file.name)
        
        return temp_file.name
        
    except Exception as e:
        print(f"Error generating speech file with Murf: {e}")
        return None
