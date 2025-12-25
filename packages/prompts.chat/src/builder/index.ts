/**
 * Prompt Builder - A fluent DSL for creating structured prompts
 * 
 * @example
 * ```ts
 * import { builder } from 'prompts.chat';
 * 
 * const prompt = builder()
 *   .role("Senior TypeScript Developer")
 *   .context("You are helping review code")
 *   .task("Analyze the following code for bugs")
 *   .constraints(["Be concise", "Focus on critical issues"])
 *   .output("JSON with { bugs: [], suggestions: [] }")
 *   .variable("code", { required: true })
 *   .build();
 * ```
 */

export interface PromptVariable {
  name: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface BuiltPrompt {
  content: string;
  variables: PromptVariable[];
  metadata: {
    role?: string;
    context?: string;
    task?: string;
    constraints?: string[];
    outputFormat?: string;
    examples?: Array<{ input: string; output: string }>;
  };
}

export class PromptBuilder {
  private _role?: string;
  private _context?: string;
  private _task?: string;
  private _constraints: string[] = [];
  private _outputFormat?: string;
  private _examples: Array<{ input: string; output: string }> = [];
  private _variables: PromptVariable[] = [];
  private _customSections: Array<{ title: string; content: string }> = [];
  private _rawContent?: string;

  /**
   * Set the role/persona for the AI
   */
  role(role: string): this {
    this._role = role;
    return this;
  }

  /**
   * Alias for role()
   */
  persona(persona: string): this {
    return this.role(persona);
  }

  /**
   * Set the context/background information
   */
  context(context: string): this {
    this._context = context;
    return this;
  }

  /**
   * Alias for context()
   */
  background(background: string): this {
    return this.context(background);
  }

  /**
   * Set the main task/instruction
   */
  task(task: string): this {
    this._task = task;
    return this;
  }

  /**
   * Alias for task()
   */
  instruction(instruction: string): this {
    return this.task(instruction);
  }

  /**
   * Add constraints/rules the AI should follow
   */
  constraints(constraints: string[]): this {
    this._constraints = [...this._constraints, ...constraints];
    return this;
  }

  /**
   * Add a single constraint
   */
  constraint(constraint: string): this {
    this._constraints.push(constraint);
    return this;
  }

  /**
   * Alias for constraints()
   */
  rules(rules: string[]): this {
    return this.constraints(rules);
  }

  /**
   * Set the expected output format
   */
  output(format: string): this {
    this._outputFormat = format;
    return this;
  }

  /**
   * Alias for output()
   */
  format(format: string): this {
    return this.output(format);
  }

  /**
   * Add an example input/output pair
   */
  example(input: string, output: string): this {
    this._examples.push({ input, output });
    return this;
  }

  /**
   * Add multiple examples
   */
  examples(examples: Array<{ input: string; output: string }>): this {
    this._examples = [...this._examples, ...examples];
    return this;
  }

  /**
   * Define a variable placeholder
   */
  variable(
    name: string, 
    options: { description?: string; required?: boolean; defaultValue?: string } = {}
  ): this {
    this._variables.push({
      name,
      description: options.description,
      required: options.required ?? true,
      defaultValue: options.defaultValue,
    });
    return this;
  }

  /**
   * Add a custom section
   */
  section(title: string, content: string): this {
    this._customSections.push({ title, content });
    return this;
  }

  /**
   * Set raw content (bypasses structured building)
   */
  raw(content: string): this {
    this._rawContent = content;
    return this;
  }

  /**
   * Build the final prompt
   */
  build(): BuiltPrompt {
    if (this._rawContent) {
      return {
        content: this._rawContent,
        variables: this._variables,
        metadata: {},
      };
    }

    const sections: string[] = [];

    // Role section
    if (this._role) {
      sections.push(`You are ${this._role}.`);
    }

    // Context section
    if (this._context) {
      sections.push(`\n## Context\n${this._context}`);
    }

    // Task section
    if (this._task) {
      sections.push(`\n## Task\n${this._task}`);
    }

    // Constraints section
    if (this._constraints.length > 0) {
      const constraintsList = this._constraints
        .map((c, i) => `${i + 1}. ${c}`)
        .join('\n');
      sections.push(`\n## Constraints\n${constraintsList}`);
    }

    // Output format section
    if (this._outputFormat) {
      sections.push(`\n## Output Format\n${this._outputFormat}`);
    }

    // Examples section
    if (this._examples.length > 0) {
      const examplesText = this._examples
        .map((e, i) => `### Example ${i + 1}\n**Input:** ${e.input}\n**Output:** ${e.output}`)
        .join('\n\n');
      sections.push(`\n## Examples\n${examplesText}`);
    }

    // Custom sections
    for (const section of this._customSections) {
      sections.push(`\n## ${section.title}\n${section.content}`);
    }

    // Variables section (as placeholders info)
    if (this._variables.length > 0) {
      const varsText = this._variables
        .map(v => {
          const placeholder = v.defaultValue 
            ? `\${${v.name}:${v.defaultValue}}`
            : `\${${v.name}}`;
          const desc = v.description ? ` - ${v.description}` : '';
          const req = v.required ? ' (required)' : ' (optional)';
          return `- ${placeholder}${desc}${req}`;
        })
        .join('\n');
      sections.push(`\n## Variables\n${varsText}`);
    }

    return {
      content: sections.join('\n').trim(),
      variables: this._variables,
      metadata: {
        role: this._role,
        context: this._context,
        task: this._task,
        constraints: this._constraints.length > 0 ? this._constraints : undefined,
        outputFormat: this._outputFormat,
        examples: this._examples.length > 0 ? this._examples : undefined,
      },
    };
  }

