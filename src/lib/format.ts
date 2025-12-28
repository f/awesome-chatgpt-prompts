/**
 * Prettify JSON content with proper indentation
 * Returns the original content if parsing fails
 */
export function prettifyJson(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
}

/**
 * Check if content is valid JSON
 */
export function isValidJson(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects if text content looks like JSON
 * More lenient than isValidJson - catches JSON-like content even if not perfectly valid
 */
export function looksLikeJson(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  
  // Check if it starts and ends with JSON object/array delimiters
  const startsWithJsonDelimiter = trimmed.startsWith("{") || trimmed.startsWith("[");
  const endsWithJsonDelimiter = trimmed.endsWith("}") || trimmed.endsWith("]");
  
  if (startsWithJsonDelimiter && endsWithJsonDelimiter) {
    // Additional check: try to parse it as JSON
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      // Even if it doesn't parse perfectly, if it has JSON-like structure, warn the user
      // Look for patterns like "key": value
      const hasJsonKeyPattern = /"[^"]+"\s*:/g.test(trimmed);
      return hasJsonKeyPattern;
    }
  }
  
  // Check for multiline JSON-like content that might have text before/after
  const jsonObjectPattern = /^\s*\{[\s\S]*"[^"]+"\s*:[\s\S]*\}\s*$/;
  const jsonArrayPattern = /^\s*\[[\s\S]*\{[\s\S]*"[^"]+"\s*:[\s\S]*\}[\s\S]*\]\s*$/;
  
  return jsonObjectPattern.test(trimmed) || jsonArrayPattern.test(trimmed);
}