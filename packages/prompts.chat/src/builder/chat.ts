/**
 * Chat Prompt Builder - Model-Agnostic Conversation Prompt Builder
 * 
 * Build structured prompts for any chat/conversation model.
 * Focus on prompt engineering, not model-specific features.
 * 
 * @example
 * ```ts
 * import { chat } from 'prompts.chat/builder';
 * 
 * const prompt = chat()
 *   .role("helpful coding assistant")
 *   .context("Building a React application")
 *   .task("Explain async/await in JavaScript")
 *   .stepByStep()
 *   .detailed()
 *   .build();
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// --- Message Types ---
export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string;
}

// --- Response Format Types ---
export type ResponseFormatType = 'text' | 'json' | 'markdown' | 'code' | 'table';

export interface JsonSchema {
  name: string;
  description?: string;
  schema: Record<string, unknown>;
}

export interface ResponseFormat {
  type: ResponseFormatType;
  jsonSchema?: JsonSchema;
  language?: string;
}

// --- Persona Types ---
export type PersonaTone = 
  | 'professional' | 'casual' | 'formal' | 'friendly' | 'academic'
  | 'technical' | 'creative' | 'empathetic' | 'authoritative' | 'playful'
  | 'concise' | 'detailed' | 'socratic' | 'coaching' | 'analytical'
  | 'encouraging' | 'neutral' | 'humorous' | 'serious';

export type PersonaExpertise = 
  | 'general' | 'coding' | 'writing' | 'analysis' | 'research'
  | 'teaching' | 'counseling' | 'creative' | 'legal' | 'medical'
  | 'financial' | 'scientific' | 'engineering' | 'design' | 'marketing'
  | 'business' | 'philosophy' | 'history' | 'languages' | 'mathematics';

// --- Reasoning Types ---
export type ReasoningStyle = 
  | 'step-by-step' | 'chain-of-thought' | 'tree-of-thought' 
  | 'direct' | 'analytical' | 'comparative' | 'deductive' | 'inductive'
  | 'first-principles' | 'analogical' | 'devil-advocate';

// --- Output Types ---
export type OutputLength = 'brief' | 'moderate' | 'detailed' | 'comprehensive' | 'exhaustive';
export type OutputStyle = 'prose' | 'bullet-points' | 'numbered-list' | 'table' | 'code' | 'mixed' | 'qa' | 'dialogue';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ChatPersona {
  name?: string;
  role?: string;
  tone?: PersonaTone | PersonaTone[];
  expertise?: PersonaExpertise | PersonaExpertise[];
  personality?: string[];
  background?: string;
  language?: string;
  verbosity?: OutputLength;
}

export interface ChatContext {
  background?: string;
  domain?: string;
  audience?: string;
  purpose?: string;
  constraints?: string[];
  assumptions?: string[];
  knowledge?: string[];
}

export interface ChatTask {
  instruction: string;
  steps?: string[];
  deliverables?: string[];
  criteria?: string[];
  antiPatterns?: string[];
  priority?: 'accuracy' | 'speed' | 'creativity' | 'thoroughness';
}

export interface ChatOutput {
  format?: ResponseFormat;
  length?: OutputLength;
  style?: OutputStyle;
  language?: string;
  includeExplanation?: boolean;
  includeExamples?: boolean;
  includeSources?: boolean;
  includeConfidence?: boolean;
}

export interface ChatReasoning {
  style?: ReasoningStyle;
  showWork?: boolean;
  verifyAnswer?: boolean;
  considerAlternatives?: boolean;
  explainAssumptions?: boolean;
}

export interface ChatExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ChatMemory {
  summary?: string;
  facts?: string[];
  preferences?: string[];
  history?: ChatMessage[];
}

export interface BuiltChatPrompt {
  messages: ChatMessage[];
  systemPrompt: string;
  userPrompt?: string;
  metadata: {
    persona?: ChatPersona;
    context?: ChatContext;
    task?: ChatTask;
    output?: ChatOutput;
    reasoning?: ChatReasoning;
    examples?: ChatExample[];
  };
}

// ============================================================================
// CHAT PROMPT BUILDER
// ============================================================================

export class ChatPromptBuilder {
  private _messages: ChatMessage[] = [];
  private _persona?: ChatPersona;
  private _context?: ChatContext;
  private _task?: ChatTask;
  private _output?: ChatOutput;
  private _reasoning?: ChatReasoning;
  private _examples: ChatExample[] = [];
  private _memory?: ChatMemory;
  private _customSystemParts: string[] = [];

  // --- Message Methods ---

  system(content: string): this {
    // Remove existing system message and add new one at beginning
    this._messages = this._messages.filter(m => m.role !== 'system');
    this._messages.unshift({ role: 'system', content });
    return this;
  }

  user(content: string, name?: string): this {
    this._messages.push({ role: 'user', content, name });
    return this;
  }

  assistant(content: string): this {
    this._messages.push({ role: 'assistant', content });
    return this;
  }

  message(role: MessageRole, content: string, name?: string): this {
    this._messages.push({ role, content, name });
    return this;
  }

  messages(messages: ChatMessage[]): this {
    this._messages = [...this._messages, ...messages];
    return this;
  }

  conversation(turns: Array<{ user: string; assistant?: string }>): this {
    for (const turn of turns) {
      this.user(turn.user);
      if (turn.assistant) {
        this.assistant(turn.assistant);
      }
    }
    return this;
  }

  // --- Persona Methods ---

  persona(settings: ChatPersona | string): this {
    if (typeof settings === 'string') {
      this._persona = { ...(this._persona || {}), role: settings };
    } else {
      this._persona = { ...(this._persona || {}), ...settings };
    }
    return this;
  }

  role(role: string): this {
    this._persona = { ...(this._persona || {}), role };
    return this;
  }

  tone(tone: PersonaTone | PersonaTone[]): this {
    this._persona = { ...(this._persona || {}), tone };
    return this;
  }

  expertise(expertise: PersonaExpertise | PersonaExpertise[]): this {
    this._persona = { ...(this._persona || {}), expertise };
    return this;
  }

  personality(traits: string[]): this {
    this._persona = { ...(this._persona || {}), personality: traits };
    return this;
  }

  background(background: string): this {
    this._persona = { ...(this._persona || {}), background };
    return this;
  }

  speakAs(name: string): this {
    this._persona = { ...(this._persona || {}), name };
    return this;
  }

  responseLanguage(language: string): this {
    this._persona = { ...(this._persona || {}), language };
    return this;
  }

  // --- Context Methods ---

  context(settings: ChatContext | string): this {
    if (typeof settings === 'string') {
      this._context = { ...(this._context || {}), background: settings };
    } else {
      this._context = { ...(this._context || {}), ...settings };
    }
    return this;
  }

  domain(domain: string): this {
    this._context = { ...(this._context || {}), domain };
    return this;
  }

  audience(audience: string): this {
    this._context = { ...(this._context || {}), audience };
    return this;
  }

  purpose(purpose: string): this {
    this._context = { ...(this._context || {}), purpose };
    return this;
  }

  constraints(constraints: string[]): this {
    const existing = this._context?.constraints || [];
    this._context = { ...(this._context || {}), constraints: [...existing, ...constraints] };
    return this;
  }

  constraint(constraint: string): this {
    return this.constraints([constraint]);
  }

  assumptions(assumptions: string[]): this {
    this._context = { ...(this._context || {}), assumptions };
    return this;
  }

  knowledge(facts: string[]): this {
    this._context = { ...(this._context || {}), knowledge: facts };
    return this;
  }

  // --- Task Methods ---

  task(instruction: string | ChatTask): this {
    if (typeof instruction === 'string') {
      this._task = { ...(this._task || { instruction: '' }), instruction };
    } else {
      this._task = { ...(this._task || { instruction: '' }), ...instruction };
    }
    return this;
  }

  instruction(instruction: string): this {
    this._task = { ...(this._task || { instruction: '' }), instruction };
    return this;
  }

  steps(steps: string[]): this {
    this._task = { ...(this._task || { instruction: '' }), steps };
    return this;
  }

  deliverables(deliverables: string[]): this {
    this._task = { ...(this._task || { instruction: '' }), deliverables };
    return this;
  }

  criteria(criteria: string[]): this {
    this._task = { ...(this._task || { instruction: '' }), criteria };
    return this;
  }

  avoid(antiPatterns: string[]): this {
    this._task = { ...(this._task || { instruction: '' }), antiPatterns };
    return this;
  }

  priority(priority: ChatTask['priority']): this {
    this._task = { ...(this._task || { instruction: '' }), priority };
    return this;
  }

  // --- Example Methods ---

  example(input: string, output: string, explanation?: string): this {
    this._examples.push({ input, output, explanation });
    return this;
  }

  examples(examples: ChatExample[]): this {
    this._examples = [...this._examples, ...examples];
    return this;
  }

  fewShot(examples: Array<{ input: string; output: string }>): this {
    for (const ex of examples) {
      this._examples.push(ex);
    }
    return this;
  }

  // --- Output Methods ---

  output(settings: ChatOutput): this {
    this._output = { ...(this._output || {}), ...settings };
    return this;
  }

  outputFormat(format: ResponseFormatType): this {
    this._output = { 
      ...(this._output || {}), 
      format: { type: format } 
    };
    return this;
  }

  json(schema?: JsonSchema): this {
    if (schema) {
      this._output = { 
        ...(this._output || {}), 
        format: { type: 'json', jsonSchema: schema } 
      };
    } else {
      this._output = { 
        ...(this._output || {}), 
        format: { type: 'json' } 
      };
    }
    return this;
  }

  jsonSchema(name: string, schema: Record<string, unknown>, description?: string): this {
    this._output = { 
      ...(this._output || {}), 
      format: { 
        type: 'json', 
        jsonSchema: { name, schema, description } 
      } 
    };
    return this;
  }

  markdown(): this {
    this._output = { ...(this._output || {}), format: { type: 'markdown' } };
    return this;
  }

  code(language?: string): this {
    this._output = { ...(this._output || {}), format: { type: 'code', language } };
    return this;
  }

  table(): this {
    this._output = { ...(this._output || {}), format: { type: 'table' } };
    return this;
  }

  length(length: OutputLength): this {
    this._output = { ...(this._output || {}), length };
    return this;
  }

  style(style: OutputStyle): this {
    this._output = { ...(this._output || {}), style };
    return this;
  }

  brief(): this {
    return this.length('brief');
  }

  moderate(): this {
    return this.length('moderate');
  }

  detailed(): this {
    return this.length('detailed');
  }

  comprehensive(): this {
    return this.length('comprehensive');
  }

  exhaustive(): this {
    return this.length('exhaustive');
  }

  withExamples(): this {
    this._output = { ...(this._output || {}), includeExamples: true };
    return this;
  }

  withExplanation(): this {
    this._output = { ...(this._output || {}), includeExplanation: true };
    return this;
  }

  withSources(): this {
    this._output = { ...(this._output || {}), includeSources: true };
    return this;
  }

  withConfidence(): this {
    this._output = { ...(this._output || {}), includeConfidence: true };
    return this;
  }

  // --- Reasoning Methods ---

  reasoning(settings: ChatReasoning): this {
    this._reasoning = { ...(this._reasoning || {}), ...settings };
    return this;
  }

  reasoningStyle(style: ReasoningStyle): this {
    this._reasoning = { ...(this._reasoning || {}), style };
    return this;
  }

  stepByStep(): this {
    this._reasoning = { ...(this._reasoning || {}), style: 'step-by-step', showWork: true };
    return this;
  }

  chainOfThought(): this {
    this._reasoning = { ...(this._reasoning || {}), style: 'chain-of-thought', showWork: true };
    return this;
  }

  treeOfThought(): this {
    this._reasoning = { ...(this._reasoning || {}), style: 'tree-of-thought', showWork: true };
    return this;
  }

  firstPrinciples(): this {
    this._reasoning = { ...(this._reasoning || {}), style: 'first-principles', showWork: true };
    return this;
  }

  devilsAdvocate(): this {
    this._reasoning = { ...(this._reasoning || {}), style: 'devil-advocate', considerAlternatives: true };
    return this;
  }

  showWork(show = true): this {
    this._reasoning = { ...(this._reasoning || {}), showWork: show };
    return this;
  }

  verifyAnswer(verify = true): this {
    this._reasoning = { ...(this._reasoning || {}), verifyAnswer: verify };
    return this;
  }

  considerAlternatives(consider = true): this {
    this._reasoning = { ...(this._reasoning || {}), considerAlternatives: consider };
    return this;
  }

  explainAssumptions(explain = true): this {
    this._reasoning = { ...(this._reasoning || {}), explainAssumptions: explain };
    return this;
  }

  // --- Memory Methods ---

  memory(memory: ChatMemory): this {
    this._memory = { ...(this._memory || {}), ...memory };
    return this;
  }

  remember(facts: string[]): this {
    const existing = this._memory?.facts || [];
    this._memory = { ...(this._memory || {}), facts: [...existing, ...facts] };
    return this;
  }

  preferences(prefs: string[]): this {
    this._memory = { ...(this._memory || {}), preferences: prefs };
    return this;
  }

  history(messages: ChatMessage[]): this {
    this._memory = { ...(this._memory || {}), history: messages };
    return this;
  }

  summarizeHistory(summary: string): this {
    this._memory = { ...(this._memory || {}), summary };
    return this;
  }

  // --- Custom System Prompt Parts ---

  addSystemPart(part: string): this {
    this._customSystemParts.push(part);
    return this;
  }

  raw(content: string): this {
    this._customSystemParts = [content];
    return this;
  }

  // --- Build Methods ---

  private buildSystemPrompt(): string {
    const parts: string[] = [];

    // Persona
    if (this._persona) {
      let personaText = '';
      if (this._persona.name) {
        personaText += `You are ${this._persona.name}`;
        if (this._persona.role) personaText += `, ${this._persona.role}`;
        personaText += '.';
      } else if (this._persona.role) {
        personaText += `You are ${this._persona.role}.`;
      }
      
      if (this._persona.tone) {
        const tones = Array.isArray(this._persona.tone) ? this._persona.tone : [this._persona.tone];
        personaText += ` Your tone is ${tones.join(' and ')}.`;
      }
      
      if (this._persona.expertise) {
        const areas = Array.isArray(this._persona.expertise) ? this._persona.expertise : [this._persona.expertise];
        personaText += ` You have expertise in ${areas.join(', ')}.`;
      }
      
      if (this._persona.personality?.length) {
        personaText += ` You are ${this._persona.personality.join(', ')}.`;
      }
      
      if (this._persona.background) {
        personaText += ` ${this._persona.background}`;
      }

      if (this._persona.verbosity) {
        personaText += ` Keep responses ${this._persona.verbosity}.`;
      }

      if (this._persona.language) {
        personaText += ` Respond in ${this._persona.language}.`;
      }

      if (personaText) parts.push(personaText.trim());
    }

    // Context
    if (this._context) {
      const contextParts: string[] = [];
      
      if (this._context.background) {
        contextParts.push(this._context.background);
      }
      if (this._context.domain) {
        contextParts.push(`Domain: ${this._context.domain}`);
      }
      if (this._context.audience) {
        contextParts.push(`Target audience: ${this._context.audience}`);
      }
      if (this._context.purpose) {
        contextParts.push(`Purpose: ${this._context.purpose}`);
      }
      if (this._context.knowledge?.length) {
        contextParts.push(`Known facts:\n${this._context.knowledge.map(k => `- ${k}`).join('\n')}`);
      }
      if (this._context.assumptions?.length) {
        contextParts.push(`Assumptions:\n${this._context.assumptions.map(a => `- ${a}`).join('\n')}`);
      }
      
      if (contextParts.length) {
        parts.push(`## Context\n${contextParts.join('\n')}`);
      }
    }

    // Task
    if (this._task) {
      const taskParts: string[] = [];
      
      if (this._task.instruction) {
        taskParts.push(this._task.instruction);
      }
      if (this._task.priority) {
        taskParts.push(`Priority: ${this._task.priority}`);
      }
      if (this._task.steps?.length) {
        taskParts.push(`\nSteps:\n${this._task.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
      }
      if (this._task.deliverables?.length) {
        taskParts.push(`\nDeliverables:\n${this._task.deliverables.map(d => `- ${d}`).join('\n')}`);
      }
      if (this._task.criteria?.length) {
        taskParts.push(`\nSuccess criteria:\n${this._task.criteria.map(c => `- ${c}`).join('\n')}`);
      }
      if (this._task.antiPatterns?.length) {
        taskParts.push(`\nAvoid:\n${this._task.antiPatterns.map(a => `- ${a}`).join('\n')}`);
      }
      
      if (taskParts.length) {
        parts.push(`## Task\n${taskParts.join('\n')}`);
      }
    }

    // Constraints
    if (this._context?.constraints?.length) {
      parts.push(`## Constraints\n${this._context.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
    }

    // Examples
    if (this._examples.length) {
      const examplesText = this._examples
        .map((ex, i) => {
          let text = `### Example ${i + 1}\n**Input:** ${ex.input}\n**Output:** ${ex.output}`;
          if (ex.explanation) text += `\n**Explanation:** ${ex.explanation}`;
          return text;
        })
        .join('\n\n');
      parts.push(`## Examples\n${examplesText}`);
    }

    // Output format
    if (this._output) {
      const outputParts: string[] = [];
      
      if (this._output.format) {
        switch (this._output.format.type) {
          case 'json':
            if (this._output.format.jsonSchema) {
              outputParts.push(`Respond in valid JSON matching this schema:\n\`\`\`json\n${JSON.stringify(this._output.format.jsonSchema.schema, null, 2)}\n\`\`\``);
            } else {
              outputParts.push('Respond in valid JSON format.');
            }
            break;
          case 'markdown':
            outputParts.push('Format your response using Markdown.');
            break;
          case 'code':
            outputParts.push(`Respond with code${this._output.format.language ? ` in ${this._output.format.language}` : ''}.`);
            break;
          case 'table':
            outputParts.push('Format your response as a table.');
            break;
        }
      }
      if (this._output.length) {
        outputParts.push(`Keep your response ${this._output.length}.`);
      }
      if (this._output.style) {
        const styleMap: Record<OutputStyle, string> = {
          'prose': 'flowing prose',
          'bullet-points': 'bullet points',
          'numbered-list': 'a numbered list',
          'table': 'a table',
          'code': 'code',
          'mixed': 'a mix of prose and lists',
          'qa': 'Q&A format',
          'dialogue': 'dialogue format',
        };
        outputParts.push(`Structure as ${styleMap[this._output.style]}.`);
      }
      if (this._output.language) {
        outputParts.push(`Respond in ${this._output.language}.`);
      }
      if (this._output.includeExamples) {
        outputParts.push('Include relevant examples.');
      }
      if (this._output.includeExplanation) {
        outputParts.push('Include clear explanations.');
      }
      if (this._output.includeSources) {
        outputParts.push('Cite your sources.');
      }
      if (this._output.includeConfidence) {
        outputParts.push('Include your confidence level in the answer.');
      }
      
      if (outputParts.length) {
        parts.push(`## Output Format\n${outputParts.join('\n')}`);
      }
    }

    // Reasoning
    if (this._reasoning) {
      const reasoningParts: string[] = [];
      
      if (this._reasoning.style) {
        const styleInstructions: Record<ReasoningStyle, string> = {
          'step-by-step': 'Think through this step by step.',
          'chain-of-thought': 'Use chain-of-thought reasoning to work through the problem.',
          'tree-of-thought': 'Consider multiple approaches and evaluate each before deciding.',
          'direct': 'Provide a direct answer.',
          'analytical': 'Analyze the problem systematically.',
          'comparative': 'Compare different options or approaches.',
          'deductive': 'Use deductive reasoning from general principles.',
          'inductive': 'Use inductive reasoning from specific examples.',
          'first-principles': 'Reason from first principles, breaking down to fundamental truths.',
          'analogical': 'Use analogies to explain and reason about the problem.',
          'devil-advocate': 'Consider and argue against your own conclusions.',
        };
        reasoningParts.push(styleInstructions[this._reasoning.style]);
      }
      if (this._reasoning.showWork) {
        reasoningParts.push('Show your reasoning process.');
      }
      if (this._reasoning.verifyAnswer) {
        reasoningParts.push('Verify your answer before presenting it.');
      }
      if (this._reasoning.considerAlternatives) {
        reasoningParts.push('Consider alternative perspectives and solutions.');
      }
      if (this._reasoning.explainAssumptions) {
        reasoningParts.push('Explicitly state any assumptions you make.');
      }
      
      if (reasoningParts.length) {
        parts.push(`## Reasoning\n${reasoningParts.join('\n')}`);
      }
    }

    // Memory
    if (this._memory) {
      const memoryParts: string[] = [];
      
      if (this._memory.summary) {
        memoryParts.push(`Previous conversation summary: ${this._memory.summary}`);
      }
      if (this._memory.facts?.length) {
        memoryParts.push(`Known facts:\n${this._memory.facts.map(f => `- ${f}`).join('\n')}`);
      }
      if (this._memory.preferences?.length) {
        memoryParts.push(`User preferences:\n${this._memory.preferences.map(p => `- ${p}`).join('\n')}`);
      }
      
      if (memoryParts.length) {
        parts.push(`## Memory\n${memoryParts.join('\n')}`);
      }
    }

    // Custom parts
    if (this._customSystemParts.length) {
      parts.push(...this._customSystemParts);
    }

    return parts.join('\n\n');
  }

  build(): BuiltChatPrompt {
    const systemPrompt = this.buildSystemPrompt();
    
    // Ensure system message is first
    let messages = [...this._messages];
    const hasSystemMessage = messages.some(m => m.role === 'system');
    
    if (systemPrompt && !hasSystemMessage) {
      messages = [{ role: 'system', content: systemPrompt }, ...messages];
    } else if (systemPrompt && hasSystemMessage) {
      // Prepend built system prompt to existing system message
      messages = messages.map(m => 
        m.role === 'system' ? { ...m, content: `${systemPrompt}\n\n${m.content}` } : m
      );
    }

    // Add memory history if present
    if (this._memory?.history) {
      const systemIdx = messages.findIndex(m => m.role === 'system');
      const insertIdx = systemIdx >= 0 ? systemIdx + 1 : 0;
      messages.splice(insertIdx, 0, ...this._memory.history);
    }

    // Get user prompt if exists
    const userMessages = messages.filter(m => m.role === 'user');
    const userPrompt = userMessages.length ? userMessages[userMessages.length - 1].content : undefined;

    return {
      messages,
      systemPrompt,
      userPrompt,
      metadata: {
        persona: this._persona,
        context: this._context,
        task: this._task,
        output: this._output,
        reasoning: this._reasoning,
        examples: this._examples.length ? this._examples : undefined,
      },
    };
  }

  // --- Output Methods ---

  toString(): string {
    return this.buildSystemPrompt();
  }

  toSystemPrompt(): string {
    return this.buildSystemPrompt();
  }

  toMessages(): ChatMessage[] {
    return this.build().messages;
  }

  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }

  toYAML(): string {
    return objectToYaml(this.build());
  }

  toMarkdown(): string {
    const built = this.build();
    const sections: string[] = ['# Chat Prompt\n'];
    
    sections.push('## System Prompt\n```\n' + built.systemPrompt + '\n```\n');
    
    if (built.messages.length > 1) {
      sections.push('## Messages\n');
      for (const msg of built.messages) {
        if (msg.role === 'system') continue;
        sections.push(`**${msg.role.toUpperCase()}${msg.name ? ` (${msg.name})` : ''}:**\n${msg.content}\n`);
      }
    }
    
    return sections.join('\n');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function objectToYaml(obj: object, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      lines.push(`${spaces}${key}:`);
      for (const item of value) {
        if (typeof item === 'object') {
          lines.push(`${spaces}  -`);
          lines.push(objectToYaml(item, indent + 2).replace(/^/gm, '  '));
        } else {
          lines.push(`${spaces}  - ${item}`);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${spaces}${key}:`);
      lines.push(objectToYaml(value, indent + 1));
    } else if (typeof value === 'string' && value.includes('\n')) {
      lines.push(`${spaces}${key}: |`);
      for (const line of value.split('\n')) {
        lines.push(`${spaces}  ${line}`);
      }
    } else {
      lines.push(`${spaces}${key}: ${value}`);
    }
  }
  
  return lines.join('\n');
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new chat prompt builder
 */