  /**
   * Build and return only the content string
   */
  toString(): string {
    return this.build().content;
  }
}

/**
 * Create a new prompt builder
 */
export function builder(): PromptBuilder {
  return new PromptBuilder();
}

/**
 * Create a prompt builder from an existing prompt
 */
export function fromPrompt(content: string): PromptBuilder {
  return new PromptBuilder().raw(content);
}

// Re-export media builders
export { image, ImagePromptBuilder } from './media';
export type { 
  BuiltImagePrompt, 
  ImageSubject, 
  ImageCamera, 
  ImageLighting, 
  ImageComposition,
  ImageStyle,
  ImageColor,
  ImageEnvironment,
  ImageTechnical,
  CameraAngle,
  ShotType,
  LensType,
  LightingType,
  TimeOfDay,
  ArtStyle,
  ColorPalette,
  Mood,
  AspectRatio,
  OutputFormat,
} from './media';

export { video, VideoPromptBuilder } from './video';
export type { 
  BuiltVideoPrompt,
  VideoScene,
  VideoSubject,
  VideoCamera,
  VideoLighting,
  VideoAction,
  VideoMotion,
  VideoStyle,
  VideoColor,
  VideoAudio,
  VideoTechnical,
  VideoShot,
} from './video';

export { audio, AudioPromptBuilder } from './audio';
export type {
  BuiltAudioPrompt,
  AudioGenre,
  AudioMood,
  AudioTempo,
  AudioVocals,
  AudioInstrumentation,
  AudioStructure,
  AudioProduction,
  AudioTechnical,
  MusicGenre,
  Instrument,
  VocalStyle,
  TempoMarking,
  TimeSignature,
  MusicalKey,
  SongSection,
  ProductionStyle,
} from './audio';

// Re-export chat builder
export { chat, ChatPromptBuilder, chatPresets } from './chat';
export type {
  BuiltChatPrompt,
  ChatMessage,
  ChatPersona,
  ChatContext,
  ChatTask,
  ChatOutput,
  ChatReasoning,
  ChatMemory,
  ChatExample,
  MessageRole,
  ResponseFormat,
  ResponseFormatType,
  JsonSchema,
  PersonaTone,
  PersonaExpertise,
  ReasoningStyle,
  OutputLength,
  OutputStyle,
} from './chat';

// Pre-built templates
export const templates = {
  /**
   * Create a code review prompt
   */
  codeReview: (options: { language?: string; focus?: string[] } = {}) => {
    const b = builder()
      .role("expert code reviewer")
      .task("Review the provided code and identify issues, improvements, and best practices.")
      .variable("code", { required: true, description: "The code to review" });

    if (options.language) {
      b.context(`You are reviewing ${options.language} code.`);
    }

    if (options.focus && options.focus.length > 0) {
      b.constraints(options.focus.map(f => `Focus on ${f}`));
    }

    return b.output("Provide a structured review with: issues found, suggestions, and overall assessment.");
  },

  /**
   * Create a translation prompt
   */
  translation: (from: string, to: string) => {
    return builder()
      .role(`professional translator fluent in ${from} and ${to}`)
      .task(`Translate the following text from ${from} to ${to}.`)
      .constraints([
        "Maintain the original meaning and tone",
        "Use natural, idiomatic expressions in the target language",
        "Preserve formatting and structure",
      ])
      .variable("text", { required: true, description: "Text to translate" });
  },

  /**
   * Create a summarization prompt
   */
  summarize: (options: { maxLength?: number; style?: 'bullet' | 'paragraph' } = {}) => {
    const b = builder()
      .role("expert summarizer")
      .task("Summarize the following content concisely while preserving key information.")
      .variable("content", { required: true, description: "Content to summarize" });

    if (options.maxLength) {
      b.constraint(`Keep the summary under ${options.maxLength} words`);
    }

    if (options.style === 'bullet') {
      b.output("Provide the summary as bullet points");
    }

    return b;
  },

  /**
   * Create a Q&A prompt
   */
  qa: (context?: string) => {
    const b = builder()
      .role("helpful assistant")
      .task("Answer the question based on the provided context.")
      .variable("question", { required: true, description: "The question to answer" });

    if (context) {
      b.context(context);
    } else {
      b.variable("context", { required: false, description: "Additional context" });
    }

    return b.constraints([
      "Be accurate and concise",
      "If you don't know the answer, say so",
      "Cite relevant parts of the context if applicable",
    ]);
  },
};
