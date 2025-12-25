import { describe, it, expect } from 'vitest';
import {
  check,
  validate,
  isValid,
  getSuggestions,
} from '../quality';

describe('quality module', () => {
  describe('check', () => {
    it('should return valid for a good prompt', () => {
      const result = check('Act as a helpful assistant. Your task is to answer questions clearly and concisely.');
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0.5);
    });

    it('should return invalid for empty prompt', () => {
      const result = check('');
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.code === 'EMPTY')).toBe(true);
    });

    it('should return invalid for too short prompt', () => {
      const result = check('Hi');
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.code === 'TOO_SHORT')).toBe(true);
    });

    it('should detect gibberish', () => {
      const result = check('qwertyuiop asdfghjkl');
      expect(result.issues.some(i => i.code === 'GIBBERISH')).toBe(true);
    });

    it('should detect role pattern', () => {
      const result = check('Act as a developer. Help me write code.');
      expect(result.stats.hasRole).toBe(true);
    });

    it('should detect task pattern', () => {
      const result = check('You should analyze this data and provide insights.');
      expect(result.stats.hasTask).toBe(true);
    });

    it('should detect constraints', () => {
      const result = check('Do not use technical jargon. Always be concise.');
      expect(result.stats.hasConstraints).toBe(true);
    });

    it('should detect examples', () => {
      const result = check('For example, if the input is "hello", output "world".');
      expect(result.stats.hasExamples).toBe(true);
    });

    it('should count variables', () => {
      const result = check('Hello ${name}, your order ${orderId} is ready.');
      expect(result.stats.variableCount).toBe(2);
    });

    it('should detect unbalanced brackets', () => {
      const result = check('This has unbalanced {brackets');
      expect(result.issues.some(i => i.code === 'UNBALANCED_BRACKETS')).toBe(true);
    });

    it('should calculate character count', () => {
      const result = check('Hello World');
      expect(result.stats.characterCount).toBe(11);
    });

    it('should calculate word count', () => {
      const result = check('Hello World Foo Bar');
      expect(result.stats.wordCount).toBe(4);
    });
  });

  describe('validate', () => {
    it('should not throw for valid prompt', () => {
      expect(() => validate('Act as a helpful assistant. Your task is to help.')).not.toThrow();
    });

    it('should throw for invalid prompt', () => {
      expect(() => validate('')).toThrow('Invalid prompt');
    });

    it('should include error message in exception', () => {
      expect(() => validate('')).toThrow('empty');
    });
  });

  describe('isValid', () => {
    it('should return true for valid prompt', () => {
      expect(isValid('Act as a helpful assistant with clear instructions.')).toBe(true);
    });

    it('should return false for invalid prompt', () => {
      expect(isValid('')).toBe(false);
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions array', () => {
      const suggestions = getSuggestions('Hello World');
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should suggest adding role for prompts without role', () => {
      const suggestions = getSuggestions('Analyze this data and give me results. Be thorough.');
      expect(suggestions.some(s => s.toLowerCase().includes('role'))).toBe(true);
    });

    it('should suggest adding variables for longer prompts', () => {
      // Needs to be >30 words to trigger variable suggestion
      const longPrompt = 'Analyze this data and give me results. Be thorough in your analysis. Consider all aspects of the problem carefully. Provide detailed and comprehensive analysis of the situation. Make sure to include actionable recommendations for improvement. Include specific examples and case studies where relevant.';
      const suggestions = getSuggestions(longPrompt);
      expect(suggestions.some(s => s.toLowerCase().includes('variable'))).toBe(true);
    });
  });
});
