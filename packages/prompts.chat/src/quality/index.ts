/**
 * Prompt Quality Checker - Local validation for prompt quality
 * 
 * @example
 * ```ts
 * import { quality } from 'prompts.chat';
 * 
 * const result = quality.check("Act as a developer...");
 * console.log(result.score); // 0.85
 * console.log(result.issues); // []
 * ```
 */

export interface QualityIssue {
  type: 'error' | 'warning' | 'suggestion';
  code: string;
  message: string;
  position?: { start: number; end: number };
}

export interface QualityResult {
  valid: boolean;
  score: number; // 0-1
  issues: QualityIssue[];
  stats: {
    characterCount: number;
    wordCount: number;
    sentenceCount: number;
    variableCount: number;
    hasRole: boolean;
    hasTask: boolean;
    hasConstraints: boolean;
    hasExamples: boolean;
  };
}

// Minimum thresholds
const MIN_CHAR_COUNT = 20;
const MIN_WORD_COUNT = 5;
const OPTIMAL_MIN_WORDS = 20;
const OPTIMAL_MAX_WORDS = 2000;

/**
 * Check if text looks like gibberish
 */
function isGibberish(text: string): boolean {
  // Check for repeated characters
  if (/(.)\1{4,}/.test(text)) return true;
  
  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', 'qwertz', 'azerty'];
  const lower = text.toLowerCase();
  if (keyboardPatterns.some(p => lower.includes(p))) return true;
  
  // Check consonant/vowel ratio (gibberish often has unusual ratios)
  const vowels = (text.match(/[aeiouAEIOU]/g) || []).length;
  const consonants = (text.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
  
  if (consonants > 0 && vowels / consonants < 0.1) return true;
  
  return false;
}

/**
 * Detect common prompt patterns
 */
function detectPatterns(text: string): {
  hasRole: boolean;
  hasTask: boolean;
  hasConstraints: boolean;
  hasExamples: boolean;
} {
  const lower = text.toLowerCase();
  
  return {
    hasRole: /\b(act as|you are|imagine you|pretend to be|role:|persona:)\b/i.test(text),
    hasTask: /\b(your task|you (will|should|must)|please|help me|i need|i want you to)\b/i.test(text),
    hasConstraints: /\b(do not|don't|never|always|must|should not|avoid|only|limit)\b/i.test(text) ||
                    /\b(rule|constraint|requirement|guideline)\b/i.test(lower),
    hasExamples: /\b(example|for instance|such as|e\.g\.|like this)\b/i.test(lower) ||
                 /```[\s\S]*```/.test(text),
  };
}

/**
 * Count variables in the prompt
 */
function countVariables(text: string): number {
  // Match various variable formats
  const patterns = [
    /\$\{[^}]+\}/g,           // ${var}
    /\{\{[^}]+\}\}/g,         // {{var}}
    /\[\[[^\]]+\]\]/g,        // [[var]]
    /\[[A-Z][A-Z0-9_\s]*\]/g, // [VAR]
  ];
  
  let count = 0;
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }
  
  return count;
}

/**
 * Calculate quality score based on various factors
 */