export function chat(): ChatPromptBuilder {
  return new ChatPromptBuilder();
}

// ============================================================================
// PRESET BUILDERS
// ============================================================================

export const chatPresets = {
  /**
   * Code assistant preset
   */
  coder: (language?: string) => {
    const c = chat()
      .role("expert software developer")
      .expertise("coding")
      .tone("technical");
    
    if (language) {
      c.context(`Programming language: ${language}`);
    }
    
    return c;
  },

  /**
   * Writing assistant preset
   */
  writer: (style?: 'creative' | 'professional' | 'academic') => {
    const c = chat()
      .role("skilled writer and editor")
      .expertise("writing");
    
    if (style) {
      c.tone(style === 'creative' ? 'creative' : style === 'academic' ? 'academic' : 'professional');
    }
    
    return c;
  },

  /**
   * Teacher/tutor preset
   */
  tutor: (subject?: string) => {
    const c = chat()
      .role("patient and knowledgeable tutor")
      .expertise("teaching")
      .tone(['friendly', 'empathetic'])
      .stepByStep()
      .withExamples();
    
    if (subject) {
      c.domain(subject);
    }
    
    return c;
  },

  /**
   * Analyst preset
   */
  analyst: () => {
    return chat()
      .role("data analyst and researcher")
      .expertise("analysis")
      .tone("analytical")
      .chainOfThought()
      .detailed()
      .withSources();
  },

  /**
   * Socratic dialogue preset
   */
  socratic: () => {
    return chat()
      .role("Socratic philosopher and teacher")
      .tone("socratic")
      .reasoning({ style: 'deductive', showWork: true })
      .avoid(["Give direct answers", "Lecture", "Be condescending"]);
  },

  /**
   * Critic preset
   */
  critic: () => {
    return chat()
      .role("constructive critic")
      .tone(['analytical', 'professional'])
      .devilsAdvocate()
      .detailed()
      .avoid(["Be harsh", "Dismiss ideas without explanation"]);
  },

  /**
   * Brainstormer preset
   */
  brainstormer: () => {
    return chat()
      .role("creative brainstorming partner")
      .tone(['creative', 'encouraging'])
      .expertise("creative")
      .considerAlternatives()
      .avoid(["Dismiss ideas", "Be negative", "Limit creativity"]);
  },

  /**
   * JSON response preset
   */
  jsonResponder: (schemaName: string, schema: Record<string, unknown>) => {
    return chat()
      .role("data processing assistant")
      .tone("concise")
      .jsonSchema(schemaName, schema)
      .avoid(["Include markdown", "Add explanations outside JSON", "Include code fences"]);
  },

  /**
   * Summarizer preset
   */
  summarizer: (length: OutputLength = 'brief') => {
    return chat()
      .role("expert summarizer")
      .expertise("analysis")
      .tone("concise")
      .length(length)
      .task("Summarize the provided content, preserving key information");
  },

  /**
   * Translator preset
   */
  translator: (targetLanguage: string) => {
    return chat()
      .role("professional translator")
      .expertise("languages")
      .responseLanguage(targetLanguage)
      .avoid(["Add commentary", "Change meaning", "Omit content"]);
  },
};
