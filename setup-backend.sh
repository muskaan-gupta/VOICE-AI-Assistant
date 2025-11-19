#!/bin/bash

# Backend setup script
echo "Setting up Voice Assistant Backend..."

# Create virtual environment
echo "Creating Python virtual environment..."
python -m venv backend/venv

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source backend/venv/Scripts/activate
else
    # Unix/Linux/macOS
    source backend/venv/bin/activate
fi

# Install dependencies
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating .env file from example..."
    cp backend/.env.example backend/.env
    echo "Please update backend/.env with your API keys"
fi

echo "Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your GROQ_API_KEY"
echo "2. Run 'npm run dev:backend' to start the Python server"
echo "3. Run 'npm run dev' to start the Next.js frontend"
