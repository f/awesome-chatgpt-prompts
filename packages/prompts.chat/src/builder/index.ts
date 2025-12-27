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

  /**
   * Create a debugging prompt
   */
  debug: (options: { language?: string; errorType?: string } = {}) => {
    const b = builder()
      .role("expert software debugger")
      .task("Analyze the code and error, identify the root cause, and provide a fix.")
      .variable("code", { required: true, description: "The code with the bug" })
      .variable("error", { required: false, description: "Error message or unexpected behavior" });

    if (options.language) {
      b.context(`Debugging ${options.language} code.`);
    }

    if (options.errorType) {
      b.context(`The error appears to be related to: ${options.errorType}`);
    }

    return b
      .constraints([
        "Identify the root cause, not just symptoms",
        "Explain why the bug occurs",
        "Provide a working fix with explanation",
      ])
      .output("1. Root cause analysis\n2. Explanation\n3. Fixed code\n4. Prevention tips");
  },

  /**
   * Create a writing assistant prompt
   */
  write: (options: { type?: 'blog' | 'email' | 'essay' | 'story' | 'documentation'; tone?: string } = {}) => {
    const typeDescriptions: Record<string, string> = {
      blog: "engaging blog post",
      email: "professional email",
      essay: "well-structured essay",
      story: "creative story",
      documentation: "clear technical documentation",
    };

    const b = builder()
      .role("skilled writer")
      .task(`Write a ${typeDescriptions[options.type || 'blog'] || 'piece of content'} based on the given topic or outline.`)
      .variable("topic", { required: true, description: "Topic or outline to write about" });

    if (options.tone) {
      b.constraint(`Use a ${options.tone} tone throughout`);
    }

    return b.constraints([
      "Use clear and engaging language",
      "Structure content logically",
      "Maintain consistent voice and style",
    ]);
  },

  /**
   * Create an explanation/teaching prompt
   */
  explain: (options: { level?: 'beginner' | 'intermediate' | 'expert'; useAnalogies?: boolean } = {}) => {
    const levelDescriptions: Record<string, string> = {
      beginner: "someone new to the topic with no prior knowledge",
      intermediate: "someone with basic understanding who wants to go deeper",
      expert: "an expert who wants technical precision and nuance",
    };

    const b = builder()
      .role("expert teacher and communicator")
      .task("Explain the concept clearly and thoroughly.")
      .variable("concept", { required: true, description: "The concept to explain" });

    if (options.level) {
      b.context(`Target audience: ${levelDescriptions[options.level]}`);
    }

    if (options.useAnalogies) {
      b.constraint("Use relatable analogies and real-world examples");
    }

    return b.constraints([
      "Break down complex ideas into digestible parts",
      "Build understanding progressively",
      "Anticipate and address common misconceptions",
    ]);
  },

  /**
   * Create a data extraction prompt
   */
  extract: (options: { format?: 'json' | 'csv' | 'table'; fields?: string[] } = {}) => {
    const b = builder()
      .role("data extraction specialist")
      .task("Extract structured data from the provided text.")
      .variable("text", { required: true, description: "Text to extract data from" });

    if (options.fields && options.fields.length > 0) {
      b.context(`Fields to extract: ${options.fields.join(", ")}`);
    }

    if (options.format) {
      b.output(`Return extracted data in ${options.format.toUpperCase()} format`);
    }

    return b.constraints([
      "Extract only factual information present in the text",
      "Use null or empty values for missing fields",
      "Maintain consistent formatting",
    ]);
  },

  /**
   * Create a brainstorming prompt
   */
  brainstorm: (options: { count?: number; creative?: boolean } = {}) => {
    const b = builder()
      .role("creative strategist and ideation expert")
      .task("Generate diverse and innovative ideas based on the given topic or challenge.")
      .variable("topic", { required: true, description: "Topic or challenge to brainstorm about" });

    if (options.count) {
      b.constraint(`Generate exactly ${options.count} ideas`);
    }

    if (options.creative) {
      b.constraint("Include unconventional and out-of-the-box ideas");
    }

    return b
      .constraints([
        "Ensure ideas are distinct and varied",
        "Consider different perspectives and approaches",
        "Make ideas actionable when possible",
      ])
      .output("List each idea with a brief description and potential benefits");
  },

  /**
   * Create a code refactoring prompt
   */
  refactor: (options: { goal?: 'readability' | 'performance' | 'maintainability' | 'all'; language?: string } = {}) => {
    const goalDescriptions: Record<string, string> = {
      readability: "improving code readability and clarity",
      performance: "optimizing performance and efficiency",
      maintainability: "enhancing maintainability and extensibility",
      all: "overall code quality improvement",
    };

    const b = builder()
      .role("senior software engineer specializing in code quality")
      .task(`Refactor the code with focus on ${goalDescriptions[options.goal || 'all']}.`)
      .variable("code", { required: true, description: "Code to refactor" });

    if (options.language) {
      b.context(`The code is written in ${options.language}.`);
    }

    return b
      .constraints([
        "Preserve existing functionality",
        "Follow language best practices and idioms",
        "Explain each significant change",
      ])
      .output("1. Refactored code\n2. List of changes made\n3. Explanation of improvements");
  },

  /**
   * Create an API documentation prompt
   */
  apiDocs: (options: { style?: 'openapi' | 'markdown' | 'jsdoc'; includeExamples?: boolean } = {}) => {
    const b = builder()
      .role("technical documentation writer")
      .task("Generate comprehensive API documentation for the provided code or endpoint.")
      .variable("code", { required: true, description: "API code or endpoint definition" });

    if (options.style) {
      b.output(`Format documentation in ${options.style.toUpperCase()} style`);
    }

    if (options.includeExamples) {
      b.constraint("Include request/response examples for each endpoint");
    }

    return b.constraints([
      "Document all parameters with types and descriptions",
      "Include error responses and status codes",
      "Be precise and developer-friendly",
    ]);
  },

  /**
   * Create a unit test generation prompt
   */
  unitTest: (options: { framework?: string; coverage?: 'basic' | 'comprehensive' } = {}) => {
    const b = builder()
      .role("test automation engineer")
      .task("Generate unit tests for the provided code.")
      .variable("code", { required: true, description: "Code to generate tests for" });

    if (options.framework) {
      b.context(`Use ${options.framework} testing framework.`);
    }

    const coverageConstraints = options.coverage === 'comprehensive'
      ? ["Cover all code paths including edge cases", "Test error handling scenarios", "Include boundary value tests"]
      : ["Cover main functionality", "Include basic edge cases"];

    return b
      .constraints([
        ...coverageConstraints,
        "Write clear, descriptive test names",
        "Follow AAA pattern (Arrange, Act, Assert)",
      ])
      .output("Complete, runnable test file");
  },

  /**
   * Create a commit message prompt
   */
  commitMessage: (options: { style?: 'conventional' | 'simple'; includeBody?: boolean } = {}) => {
    const b = builder()
      .role("developer with excellent communication skills")
      .task("Generate a clear and descriptive commit message for the provided code changes.")
      .variable("diff", { required: true, description: "Git diff or description of changes" });

    if (options.style === 'conventional') {
      b.constraints([
        "Follow Conventional Commits format (type(scope): description)",
        "Use appropriate type: feat, fix, docs, style, refactor, test, chore",
      ]);
    }

    if (options.includeBody) {
      b.constraint("Include a detailed body explaining the why behind changes");
    }

    return b.constraints([
      "Keep subject line under 72 characters",
      "Use imperative mood (Add, Fix, Update, not Added, Fixed, Updated)",
    ]);
  },

  /**
   * Create a code review comment prompt
   */
  reviewComment: (options: { tone?: 'constructive' | 'direct'; severity?: boolean } = {}) => {
    const b = builder()
      .role("thoughtful code reviewer")
      .task("Write a helpful code review comment for the provided code snippet.")
      .variable("code", { required: true, description: "Code to comment on" })
      .variable("issue", { required: true, description: "The issue or improvement to address" });

    if (options.tone === 'constructive') {
      b.constraint("Frame feedback positively and suggest improvements rather than just pointing out problems");
    }

    if (options.severity) {
      b.constraint("Indicate severity level: nitpick, suggestion, important, or blocker");
    }

    return b.constraints([
      "Be specific and actionable",
      "Explain the reasoning behind the suggestion",
      "Provide an example of the improved code when helpful",
    ]);
  },

  /**
   * Create a regex generator prompt
   */
  regex: (options: { flavor?: 'javascript' | 'python' | 'pcre' } = {}) => {
    const b = builder()
      .role("regex expert")
      .task("Create a regular expression that matches the described pattern.")
      .variable("pattern", { required: true, description: "Description of the pattern to match" })
      .variable("examples", { required: false, description: "Example strings that should match" });

    if (options.flavor) {
      b.context(`Use ${options.flavor} regex flavor/syntax.`);
    }

    return b
      .constraints([
        "Provide the regex pattern",
        "Explain each part of the pattern",
        "Include test cases showing matches and non-matches",
      ])
      .output("1. Regex pattern\n2. Explanation\n3. Test cases");
  },

  /**
   * Create a SQL query prompt
   */
  sql: (options: { dialect?: 'postgresql' | 'mysql' | 'sqlite' | 'mssql'; optimize?: boolean } = {}) => {
    const b = builder()
      .role("database expert")
      .task("Write an SQL query based on the requirements.")
      .variable("requirement", { required: true, description: "What the query should accomplish" })
      .variable("schema", { required: false, description: "Database schema or table definitions" });

    if (options.dialect) {
      b.context(`Use ${options.dialect.toUpperCase()} syntax.`);
    }

    if (options.optimize) {
      b.constraint("Optimize for performance and include index recommendations if applicable");
    }

    return b.constraints([
      "Write clean, readable SQL",
      "Use appropriate JOINs and avoid N+1 patterns",
      "Include comments explaining complex logic",
    ]);
  },
};
