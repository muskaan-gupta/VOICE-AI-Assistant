import language_tool_python 
from langchain_core.tools import tool

@tool
def grammarCheckTool(string: str) -> str:
    """
    Check the grammar of a string using LanguageTool and return the corrected string.
    Args:
        string (str): The input string to check for grammar issues.
    Returns:
        str: The corrected string with grammar issues fixed.
    """
    correctionTool = language_tool_python.LanguageTool('en-US')
    original = string
    matches = correctionTool.check(original)
    corrected = language_tool_python.utils.correct(original, matches)
        
    return corrected if matches else ""