function calculateScore(
  stats: QualityResult['stats'],
  issues: QualityIssue[]
): number {
  let score = 1.0;
  
  // Deduct for errors
  const errors = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  
  score -= errors * 0.2;
  score -= warnings * 0.05;
  
  // Bonus for good structure
  if (stats.hasRole) score += 0.05;
  if (stats.hasTask) score += 0.05;
  if (stats.hasConstraints) score += 0.03;
  if (stats.hasExamples) score += 0.05;
  
  // Penalty for being too short
  if (stats.wordCount < OPTIMAL_MIN_WORDS) {
    score -= 0.1 * (1 - stats.wordCount / OPTIMAL_MIN_WORDS);
  }
  
  // Slight penalty for being very long
  if (stats.wordCount > OPTIMAL_MAX_WORDS) {
    score -= 0.05;
  }
  
  // Bonus for having variables (indicates reusability)
  if (stats.variableCount > 0) {
    score += 0.05;
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Check prompt quality locally (no API needed)
 */
export function check(prompt: string): QualityResult {
  const issues: QualityIssue[] = [];
  const trimmed = prompt.trim();
  
  // Basic stats
  const characterCount = trimmed.length;
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const sentenceCount = (trimmed.match(/[.!?]+/g) || []).length || 1;
  const variableCount = countVariables(trimmed);
  const patterns = detectPatterns(trimmed);
  
  // Check for empty or too short
  if (characterCount === 0) {
    issues.push({
      type: 'error',
      code: 'EMPTY',
      message: 'Prompt is empty',
    });
  } else if (characterCount < MIN_CHAR_COUNT) {
    issues.push({
      type: 'error',
      code: 'TOO_SHORT',
      message: `Prompt is too short (${characterCount} chars, minimum ${MIN_CHAR_COUNT})`,
    });
  }
  
  if (wordCount > 0 && wordCount < MIN_WORD_COUNT) {
    issues.push({
      type: 'warning',
      code: 'FEW_WORDS',
      message: `Prompt has very few words (${wordCount} words, recommended ${OPTIMAL_MIN_WORDS}+)`,
    });
  }
  
  // Check for gibberish
  if (isGibberish(trimmed)) {
    issues.push({
      type: 'error',
      code: 'GIBBERISH',
      message: 'Prompt appears to contain gibberish or random characters',
    });
  }
  
  // Check for common issues
  if (!patterns.hasTask && !patterns.hasRole) {
    issues.push({
      type: 'suggestion',
      code: 'NO_CLEAR_INSTRUCTION',
      message: 'Consider adding a clear task or role definition',
    });
  }
  
  // Check for unbalanced brackets/quotes
  const brackets = [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
  ];
  
  for (const { open, close } of brackets) {
    const openCount = (trimmed.match(new RegExp(`\\${open}`, 'g')) || []).length;
    const closeCount = (trimmed.match(new RegExp(`\\${close}`, 'g')) || []).length;
    
    if (openCount !== closeCount) {
      issues.push({
        type: 'warning',
        code: 'UNBALANCED_BRACKETS',
        message: `Unbalanced ${open}${close} brackets (${openCount} open, ${closeCount} close)`,
      });
    }
  }
  
  // Check for very long lines (readability)
  const lines = trimmed.split('\n');
  const longLines = lines.filter(l => l.length > 500);
  if (longLines.length > 0) {
    issues.push({
      type: 'suggestion',
      code: 'LONG_LINES',
      message: 'Some lines are very long. Consider breaking them up for readability.',
    });
  }
  
  const stats = {
    characterCount,
    wordCount,
    sentenceCount,
    variableCount,
    ...patterns,
  };
  
  const score = calculateScore(stats, issues);
  const hasErrors = issues.some(i => i.type === 'error');
  
  return {
    valid: !hasErrors,
    score,
    issues,
    stats,
  };
}

/**
 * Validate a prompt and throw if invalid
 */
export function validate(prompt: string): void {
  const result = check(prompt);
  
  if (!result.valid) {
    const errors = result.issues
      .filter(i => i.type === 'error')
      .map(i => i.message)
      .join('; ');
    
    throw new Error(`Invalid prompt: ${errors}`);
  }
}

/**
 * Check if a prompt is valid
 */
export function isValid(prompt: string): boolean {
  return check(prompt).valid;
}

/**
 * Get suggestions for improving a prompt
 */
export function getSuggestions(prompt: string): string[] {
  const result = check(prompt);
  const suggestions: string[] = [];
  
  // From issues
  suggestions.push(
    ...result.issues
      .filter(i => i.type === 'suggestion' || i.type === 'warning')
      .map(i => i.message)
  );
  
  // Additional suggestions based on stats
  if (!result.stats.hasRole) {
    suggestions.push('Add a role definition (e.g., "Act as a...")');
  }
  
  if (!result.stats.hasConstraints && result.stats.wordCount > 50) {
    suggestions.push('Consider adding constraints or rules for better control');
  }
  
  if (!result.stats.hasExamples && result.stats.wordCount > 100) {
    suggestions.push('Adding examples can improve output quality');
  }
  
  if (result.stats.variableCount === 0 && result.stats.wordCount > 30) {
    suggestions.push('Consider adding variables (${var}) to make the prompt reusable');
  }
  
  return suggestions;
}
