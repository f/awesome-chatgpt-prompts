import { describe, it, expect } from 'vitest';
import {
  parse,
  toYaml,
  toJson,
  getSystemPrompt,
  interpolate,
} from '../parser';

describe('parser module', () => {
  describe('parse', () => {
    it('should parse plain text as system message', () => {
      const result = parse('You are a helpful assistant.');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[0].content).toBe('You are a helpful assistant.');
    });

    it('should parse JSON format', () => {
      const json = JSON.stringify({
        name: 'Test Prompt',
        messages: [{ role: 'system', content: 'Hello' }],
      });
      const result = parse(json);
      expect(result.name).toBe('Test Prompt');
      expect(result.messages[0].content).toBe('Hello');
    });

    it('should auto-detect JSON format', () => {
      const result = parse('{"messages": [{"role": "system", "content": "Hello"}]}');
      expect(result.messages[0].content).toBe('Hello');
    });

    it('should parse YAML format', () => {
      const yaml = `name: Test
messages:
  - role: system
    content: Hello`;
      const result = parse(yaml, 'yaml');
      expect(result.name).toBe('Test');
      expect(result.messages).toHaveLength(1);
    });

    it('should parse Markdown with frontmatter', () => {
      const md = `---
name: Test Prompt
---
You are a helpful assistant.`;
      const result = parse(md, 'markdown');
      expect(result.name).toBe('Test Prompt');
      expect(result.messages[0].content).toBe('You are a helpful assistant.');
    });

    it('should handle content field as system message', () => {
      const result = parse('{"content": "Hello World"}', 'json');
      expect(result.messages[0].content).toBe('Hello World');
    });

    it('should handle prompt field as system message', () => {
      const result = parse('{"prompt": "Hello World"}', 'json');
      expect(result.messages[0].content).toBe('Hello World');
    });

    it('should parse model parameters', () => {
      const json = JSON.stringify({
        model: 'gpt-4',
        modelParameters: { temperature: 0.7 },
        messages: [{ role: 'system', content: 'Test' }],
      });
      const result = parse(json);
      expect(result.model).toBe('gpt-4');
      expect(result.modelParameters?.temperature).toBe(0.7);
    });
  });

  describe('toYaml', () => {
    it('should serialize prompt to YAML', () => {
      const prompt = {
        name: 'Test',
        messages: [{ role: 'system' as const, content: 'Hello' }],
      };
      const yaml = toYaml(prompt);
      expect(yaml).toContain('name: Test');
      expect(yaml).toContain('role: system');
    });

    it('should handle multiline content', () => {
      const prompt = {
        messages: [{ role: 'system' as const, content: 'Line 1\nLine 2' }],
      };
      const yaml = toYaml(prompt);
      expect(yaml).toContain('content: |');
    });

    it('should include description if present', () => {
      const prompt = {
        name: 'Test',
        description: 'A test prompt',
        messages: [{ role: 'system' as const, content: 'Hello' }],
      };
      const yaml = toYaml(prompt);
      expect(yaml).toContain('description: A test prompt');
    });
  });

  describe('toJson', () => {
    it('should serialize prompt to JSON', () => {
      const prompt = {
        name: 'Test',
        messages: [{ role: 'system' as const, content: 'Hello' }],
      };
      const json = toJson(prompt);
      expect(() => JSON.parse(json)).not.toThrow();
      expect(JSON.parse(json).name).toBe('Test');
    });

    it('should support non-pretty output', () => {
      const prompt = {
        name: 'Test',
        messages: [{ role: 'system' as const, content: 'Hello' }],
      };
      const json = toJson(prompt, false);
      expect(json).not.toContain('\n');
    });
  });

  describe('getSystemPrompt', () => {
    it('should extract system message content', () => {
      const prompt = {
        messages: [
          { role: 'system' as const, content: 'System content' },
          { role: 'user' as const, content: 'User content' },
        ],
      };
      expect(getSystemPrompt(prompt)).toBe('System content');
    });

    it('should return empty string if no system message', () => {
      const prompt = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
      };
      expect(getSystemPrompt(prompt)).toBe('');
    });
  });

  describe('interpolate', () => {
    it('should replace variables with values', () => {
      const prompt = {
        messages: [{ role: 'system' as const, content: 'Hello {{name}}!' }],
      };
      const result = interpolate(prompt, { name: 'World' });
      expect(result.messages[0].content).toBe('Hello World!');
    });

    it('should use default values from variables definition', () => {
      const prompt = {
        messages: [{ role: 'system' as const, content: 'Hello {{name}}!' }],
        variables: { name: { default: 'Guest' } },
      };
      const result = interpolate(prompt, {});
      expect(result.messages[0].content).toBe('Hello Guest!');
    });

    it('should keep placeholder if no value or default', () => {
      const prompt = {
        messages: [{ role: 'system' as const, content: 'Hello {{name}}!' }],
      };
      const result = interpolate(prompt, {});
      expect(result.messages[0].content).toBe('Hello {{name}}!');
    });

    it('should interpolate multiple variables', () => {
      const prompt = {
        messages: [{ role: 'system' as const, content: '{{greeting}} {{name}}!' }],
      };
      const result = interpolate(prompt, { greeting: 'Hello', name: 'World' });
      expect(result.messages[0].content).toBe('Hello World!');
    });
  });
});
