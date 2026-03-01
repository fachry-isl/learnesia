# utils/llm_parser.py

def parse_llm_content(response) -> str:
    """
    Normalize LLM response content to plain string.
    Handles differences between Gemini model versions:
    - Gemini 2.5 Flash: response.content is a string
    - Gemini 3.0 Flash Preview: response.content is a list of content blocks
    """
    content = response.content

    # Gemini 2.5 Flash — already a string
    if isinstance(content, str):
        return content

    # Gemini 3.0 Flash Preview — list of content blocks
    if isinstance(content, list):
        return "\n".join(
            block.get("text", "") if isinstance(block, dict) else getattr(block, "text", "")
            for block in content
            if (isinstance(block, dict) and block.get("type") == "text")
            or (hasattr(block, "type") and block.type == "text")
        )

    # Fallback — single object with .text attribute
    if hasattr(content, "text"):
        return content.text

    return str(content)
