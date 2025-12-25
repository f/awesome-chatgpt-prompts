import { describe, it, expect } from 'vitest';
import {
  builder,
  fromPrompt,
  PromptBuilder,
  templates,
  chat,
  ChatPromptBuilder,
  chatPresets,
  image,
  ImagePromptBuilder,
  video,
  VideoPromptBuilder,
  audio,
  AudioPromptBuilder,
} from '../builder';

describe('builder module', () => {
  describe('PromptBuilder', () => {
    it('should create a builder with factory function', () => {
      const b = builder();
      expect(b).toBeInstanceOf(PromptBuilder);
    });

    it('should build a prompt with role', () => {
      const result = builder().role('helpful assistant').build();
      expect(result.content).toContain('You are helpful assistant');
      expect(result.metadata.role).toBe('helpful assistant');
    });

    it('should build a prompt with context', () => {
      const result = builder().context('some background').build();
      expect(result.content).toContain('Context');
      expect(result.content).toContain('some background');
    });

    it('should build a prompt with task', () => {
      const result = builder().task('do something').build();
      expect(result.content).toContain('Task');
      expect(result.content).toContain('do something');
    });

    it('should build a prompt with constraints', () => {
      const result = builder().constraints(['be concise', 'be helpful']).build();
      expect(result.content).toContain('Constraints');
      expect(result.content).toContain('be concise');
      expect(result.content).toContain('be helpful');
    });

    it('should build a prompt with output format', () => {
      const result = builder().output('JSON format').build();
      expect(result.content).toContain('Output Format');
      expect(result.content).toContain('JSON format');
    });

    it('should build a prompt with examples', () => {
      const result = builder().example('input', 'output').build();
      expect(result.content).toContain('Examples');
      expect(result.content).toContain('input');
      expect(result.content).toContain('output');
    });

    it('should build a prompt with variables', () => {
      const result = builder()
        .variable('name', { required: true, description: 'The name' })
        .build();
      expect(result.variables).toHaveLength(1);
      expect(result.variables[0].name).toBe('name');
    });

    it('should chain multiple methods', () => {
      const result = builder()
        .role('assistant')
        .context('helping')
        .task('answer')
        .constraint('be nice')
        .build();
      
      expect(result.metadata.role).toBe('assistant');
      expect(result.metadata.context).toBe('helping');
      expect(result.metadata.task).toBe('answer');
    });

    it('toString should return content', () => {
      const content = builder().role('assistant').toString();
      expect(content).toContain('You are assistant');
    });

    it('fromPrompt should create raw prompt', () => {
      const result = fromPrompt('raw content').build();
      expect(result.content).toBe('raw content');
    });
  });

  describe('templates', () => {
    it('should create code review template', () => {
      const template = templates.codeReview({ language: 'TypeScript' });
      const result = template.build();
      expect(result.content).toContain('code reviewer');
      expect(result.content).toContain('TypeScript');
    });

    it('should create translation template', () => {
      const template = templates.translation('English', 'Spanish');
      const result = template.build();
      expect(result.content).toContain('translator');
      expect(result.content).toContain('English');
      expect(result.content).toContain('Spanish');
    });

    it('should create summarize template', () => {
      const template = templates.summarize({ maxLength: 100 });
      const result = template.build();
      expect(result.content).toContain('summarizer');
      expect(result.content).toContain('100');
    });

    it('should create qa template', () => {
      const template = templates.qa();
      const result = template.build();
      expect(result.content).toContain('helpful');
    });
  });

  describe('ChatPromptBuilder', () => {
    it('should create a chat builder with factory function', () => {
      const c = chat();
      expect(c).toBeInstanceOf(ChatPromptBuilder);
    });

    it('should build with role', () => {
      const result = chat().role('helpful assistant').build();
      expect(result.systemPrompt).toContain('You are helpful assistant');
    });

    it('should build with tone', () => {
      const result = chat().tone('professional').build();
      expect(result.systemPrompt).toContain('professional');
    });

    it('should build with expertise', () => {
      const result = chat().expertise('coding').build();
      expect(result.systemPrompt).toContain('coding');
    });

    it('should build with context', () => {
      const result = chat().context('building an app').build();
      expect(result.systemPrompt).toContain('building an app');
    });

    it('should build with task', () => {
      const result = chat().task('review code').build();
      expect(result.systemPrompt).toContain('review code');
    });

    it('should build with constraints', () => {
      const result = chat().constraints(['be concise']).build();
      expect(result.systemPrompt).toContain('be concise');
    });

    it('should build with avoid', () => {
      const result = chat().avoid(['being verbose']).build();
      expect(result.systemPrompt).toContain('being verbose');
    });

    it('should add user message', () => {
      const result = chat().user('Hello').build();
      expect(result.messages.some(m => m.role === 'user' && m.content === 'Hello')).toBe(true);
    });

    it('should add assistant message', () => {
      const result = chat().assistant('Hi there').build();
      expect(result.messages.some(m => m.role === 'assistant' && m.content === 'Hi there')).toBe(true);
    });

    it('should build with examples', () => {
      const result = chat().example('input', 'output').build();
      expect(result.systemPrompt).toContain('input');
      expect(result.systemPrompt).toContain('output');
    });

    it('should build with reasoning style', () => {
      const result = chat().stepByStep().build();
      expect(result.systemPrompt).toContain('step by step');
    });

    it('should build with output format', () => {
      const result = chat().json().build();
      expect(result.systemPrompt).toContain('JSON');
    });

    it('should build with length', () => {
      const result = chat().detailed().build();
      expect(result.systemPrompt).toContain('detailed');
    });

    it('should chain multiple methods', () => {
      const result = chat()
        .role('developer')
        .tone('technical')
        .task('explain code')
        .stepByStep()
        .detailed()
        .user('What is this?')
        .build();
      
      expect(result.systemPrompt).toContain('developer');
      expect(result.messages.length).toBeGreaterThan(1);
    });

    it('toSystemPrompt should return system prompt string', () => {
      const systemPrompt = chat().role('assistant').toSystemPrompt();
      expect(systemPrompt).toContain('You are assistant');
    });

    it('toMessages should return messages array', () => {
      const messages = chat().user('Hello').toMessages();
      expect(Array.isArray(messages)).toBe(true);
    });

    it('toJSON should return JSON string', () => {
      const json = chat().role('assistant').toJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('chatPresets', () => {
    it('should create coder preset', () => {
      const result = chatPresets.coder('TypeScript').build();
      expect(result.systemPrompt).toContain('developer');
    });

    it('should create writer preset', () => {
      const result = chatPresets.writer('creative').build();
      expect(result.systemPrompt).toContain('writer');
    });

    it('should create tutor preset', () => {
      const result = chatPresets.tutor('math').build();
      expect(result.systemPrompt).toContain('tutor');
    });

    it('should create analyst preset', () => {
      const result = chatPresets.analyst().build();
      expect(result.systemPrompt).toContain('analyst');
    });

    it('should create socratic preset', () => {
      const result = chatPresets.socratic().build();
      expect(result.systemPrompt).toContain('Socratic');
    });
  });

  describe('ImagePromptBuilder', () => {
    it('should create an image builder with factory function', () => {
      const i = image();
      expect(i).toBeInstanceOf(ImagePromptBuilder);
    });

    it('should build with subject', () => {
      const result = image().subject('a cat').build();
      expect(result.prompt).toContain('cat');
    });

    it('should build with environment', () => {
      const result = image().environment('forest').build();
      expect(result.prompt).toContain('forest');
    });

    it('should build with camera settings', () => {
      const result = image()
        .shot('close-up')
        .angle('low-angle')
        .lens('85mm')
        .build();
      expect(result.prompt).toContain('close-up');
      expect(result.prompt).toContain('low-angle');
      expect(result.prompt).toContain('85mm');
    });

    it('should build with lighting', () => {
      const result = image()
        .lightingType('rim')
        .timeOfDay('golden-hour')
        .build();
      expect(result.prompt).toContain('rim');
      expect(result.prompt).toContain('golden-hour');
    });

    it('should build with style', () => {
      const result = image()
        .medium('cinematic')
        .artist('Roger Deakins')
        .build();
      expect(result.prompt).toContain('cinematic');
      expect(result.prompt).toContain('Roger Deakins');
    });

    it('should output to JSON', () => {
      const json = image().subject('test').toJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('VideoPromptBuilder', () => {
    it('should create a video builder with factory function', () => {
      const v = video();
      expect(v).toBeInstanceOf(VideoPromptBuilder);
    });

    it('should build with scene', () => {
      const result = video().scene('A car drives').build();
      expect(result.prompt).toContain('car drives');
    });

    it('should build with camera movement', () => {
      const result = video().movement('tracking').build();
      expect(result.prompt).toContain('tracking');
    });

    it('should build with duration', () => {
      const result = video().duration(5).build();
      expect(result.structure.technical?.duration).toBe(5);
    });
  });

  describe('AudioPromptBuilder', () => {
    it('should create an audio builder with factory function', () => {
      const a = audio();
      expect(a).toBeInstanceOf(AudioPromptBuilder);
    });

    it('should build with genre', () => {
      const result = audio().genre('jazz').build();
      expect(result.stylePrompt).toContain('jazz');
    });

    it('should build with mood', () => {
      const result = audio().mood('melancholic').build();
      expect(result.stylePrompt).toContain('melancholic');
    });

    it('should build with tempo', () => {
      const result = audio().bpm(120).build();
      expect(result.stylePrompt).toContain('120');
    });

    it('should build with instruments', () => {
      const result = audio().instruments(['piano', 'drums']).build();
      expect(result.stylePrompt).toContain('piano');
      expect(result.stylePrompt).toContain('drums');
    });
  });
});
