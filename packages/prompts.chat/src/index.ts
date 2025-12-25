/**
 * prompts.chat - Developer toolkit for AI prompts
 * 
 * @example
 * ```ts
 * import { variables, similarity, builder, quality } from 'prompts.chat';
 * 
 * // Detect and normalize variables
 * const vars = variables.detect("Hello {{name}}, you are [ROLE]");
 * const normalized = variables.normalize("Hello {{name}}");
 * // → "Hello ${name}"
 * 
 * // Check similarity
 * const score = similarity.calculate(prompt1, prompt2);
 * const isDupe = similarity.isDuplicate(prompt1, prompt2);
 * 
 * // Build structured prompts
 * const prompt = builder()
 *   .role("Senior Developer")
 *   .task("Review code")
 *   .build();
 * 
 * // Check quality locally
 * const result = quality.check("Act as a developer...");
 * 
 * ```
 */

// Module exports
export * as variables from './variables';
export * as similarity from './similarity';
export * as quality from './quality';
export * as parser from './parser';

// Builder exports (special handling for fluent API)
export { 
  builder, 
  fromPrompt, 
  templates,
  PromptBuilder,
  video,
  audio,
  image,
  chat,
  chatPresets,
  VideoPromptBuilder,
  AudioPromptBuilder,
  ImagePromptBuilder,
  ChatPromptBuilder,
  type BuiltPrompt,
  type PromptVariable,
  type BuiltVideoPrompt,
  type BuiltAudioPrompt,
  type BuiltImagePrompt,
  type BuiltChatPrompt,
} from './builder';

// Variable utilities
export { 
  detectVariables, 
  convertToSupportedFormat, 
  convertAllVariables,
  extractVariables,
  compile,
  normalize as normalizeVariables,
  detect as detectVars,
  type DetectedVariable,
  type VariablePattern,
} from './variables';

// Similarity utilities
export { 
  calculateSimilarity, 
  isSimilarContent, 
  normalizeContent,
  getContentFingerprint,
  findDuplicates,
  deduplicate,
} from './similarity';

// Quality utilities
export {
  check as checkQuality,
  validate as validatePrompt,
  isValid as isValidPrompt,
  getSuggestions,
  type QualityResult,
  type QualityIssue,
} from './quality';

// Parser utilities
export {
  parse as parsePrompt,
  toYaml,
  toJson,
  getSystemPrompt,
  interpolate,
  type ParsedPrompt,
  type PromptMessage,
} from './parser';
