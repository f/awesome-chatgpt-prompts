import { describe, it, expect } from 'vitest';
import {
  normalizeContent,
  calculateSimilarity,
  calculate,
  isSimilarContent,
  isDuplicate,
  getContentFingerprint,
  findDuplicates,
  deduplicate,
} from '../similarity';

describe('similarity module', () => {
  describe('normalizeContent', () => {
    it('should convert to lowercase', () => {
      expect(normalizeContent('Hello World')).toBe('hello world');
    });

    it('should remove variables', () => {
      expect(normalizeContent('Hello ${name}')).toBe('hello');
    });

    it('should remove bracket placeholders', () => {
      expect(normalizeContent('Hello [NAME]')).toBe('hello');
    });

    it('should remove angle bracket placeholders', () => {
      expect(normalizeContent('Hello <name>')).toBe('hello');
    });

    it('should remove punctuation', () => {
      expect(normalizeContent('Hello, World!')).toBe('hello world');
    });

    it('should normalize whitespace', () => {
      expect(normalizeContent('Hello    World')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(normalizeContent('')).toBe('');
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(calculateSimilarity('Hello World', 'Hello World')).toBe(1);
    });

    it('should return 1 for strings identical after normalization', () => {
      expect(calculateSimilarity('Hello World!', 'hello world')).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      const similarity = calculateSimilarity('abc', 'xyz');
      expect(similarity).toBeLessThan(0.2);
    });

    it('should return high similarity for similar strings', () => {
      const similarity = calculateSimilarity(
        'You are a helpful assistant',
        'You are a helpful AI assistant'
      );
      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should handle empty strings', () => {
      expect(calculateSimilarity('', '')).toBe(1);
      expect(calculateSimilarity('hello', '')).toBe(0);
      expect(calculateSimilarity('', 'hello')).toBe(0);
    });

    it('calculate alias should work the same', () => {
      expect(calculate('a', 'b')).toBe(calculateSimilarity('a', 'b'));
    });
  });

  describe('isSimilarContent', () => {
    it('should return true for similar content above threshold', () => {
      expect(isSimilarContent('Hello World', 'Hello World!')).toBe(true);
    });

    it('should return false for different content', () => {
      expect(isSimilarContent('Hello', 'Goodbye')).toBe(false);
    });

    it('should respect custom threshold', () => {
      const content1 = 'Hello World';
      const content2 = 'Hello Earth';
      // These are somewhat similar but not 90% similar
      expect(isSimilarContent(content1, content2, 0.9)).toBe(false);
      expect(isSimilarContent(content1, content2, 0.3)).toBe(true);
    });

    it('isDuplicate alias should work the same', () => {
      expect(isDuplicate('a', 'a')).toBe(isSimilarContent('a', 'a'));
    });
  });

  describe('getContentFingerprint', () => {
    it('should return normalized content', () => {
      const fingerprint = getContentFingerprint('Hello World!');
      expect(fingerprint).toBe('hello world');
    });

    it('should truncate long content', () => {
      const longContent = 'a'.repeat(1000);
      const fingerprint = getContentFingerprint(longContent);
      expect(fingerprint.length).toBeLessThanOrEqual(500);
    });
  });

  describe('findDuplicates', () => {
    it('should find groups of similar prompts', () => {
      const prompts = [
        { content: 'Hello World', id: 1 },
        { content: 'Hello World!', id: 2 },
        { content: 'Goodbye', id: 3 },
        { content: 'Goodbye!', id: 4 },
      ];
      
      const groups = findDuplicates(prompts);
      expect(groups).toHaveLength(2);
    });

    it('should return empty array when no duplicates', () => {
      const prompts = [
        { content: 'Hello', id: 1 },
        { content: 'World', id: 2 },
        { content: 'Foo', id: 3 },
      ];
      
      const groups = findDuplicates(prompts);
      expect(groups).toHaveLength(0);
    });

    it('should respect custom threshold', () => {
      const prompts = [
        { content: 'Hello World', id: 1 },
        { content: 'Hello Earth', id: 2 },
      ];
      
      // With high threshold, should not be duplicates
      expect(findDuplicates(prompts, 0.95)).toHaveLength(0);
      // With low threshold, should be duplicates
      expect(findDuplicates(prompts, 0.3)).toHaveLength(1);
    });
  });

  describe('deduplicate', () => {
    it('should remove duplicate prompts keeping first occurrence', () => {
      const prompts = [
        { content: 'Hello World', id: 1 },
        { content: 'Hello World!', id: 2 },
        { content: 'Goodbye', id: 3 },
      ];
      
      const deduped = deduplicate(prompts);
      expect(deduped).toHaveLength(2);
      expect(deduped[0].id).toBe(1);
      expect(deduped[1].id).toBe(3);
    });

    it('should keep all unique prompts', () => {
      const prompts = [
        { content: 'Hello', id: 1 },
        { content: 'World', id: 2 },
        { content: 'Foo', id: 3 },
      ];
      
      const deduped = deduplicate(prompts);
      expect(deduped).toHaveLength(3);
    });

    it('should handle empty array', () => {
      expect(deduplicate([])).toEqual([]);
    });
  });
});
