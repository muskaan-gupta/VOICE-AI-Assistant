@echo off
echo Setting up Voice Assistant Backend...

echo Creating Python virtual environment...
python -m venv backend\venv

echo Activating virtual environment...
call backend\venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r backend\requirements.txt

if not exist backend\.env (
    echo Creating .env file from example...
    copy backend\.env.example backend\.env
    echo Please update backend\.env with your API keys
)

echo Backend setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your GROQ_API_KEY
echo 2. Run 'npm run dev:backend' to start the Python server
echo 3. Run 'npm run dev' to start the Next.js frontend

pause
