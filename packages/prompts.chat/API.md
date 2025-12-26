# API Reference

> Auto-generated from TypeScript source files

## Table of Contents

- [variables/index](#variables/index)
  - [detectVariables](#detectvariables)
  - [convertToSupportedFormat](#converttosupportedformat)
  - [convertAllVariables](#convertallvariables)
  - [getPatternDescription](#getpatterndescription)
  - [extractVariables](#extractvariables)
  - [compile](#compile)
- [similarity/index](#similarity/index)
  - [normalizeContent](#normalizecontent)
  - [calculateSimilarity](#calculatesimilarity)
  - [isSimilarContent](#issimilarcontent)
  - [getContentFingerprint](#getcontentfingerprint)
  - [findDuplicates](#findduplicates)
  - [deduplicate](#deduplicate)
- [quality/index](#quality/index)
  - [check](#check)
  - [validate](#validate)
  - [isValid](#isvalid)
  - [getSuggestions](#getsuggestions)
- [parser/index](#parser/index)
  - [parse](#parse)
  - [toYaml](#toyaml)
  - [toJson](#tojson)
  - [getSystemPrompt](#getsystemprompt)
  - [interpolate](#interpolate)
- [builder/index](#builder/index)
  - [PromptBuilder](#promptbuilder)
  - [builder](#builder)
  - [fromPrompt](#fromprompt)
- [builder/chat](#builder/chat)
  - [ChatPromptBuilder](#chatpromptbuilder)
  - [chat](#chat)
- [builder/media](#builder/media)
  - [ImagePromptBuilder](#imagepromptbuilder)
  - [image](#image)
- [builder/video](#builder/video)
  - [VideoPromptBuilder](#videopromptbuilder)
  - [video](#video)
- [builder/audio](#builder/audio)
  - [AudioPromptBuilder](#audiopromptbuilder)
  - [audio](#audio)

---

## variables/index

Variable Detection Utility
Detects common variable-like patterns in text that could be converted
to our supported format: ${variableName} or ${variableName:default}

### Types

#### `VariablePattern`

```typescript
type VariablePattern = | "double_bracket"      // [[name]] or [[ name ]]
  | "double_curly"        // {{name}} or {{ name }}
  | "single_bracket"      // [NAME] or [name]
  | "single_curly"        // {NAME} or {name}
  | "angle_bracket"       // <NAME> or <name>
  | "percent"             // %NAME% or %name%
  | "dollar_curly"
```

### Interfaces

#### `DetectedVariable`

Variable Detection Utility
Detects common variable-like patterns in text that could be converted
to our supported format: ${variableName} or ${variableName:default}

| Property | Type | Description |
|----------|------|-------------|
| `original` | `string` | - |
| `name` | `string` | - |
| `defaultValue` | `string` | - |
| `pattern` | `VariablePattern` | - |
| `startIndex` | `number` | - |
| `endIndex` | `number` | - |

### Functions

#### `detectVariables()`

Detect variable-like patterns in text
Returns detected variables that are NOT in our supported format

```typescript
detectVariables(text: string): DetectedVariable[]
```

**Parameters:**

- `text`: `string`

**Returns:** `DetectedVariable[]`

#### `convertToSupportedFormat()`

Convert a detected variable to our supported format

```typescript
convertToSupportedFormat(variable: DetectedVariable): string
```

**Parameters:**

- `variable`: `DetectedVariable`

**Returns:** `string`

#### `convertAllVariables()`

Convert all detected variables in text to our supported format

```typescript
convertAllVariables(text: string): string
```

**Parameters:**

- `text`: `string`

**Returns:** `string`

#### `getPatternDescription()`

Get a human-readable pattern description

```typescript
getPatternDescription(pattern: VariablePattern): string
```

**Parameters:**

- `pattern`: `VariablePattern`

**Returns:** `string`

#### `extractVariables()`

Extract variables from our supported ${var} or ${var:default} format

```typescript
extractVariables(text: string): Array<{ name: string; defaultValue?: string }>
```

**Parameters:**

- `text`: `string`

**Returns:** `Array<{ name: string; defaultValue?: string }>`

#### `compile()`

Compile a prompt template with variable values

```typescript
compile(template: string, values: Record<string, string>, options?: { useDefaults?: boolean }): string
```

**Parameters:**

- `template`: `string`
- `values`: `Record<string, string>`
- `options`: `{ useDefaults?: boolean }` (optional) = `{}`

**Returns:** `string`

### Constants

#### `normalize`

Alias for convertAllVariables - normalizes all variable formats to ${var}

```typescript
normalize = convertAllVariables
```

#### `detect`

Alias for detectVariables

```typescript
detect = detectVariables
```

---

## similarity/index

Content similarity utilities for duplicate detection

### Functions

#### `normalizeContent()`

Content similarity utilities for duplicate detection

```typescript
normalizeContent(content: string): string
```

**Parameters:**

- `content`: `string`

**Returns:** `string`

#### `calculateSimilarity()`

Combined similarity score using multiple algorithms
Returns a value between 0 (completely different) and 1 (identical)

```typescript
calculateSimilarity(content1: string, content2: string): number
```

**Parameters:**

- `content1`: `string`
- `content2`: `string`

**Returns:** `number`

#### `isSimilarContent()`

Check if two contents are similar enough to be considered duplicates
Default threshold is 0.85 (85% similar)

```typescript
isSimilarContent(content1: string, content2: string, threshold?: number): boolean
```

**Parameters:**

- `content1`: `string`
- `content2`: `string`
- `threshold`: `number` (optional) = `0.85`

**Returns:** `boolean`

#### `getContentFingerprint()`

Get normalized content hash for database indexing/comparison
This is a simple hash for quick lookups before full similarity check

```typescript
getContentFingerprint(content: string): string
```

**Parameters:**

- `content`: `string`

**Returns:** `string`

#### `findDuplicates()`

Find duplicates in an array of prompts
Returns groups of similar prompts

```typescript
findDuplicates(prompts: T[], threshold?: number): T[][]
```

**Parameters:**

- `prompts`: `T[]`
- `threshold`: `number` (optional) = `0.85`

**Returns:** `T[][]`

#### `deduplicate()`

Deduplicate an array of prompts, keeping the first occurrence

```typescript
deduplicate(prompts: T[], threshold?: number): T[]
```

**Parameters:**

- `prompts`: `T[]`
- `threshold`: `number` (optional) = `0.85`

**Returns:** `T[]`

### Constants

#### `calculate`

Alias for calculateSimilarity

```typescript
calculate = calculateSimilarity
```

#### `isDuplicate`

Alias for isSimilarContent

```typescript
isDuplicate = isSimilarContent
```

---

## quality/index

Prompt Quality Checker - Local validation for prompt quality

@example
```ts
import { quality } from 'prompts.chat';

const result = quality.check("Act as a developer...");
console.log(result.score); // 0.85
console.log(result.issues); // []
```

### Interfaces

#### `QualityIssue`

Prompt Quality Checker - Local validation for prompt quality

| Property | Type | Description |
|----------|------|-------------|
| `type` | `'error' | 'warning' | 'suggestion'` | - |
| `code` | `string` | - |
| `message` | `string` | - |
| `position` | `{ start: number; end: number }` | - |

#### `QualityResult`

| Property | Type | Description |
|----------|------|-------------|
| `valid` | `boolean` | - |
| `score` | `number` | - |
| `issues` | `QualityIssue[]` | - |
| `stats` | `unknown` | - |

### Functions

#### `check()`

Check prompt quality locally (no API needed)

```typescript
check(prompt: string): QualityResult
```

**Parameters:**

- `prompt`: `string`

**Returns:** `QualityResult`

#### `validate()`

Validate a prompt and throw if invalid

```typescript
validate(prompt: string): void
```

**Parameters:**

- `prompt`: `string`

#### `isValid()`

Check if a prompt is valid

```typescript
isValid(prompt: string): boolean
```

**Parameters:**

- `prompt`: `string`

**Returns:** `boolean`

#### `getSuggestions()`

Get suggestions for improving a prompt

```typescript
getSuggestions(prompt: string): string[]
```

**Parameters:**

- `prompt`: `string`

**Returns:** `string[]`

---

## parser/index

Prompt Parser - Parse and load prompt files in various formats

Supports:
- .prompt.yml / .prompt.yaml (YAML format)
- .prompt.json (JSON format)
- .prompt.md (Markdown with frontmatter)
- .txt (Plain text)

@example
```ts
import { parser } from 'prompts.chat';

const prompt = parser.parse(`
name: Code Review
messages:
  - role: system
    content: You are a code reviewer.
`);
```

### Interfaces

#### `PromptMessage`

Prompt Parser - Parse and load prompt files in various formats

Supports:
- .prompt.yml / .prompt.yaml (YAML format)
- .prompt.json (JSON format)
- .prompt.md (Markdown with frontmatter)
- .txt (Plain text)

| Property | Type | Description |
|----------|------|-------------|
| `role` | `'system' | 'user' | 'assistant'` | - |
| `content` | `string` | - |

#### `ParsedPrompt`

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | - |
| `description` | `string` | - |
| `model` | `string` | - |
| `modelParameters` | `unknown` | - |
| `messages` | `PromptMessage[]` | - |
| `variables` | `unknown` | - |
| `metadata` | `Record<string, unknown>` | - |

### Functions

#### `parse()`

Parse prompt content in various formats

```typescript
parse(content: string, format?: 'yaml' | 'json' | 'markdown' | 'text'): ParsedPrompt
```

**Parameters:**

- `content`: `string`
- `format`: `'yaml' | 'json' | 'markdown' | 'text'` (optional)

**Returns:** `ParsedPrompt`

#### `toYaml()`

Serialize a ParsedPrompt to YAML format

```typescript
toYaml(prompt: ParsedPrompt): string
```

**Parameters:**

- `prompt`: `ParsedPrompt`

**Returns:** `string`

#### `toJson()`

Serialize a ParsedPrompt to JSON format

```typescript
toJson(prompt: ParsedPrompt, pretty?: boolean): string
```

**Parameters:**

- `prompt`: `ParsedPrompt`
- `pretty`: `boolean` (optional) = `true`

**Returns:** `string`

#### `getSystemPrompt()`

Get the system message content from a parsed prompt

```typescript
getSystemPrompt(prompt: ParsedPrompt): string
```

**Parameters:**

- `prompt`: `ParsedPrompt`

**Returns:** `string`

#### `interpolate()`

Interpolate variables in a prompt

```typescript
interpolate(prompt: ParsedPrompt, values: Record<string, string>): ParsedPrompt
```

**Parameters:**

- `prompt`: `ParsedPrompt`
- `values`: `Record<string, string>`

**Returns:** `ParsedPrompt`

---

## builder/index

Prompt Builder - A fluent DSL for creating structured prompts

@example
```ts
import { builder } from 'prompts.chat';

const prompt = builder()
  .role("Senior TypeScript Developer")
  .context("You are helping review code")
  .task("Analyze the following code for bugs")
  .constraints(["Be concise", "Focus on critical issues"])
  .output("JSON with { bugs: [], suggestions: [] }")
  .variable("code", { required: true })
  .build();
```

### Interfaces

#### `PromptVariable`

Prompt Builder - A fluent DSL for creating structured prompts

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | - |
| `description` | `string` | - |
| `required` | `boolean` | - |
| `defaultValue` | `string` | - |

#### `BuiltPrompt`

| Property | Type | Description |
|----------|------|-------------|
| `content` | `string` | - |
| `variables` | `PromptVariable[]` | - |
| `metadata` | `unknown` | - |

### Classes

#### `PromptBuilder`

**Methods:**

| Method | Description |
|--------|-------------|
| `role(role: string): this` | Set the role/persona for the AI |
| `persona(persona: string): this` | Alias for role() |
| `context(context: string): this` | Set the context/background information |
| `background(background: string): this` | Alias for context() |
| `task(task: string): this` | Set the main task/instruction |
| `instruction(instruction: string): this` | Alias for task() |
| `constraints(constraints: string[]): this` | Add constraints/rules the AI should follow |
| `constraint(constraint: string): this` | Add a single constraint |
| `rules(rules: string[]): this` | Alias for constraints() |
| `output(format: string): this` | Set the expected output format |
| `format(format: string): this` | Alias for output() |
| `example(input: string, output: string): this` | Add an example input/output pair |
| `examples(examples: Array<{ input: string; output: string }>): this` | Add multiple examples |
| `variable(name: string, options?: { description?: string; required?: boolean; defaultValue?: string }): this` | Define a variable placeholder |
| `section(title: string, content: string): this` | Add a custom section |
| `raw(content: string): this` | Set raw content (bypasses structured building) |
| `build(): BuiltPrompt` | Build the final prompt |
| `toString(): string` | Build and return only the content string |

##### `role()`

Set the role/persona for the AI

```typescript
role(role: string): this
```

**Parameters:**

- `role`: `string`

**Returns:** `this`

##### `persona()`

Alias for role()

```typescript
persona(persona: string): this
```

**Parameters:**

- `persona`: `string`

**Returns:** `this`

##### `context()`

Set the context/background information

```typescript
context(context: string): this
```

**Parameters:**

- `context`: `string`

**Returns:** `this`

##### `background()`

Alias for context()

```typescript
background(background: string): this
```

**Parameters:**

- `background`: `string`

**Returns:** `this`

##### `task()`

Set the main task/instruction

```typescript
task(task: string): this
```

**Parameters:**

- `task`: `string`

**Returns:** `this`

##### `instruction()`

Alias for task()

```typescript
instruction(instruction: string): this
```

**Parameters:**

- `instruction`: `string`

**Returns:** `this`

##### `constraints()`

Add constraints/rules the AI should follow

```typescript
constraints(constraints: string[]): this
```

**Parameters:**

- `constraints`: `string[]`

**Returns:** `this`

##### `constraint()`

Add a single constraint

```typescript
constraint(constraint: string): this
```

**Parameters:**

- `constraint`: `string`

**Returns:** `this`

##### `rules()`

Alias for constraints()

```typescript
rules(rules: string[]): this
```

**Parameters:**

- `rules`: `string[]`

**Returns:** `this`

##### `output()`

Set the expected output format

```typescript
output(format: string): this
```

**Parameters:**

- `format`: `string`

**Returns:** `this`

##### `format()`

Alias for output()

```typescript
format(format: string): this
```

**Parameters:**

- `format`: `string`

**Returns:** `this`

##### `example()`

Add an example input/output pair

```typescript
example(input: string, output: string): this
```

**Parameters:**

- `input`: `string`
- `output`: `string`

**Returns:** `this`

##### `examples()`

Add multiple examples

```typescript
examples(examples: Array<{ input: string; output: string }>): this
```

**Parameters:**

- `examples`: `Array<{ input: string; output: string }>`

**Returns:** `this`

##### `variable()`

Define a variable placeholder

```typescript
variable(name: string, options?: { description?: string; required?: boolean; defaultValue?: string }): this
```

**Parameters:**

- `name`: `string`
- `options`: `{ description?: string; required?: boolean; defaultValue?: string }` (optional) = `{}`

**Returns:** `this`

##### `section()`

Add a custom section

```typescript
section(title: string, content: string): this
```

**Parameters:**

- `title`: `string`
- `content`: `string`

**Returns:** `this`

##### `raw()`

Set raw content (bypasses structured building)

```typescript
raw(content: string): this
```

**Parameters:**

- `content`: `string`

**Returns:** `this`

##### `build()`

Build the final prompt

```typescript
build(): BuiltPrompt
```

**Returns:** `BuiltPrompt`

##### `toString()`

Build and return only the content string

```typescript
toString(): string
```

**Returns:** `string`

### Functions

#### `builder()`

Create a new prompt builder

```typescript
builder(): PromptBuilder
```

**Returns:** `PromptBuilder`

#### `fromPrompt()`

Create a prompt builder from an existing prompt

```typescript
fromPrompt(content: string): PromptBuilder
```

**Parameters:**

- `content`: `string`

**Returns:** `PromptBuilder`

### Constants

#### `templates`

```typescript
templates
```

---

## builder/chat

Chat Prompt Builder - Model-Agnostic Conversation Prompt Builder

Build structured prompts for any chat/conversation model.
Focus on prompt engineering, not model-specific features.

@example
```ts
import { chat } from 'prompts.chat/builder';

const prompt = chat()
  .role("helpful coding assistant")
  .context("Building a React application")
  .task("Explain async/await in JavaScript")
  .stepByStep()
  .detailed()
  .build();
```

### Types

#### `MessageRole`

Chat Prompt Builder - Model-Agnostic Conversation Prompt Builder

Build structured prompts for any chat/conversation model.
Focus on prompt engineering, not model-specific features.

```typescript
type MessageRole = 'system' | 'user' | 'assistant'
```

#### `ResponseFormatType`

```typescript
type ResponseFormatType = 'text' | 'json' | 'markdown' | 'code' | 'table'
```

#### `PersonaTone`

```typescript
type PersonaTone = | 'professional' | 'casual' | 'formal' | 'friendly' | 'academic'
  | 'technical' | 'creative' | 'empathetic' | 'authoritative' | 'playful'
  | 'concise' | 'detailed' | 'socratic' | 'coaching' | 'analytical'
  | 'encouraging' | 'neutral' | 'humorous' | 'serious'
```

#### `PersonaExpertise`

```typescript
type PersonaExpertise = | 'general' | 'coding' | 'writing' | 'analysis' | 'research'
  | 'teaching' | 'counseling' | 'creative' | 'legal' | 'medical'
  | 'financial' | 'scientific' | 'engineering' | 'design' | 'marketing'
  | 'business' | 'philosophy' | 'history' | 'languages' | 'mathematics'
```

#### `ReasoningStyle`

```typescript
type ReasoningStyle = | 'step-by-step' | 'chain-of-thought' | 'tree-of-thought' 
  | 'direct' | 'analytical' | 'comparative' | 'deductive' | 'inductive'
  | 'first-principles' | 'analogical' | 'devil-advocate'
```

#### `OutputLength`

```typescript
type OutputLength = 'brief' | 'moderate' | 'detailed' | 'comprehensive' | 'exhaustive'
```

#### `OutputStyle`

```typescript
type OutputStyle = 'prose' | 'bullet-points' | 'numbered-list' | 'table' | 'code' | 'mixed' | 'qa' | 'dialogue'
```

### Interfaces

#### `ChatMessage`

| Property | Type | Description |
|----------|------|-------------|
| `role` | `MessageRole` | - |
| `content` | `string` | - |
| `name` | `string` | - |

#### `JsonSchema`

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | - |
| `description` | `string` | - |
| `schema` | `Record<string, unknown>` | - |

#### `ResponseFormat`

| Property | Type | Description |
|----------|------|-------------|
| `type` | `ResponseFormatType` | - |
| `jsonSchema` | `JsonSchema` | - |
| `language` | `string` | - |

#### `ChatPersona`

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | - |
| `role` | `string` | - |
| `tone` | `PersonaTone | PersonaTone[]` | - |
| `expertise` | `PersonaExpertise | PersonaExpertise[]` | - |
| `personality` | `string[]` | - |
| `background` | `string` | - |
| `language` | `string` | - |
| `verbosity` | `OutputLength` | - |

#### `ChatContext`

| Property | Type | Description |
|----------|------|-------------|
| `background` | `string` | - |
| `domain` | `string` | - |
| `audience` | `string` | - |
| `purpose` | `string` | - |
| `constraints` | `string[]` | - |
| `assumptions` | `string[]` | - |
| `knowledge` | `string[]` | - |

#### `ChatTask`

| Property | Type | Description |
|----------|------|-------------|
| `instruction` | `string` | - |
| `steps` | `string[]` | - |
| `deliverables` | `string[]` | - |
| `criteria` | `string[]` | - |
| `antiPatterns` | `string[]` | - |
| `priority` | `'accuracy' | 'speed' | 'creativity' | 'thoroughness'` | - |

#### `ChatOutput`

| Property | Type | Description |
|----------|------|-------------|
| `format` | `ResponseFormat` | - |
| `length` | `OutputLength` | - |
| `style` | `OutputStyle` | - |
| `language` | `string` | - |
| `includeExplanation` | `boolean` | - |
| `includeExamples` | `boolean` | - |
| `includeSources` | `boolean` | - |
| `includeConfidence` | `boolean` | - |

#### `ChatReasoning`

| Property | Type | Description |
|----------|------|-------------|
| `style` | `ReasoningStyle` | - |
| `showWork` | `boolean` | - |
| `verifyAnswer` | `boolean` | - |
| `considerAlternatives` | `boolean` | - |
| `explainAssumptions` | `boolean` | - |

#### `ChatExample`

| Property | Type | Description |
|----------|------|-------------|
| `input` | `string` | - |
| `output` | `string` | - |
| `explanation` | `string` | - |

#### `ChatMemory`

| Property | Type | Description |
|----------|------|-------------|
| `summary` | `string` | - |
| `facts` | `string[]` | - |
| `preferences` | `string[]` | - |
| `history` | `ChatMessage[]` | - |

#### `BuiltChatPrompt`

| Property | Type | Description |
|----------|------|-------------|
| `messages` | `ChatMessage[]` | - |
| `systemPrompt` | `string` | - |
| `userPrompt` | `string` | - |
| `metadata` | `unknown` | - |

### Classes

#### `ChatPromptBuilder`

**Methods:**

| Method | Description |
|--------|-------------|
| `system(content: string): this` | - |
| `user(content: string, name?: string): this` | - |
| `assistant(content: string): this` | - |
| `message(role: MessageRole, content: string, name?: string): this` | - |
| `messages(messages: ChatMessage[]): this` | - |
| `conversation(turns: Array<{ user: string; assistant?: string }>): this` | - |
| `persona(settings: ChatPersona | string): this` | - |
| `role(role: string): this` | - |
| `tone(tone: PersonaTone | PersonaTone[]): this` | - |
| `expertise(expertise: PersonaExpertise | PersonaExpertise[]): this` | - |
| `personality(traits: string[]): this` | - |
| `background(background: string): this` | - |
| `speakAs(name: string): this` | - |
| `responseLanguage(language: string): this` | - |
| `context(settings: ChatContext | string): this` | - |
| `domain(domain: string): this` | - |
| `audience(audience: string): this` | - |
| `purpose(purpose: string): this` | - |
| `constraints(constraints: string[]): this` | - |
| `constraint(constraint: string): this` | - |
| `assumptions(assumptions: string[]): this` | - |
| `knowledge(facts: string[]): this` | - |
| `task(instruction: string | ChatTask): this` | - |
| `instruction(instruction: string): this` | - |
| `steps(steps: string[]): this` | - |
| `deliverables(deliverables: string[]): this` | - |
| `criteria(criteria: string[]): this` | - |
| `avoid(antiPatterns: string[]): this` | - |
| `priority(priority: ChatTask['priority']): this` | - |
| `example(input: string, output: string, explanation?: string): this` | - |
| `examples(examples: ChatExample[]): this` | - |
| `fewShot(examples: Array<{ input: string; output: string }>): this` | - |
| `output(settings: ChatOutput): this` | - |
| `outputFormat(format: ResponseFormatType): this` | - |
| `json(schema?: JsonSchema): this` | - |
| `jsonSchema(name: string, schema: Record<string, unknown>, description?: string): this` | - |
| `markdown(): this` | - |
| `code(language?: string): this` | - |
| `table(): this` | - |
| `length(length: OutputLength): this` | - |
| `style(style: OutputStyle): this` | - |
| `brief(): this` | - |
| `moderate(): this` | - |
| `detailed(): this` | - |
| `comprehensive(): this` | - |
| `exhaustive(): this` | - |
| `withExamples(): this` | - |
| `withExplanation(): this` | - |
| `withSources(): this` | - |
| `withConfidence(): this` | - |
| `reasoning(settings: ChatReasoning): this` | - |
| `reasoningStyle(style: ReasoningStyle): this` | - |
| `stepByStep(): this` | - |
| `chainOfThought(): this` | - |
| `treeOfThought(): this` | - |
| `firstPrinciples(): this` | - |
| `devilsAdvocate(): this` | - |
| `showWork(show?: any): this` | - |
| `verifyAnswer(verify?: any): this` | - |
| `considerAlternatives(consider?: any): this` | - |
| `explainAssumptions(explain?: any): this` | - |
| `memory(memory: ChatMemory): this` | - |
| `remember(facts: string[]): this` | - |
| `preferences(prefs: string[]): this` | - |
| `history(messages: ChatMessage[]): this` | - |
| `summarizeHistory(summary: string): this` | - |
| `addSystemPart(part: string): this` | - |
| `raw(content: string): this` | - |
| `build(): BuiltChatPrompt` | - |
| `toString(): string` | - |
| `toSystemPrompt(): string` | - |
| `toMessages(): ChatMessage[]` | - |
| `toJSON(): string` | - |
| `toYAML(): string` | - |
| `toMarkdown(): string` | - |

##### `system()`

```typescript
system(content: string): this
```

**Parameters:**

- `content`: `string`

**Returns:** `this`

##### `user()`

```typescript
user(content: string, name?: string): this
```

**Parameters:**

- `content`: `string`
- `name`: `string` (optional)

**Returns:** `this`

##### `assistant()`

```typescript
assistant(content: string): this
```

**Parameters:**

- `content`: `string`

**Returns:** `this`

##### `message()`

```typescript
message(role: MessageRole, content: string, name?: string): this
```

**Parameters:**

- `role`: `MessageRole`
- `content`: `string`
- `name`: `string` (optional)

**Returns:** `this`

##### `messages()`

```typescript
messages(messages: ChatMessage[]): this
```

**Parameters:**

- `messages`: `ChatMessage[]`

**Returns:** `this`

##### `conversation()`

```typescript
conversation(turns: Array<{ user: string; assistant?: string }>): this
```

**Parameters:**

- `turns`: `Array<{ user: string; assistant?: string }>`

**Returns:** `this`

##### `persona()`

```typescript
persona(settings: ChatPersona | string): this
```

**Parameters:**

- `settings`: `ChatPersona | string`

**Returns:** `this`

##### `role()`

```typescript
role(role: string): this
```

**Parameters:**

- `role`: `string`

**Returns:** `this`

##### `tone()`

```typescript
tone(tone: PersonaTone | PersonaTone[]): this
```

**Parameters:**

- `tone`: `PersonaTone | PersonaTone[]`

**Returns:** `this`

##### `expertise()`

```typescript
expertise(expertise: PersonaExpertise | PersonaExpertise[]): this
```

**Parameters:**

- `expertise`: `PersonaExpertise | PersonaExpertise[]`

**Returns:** `this`

##### `personality()`

```typescript
personality(traits: string[]): this
```

**Parameters:**

- `traits`: `string[]`

**Returns:** `this`

##### `background()`

```typescript
background(background: string): this
```

**Parameters:**

- `background`: `string`

**Returns:** `this`

##### `speakAs()`

```typescript
speakAs(name: string): this
```

**Parameters:**

- `name`: `string`

**Returns:** `this`

##### `responseLanguage()`

```typescript
responseLanguage(language: string): this
```

**Parameters:**

- `language`: `string`

**Returns:** `this`

##### `context()`

```typescript
context(settings: ChatContext | string): this
```

**Parameters:**

- `settings`: `ChatContext | string`

**Returns:** `this`

##### `domain()`

```typescript
domain(domain: string): this
```

**Parameters:**

- `domain`: `string`

**Returns:** `this`

##### `audience()`

```typescript
audience(audience: string): this
```

**Parameters:**

- `audience`: `string`

**Returns:** `this`

##### `purpose()`

```typescript
purpose(purpose: string): this
```

**Parameters:**

- `purpose`: `string`

**Returns:** `this`

##### `constraints()`

```typescript
constraints(constraints: string[]): this
```

**Parameters:**

- `constraints`: `string[]`

**Returns:** `this`

##### `constraint()`

```typescript
constraint(constraint: string): this
```

**Parameters:**

- `constraint`: `string`

**Returns:** `this`

##### `assumptions()`

```typescript
assumptions(assumptions: string[]): this
```

**Parameters:**

- `assumptions`: `string[]`

**Returns:** `this`

##### `knowledge()`

```typescript
knowledge(facts: string[]): this
```

**Parameters:**

- `facts`: `string[]`

**Returns:** `this`

##### `task()`

```typescript
task(instruction: string | ChatTask): this
```

**Parameters:**

- `instruction`: `string | ChatTask`

**Returns:** `this`

##### `instruction()`

```typescript
instruction(instruction: string): this
```

**Parameters:**

- `instruction`: `string`

**Returns:** `this`

##### `steps()`

```typescript
steps(steps: string[]): this
```

**Parameters:**

- `steps`: `string[]`

**Returns:** `this`

##### `deliverables()`

```typescript
deliverables(deliverables: string[]): this
```

**Parameters:**

- `deliverables`: `string[]`

**Returns:** `this`

##### `criteria()`

```typescript
criteria(criteria: string[]): this
```

**Parameters:**

- `criteria`: `string[]`

**Returns:** `this`

##### `avoid()`

```typescript
avoid(antiPatterns: string[]): this
```

**Parameters:**

- `antiPatterns`: `string[]`

**Returns:** `this`

##### `priority()`

```typescript
priority(priority: ChatTask['priority']): this
```

**Parameters:**

- `priority`: `ChatTask['priority']`

**Returns:** `this`

##### `example()`

```typescript
example(input: string, output: string, explanation?: string): this
```

**Parameters:**

- `input`: `string`
- `output`: `string`
- `explanation`: `string` (optional)

**Returns:** `this`

##### `examples()`

```typescript
examples(examples: ChatExample[]): this
```

**Parameters:**

- `examples`: `ChatExample[]`

**Returns:** `this`

##### `fewShot()`

```typescript
fewShot(examples: Array<{ input: string; output: string }>): this
```

**Parameters:**

- `examples`: `Array<{ input: string; output: string }>`

**Returns:** `this`

##### `output()`

```typescript
output(settings: ChatOutput): this
```

**Parameters:**

- `settings`: `ChatOutput`

**Returns:** `this`

##### `outputFormat()`

```typescript
outputFormat(format: ResponseFormatType): this
```

**Parameters:**

- `format`: `ResponseFormatType`

**Returns:** `this`

##### `json()`

```typescript
json(schema?: JsonSchema): this
```

**Parameters:**

- `schema`: `JsonSchema` (optional)

**Returns:** `this`

##### `jsonSchema()`

```typescript
jsonSchema(name: string, schema: Record<string, unknown>, description?: string): this
```

**Parameters:**

- `name`: `string`
- `schema`: `Record<string, unknown>`
- `description`: `string` (optional)

**Returns:** `this`

##### `markdown()`

```typescript
markdown(): this
```

**Returns:** `this`

##### `code()`

```typescript
code(language?: string): this
```

**Parameters:**

- `language`: `string` (optional)

**Returns:** `this`

##### `table()`

```typescript
table(): this
```

**Returns:** `this`

##### `length()`

```typescript
length(length: OutputLength): this
```

**Parameters:**

- `length`: `OutputLength`

**Returns:** `this`

##### `style()`

```typescript
style(style: OutputStyle): this
```

**Parameters:**

- `style`: `OutputStyle`

**Returns:** `this`

##### `brief()`

```typescript
brief(): this
```

**Returns:** `this`

##### `moderate()`

```typescript
moderate(): this
```

**Returns:** `this`

##### `detailed()`

```typescript
detailed(): this
```

**Returns:** `this`

##### `comprehensive()`

```typescript
comprehensive(): this
```

**Returns:** `this`

##### `exhaustive()`

```typescript
exhaustive(): this
```

**Returns:** `this`

##### `withExamples()`

```typescript
withExamples(): this
```

**Returns:** `this`

##### `withExplanation()`

```typescript
withExplanation(): this
```

**Returns:** `this`

##### `withSources()`

```typescript
withSources(): this
```

**Returns:** `this`

##### `withConfidence()`

```typescript
withConfidence(): this
```

**Returns:** `this`

##### `reasoning()`

```typescript
reasoning(settings: ChatReasoning): this
```

**Parameters:**

- `settings`: `ChatReasoning`

**Returns:** `this`

##### `reasoningStyle()`

```typescript
reasoningStyle(style: ReasoningStyle): this
```

**Parameters:**

- `style`: `ReasoningStyle`

**Returns:** `this`

##### `stepByStep()`

```typescript
stepByStep(): this
```

**Returns:** `this`

##### `chainOfThought()`

```typescript
chainOfThought(): this
```

**Returns:** `this`

##### `treeOfThought()`

```typescript
treeOfThought(): this
```

**Returns:** `this`

##### `firstPrinciples()`

```typescript
firstPrinciples(): this
```

**Returns:** `this`

##### `devilsAdvocate()`

```typescript
devilsAdvocate(): this
```

**Returns:** `this`

##### `showWork()`

```typescript
showWork(show?: any): this
```

**Parameters:**

- `show`: `any` (optional) = `true`

**Returns:** `this`

##### `verifyAnswer()`

```typescript
verifyAnswer(verify?: any): this
```

**Parameters:**

- `verify`: `any` (optional) = `true`

**Returns:** `this`

##### `considerAlternatives()`

```typescript
considerAlternatives(consider?: any): this
```

**Parameters:**

- `consider`: `any` (optional) = `true`

**Returns:** `this`

##### `explainAssumptions()`

```typescript
explainAssumptions(explain?: any): this
```

**Parameters:**

- `explain`: `any` (optional) = `true`

**Returns:** `this`

##### `memory()`

```typescript
memory(memory: ChatMemory): this
```

**Parameters:**

- `memory`: `ChatMemory`

**Returns:** `this`

##### `remember()`

```typescript
remember(facts: string[]): this
```

**Parameters:**

- `facts`: `string[]`

**Returns:** `this`

##### `preferences()`

```typescript
preferences(prefs: string[]): this
```

**Parameters:**

- `prefs`: `string[]`

**Returns:** `this`

##### `history()`

```typescript
history(messages: ChatMessage[]): this
```

**Parameters:**

- `messages`: `ChatMessage[]`

**Returns:** `this`

##### `summarizeHistory()`

```typescript
summarizeHistory(summary: string): this
```

**Parameters:**

- `summary`: `string`

**Returns:** `this`

##### `addSystemPart()`

```typescript
addSystemPart(part: string): this
```

**Parameters:**

- `part`: `string`

**Returns:** `this`

##### `raw()`

```typescript
raw(content: string): this
```

**Parameters:**

- `content`: `string`

**Returns:** `this`

##### `build()`

```typescript
build(): BuiltChatPrompt
```

**Returns:** `BuiltChatPrompt`

##### `toString()`

```typescript
toString(): string
```

**Returns:** `string`

##### `toSystemPrompt()`

```typescript
toSystemPrompt(): string
```

**Returns:** `string`

##### `toMessages()`

```typescript
toMessages(): ChatMessage[]
```

**Returns:** `ChatMessage[]`

##### `toJSON()`

```typescript
toJSON(): string
```

**Returns:** `string`

##### `toYAML()`

```typescript
toYAML(): string
```

**Returns:** `string`

##### `toMarkdown()`

```typescript
toMarkdown(): string
```

**Returns:** `string`

### Functions

#### `chat()`

Create a new chat prompt builder

```typescript
chat(): ChatPromptBuilder
```

**Returns:** `ChatPromptBuilder`

### Constants

#### `chatPresets`

```typescript
chatPresets
```

---

## builder/media

Media Prompt Builders - The D3.js of Prompt Building

Comprehensive, structured builders for Image, Video, and Audio generation prompts.
Every attribute a professional would consider is available as a chainable method.

@example
```ts
import { image, video, audio } from 'prompts.chat/builder';

const imagePrompt = image()
  .subject("a lone samurai")
  .environment("bamboo forest at dawn")
  .camera({ angle: "low", shot: "wide", lens: "35mm" })
  .lighting({ type: "rim", time: "golden-hour" })
  .style({ artist: "Akira Kurosawa", medium: "cinematic" })
  .build();
```

### Types

#### `OutputFormat`

Media Prompt Builders - The D3.js of Prompt Building

Comprehensive, structured builders for Image, Video, and Audio generation prompts.
Every attribute a professional would consider is available as a chainable method.

```typescript
type OutputFormat = 'text' | 'json' | 'yaml' | 'markdown'
```

#### `CameraBrand`

```typescript
type CameraBrand = | 'sony' | 'canon' | 'nikon' | 'fujifilm' | 'leica' | 'hasselblad' | 'phase-one'
  | 'panasonic' | 'olympus' | 'pentax' | 'red' | 'arri' | 'blackmagic' | 'panavision'
```

#### `CameraModel`

```typescript
type CameraModel = | 'sony-a7iv' | 'sony-a7riv' | 'sony-a7siii' | 'sony-a1' | 'sony-fx3' | 'sony-fx6'
  | 'sony-venice' | 'sony-venice-2' | 'sony-a9ii' | 'sony-zv-e1'
  // Canon
  | 'canon-r5' | 'canon-r6' | 'canon-r3' | 'canon-r8' | 'canon-c70' | 'canon-c300-iii'
  | 'canon-c500-ii' | 'canon-5d-iv' | 'canon-1dx-iii' | 'canon-eos-r5c'
  // Nikon
  | 'nikon-z9' | 'nikon-z8' | 'nikon-z6-iii' | 'nikon-z7-ii' | 'nikon-d850' | 'nikon-d6'
  // Fujifilm
  | 'fujifilm-x-t5' | 'fujifilm-x-h2s' | 'fujifilm-x100vi' | 'fujifilm-gfx100s'
  | 'fujifilm-gfx100-ii' | 'fujifilm-x-pro3'
  // Leica
  | 'leica-m11' | 'leica-sl2' | 'leica-sl2-s' | 'leica-q3' | 'leica-m10-r'
  // Hasselblad
  | 'hasselblad-x2d' | 'hasselblad-907x' | 'hasselblad-h6d-100c'
  // Cinema Cameras
  | 'arri-alexa-35' | 'arri-alexa-mini-lf' | 'arri-alexa-65' | 'arri-amira'
  | 'red-v-raptor' | 'red-komodo' | 'red-gemini' | 'red-monstro'
  | 'blackmagic-ursa-mini-pro' | 'blackmagic-pocket-6k' | 'blackmagic-pocket-4k'
  | 'panavision-dxl2' | 'panavision-millennium-xl2'
```

#### `SensorFormat`

```typescript
type SensorFormat = | 'full-frame' | 'aps-c' | 'micro-four-thirds' | 'medium-format' | 'large-format'
  | 'super-35' | 'vista-vision' | 'imax' | '65mm' | '35mm-film' | '16mm-film' | '8mm-film'
```

#### `FilmFormat`

```typescript
type FilmFormat = | '35mm' | '120-medium-format' | '4x5-large-format' | '8x10-large-format'
  | '110-film' | 'instant-film' | 'super-8' | '16mm' | '65mm-imax'
```

#### `CameraAngle`

```typescript
type CameraAngle = | 'eye-level' | 'low-angle' | 'high-angle' | 'dutch-angle' | 'birds-eye' 
  | 'worms-eye' | 'over-the-shoulder' | 'point-of-view' | 'aerial' | 'drone'
  | 'canted' | 'oblique' | 'hip-level' | 'knee-level' | 'ground-level'
```

#### `ShotType`

```typescript
type ShotType = | 'extreme-close-up' | 'close-up' | 'medium-close-up' | 'medium' | 'medium-wide'
  | 'wide' | 'extreme-wide' | 'establishing' | 'full-body' | 'portrait' | 'headshot'
```

#### `LensType`

```typescript
type LensType = | 'wide-angle' | 'ultra-wide' | 'standard' | 'telephoto' | 'macro' | 'fisheye'
  | '14mm' | '24mm' | '35mm' | '50mm' | '85mm' | '100mm' | '135mm' | '200mm' | '400mm'
  | '600mm' | '800mm' | 'tilt-shift' | 'anamorphic' | 'spherical' | 'prime' | 'zoom'
```

#### `LensBrand`

```typescript
type LensBrand = | 'zeiss' | 'leica' | 'canon' | 'nikon' | 'sony' | 'sigma' | 'tamron' | 'voigtlander'
  | 'fujifilm' | 'samyang' | 'rokinon' | 'tokina' | 'cooke' | 'arri' | 'panavision'
  | 'angenieux' | 'red' | 'atlas' | 'sirui'
```

#### `LensModel`

```typescript
type LensModel = | 'zeiss-otus-55' | 'zeiss-batis-85' | 'zeiss-milvus-35' | 'zeiss-supreme-prime'
  // Leica
  | 'leica-summilux-50' | 'leica-summicron-35' | 'leica-noctilux-50' | 'leica-apo-summicron'
  // Canon
  | 'canon-rf-50-1.2' | 'canon-rf-85-1.2' | 'canon-rf-28-70-f2' | 'canon-rf-100-500'
  // Sony
  | 'sony-gm-24-70' | 'sony-gm-70-200' | 'sony-gm-50-1.2' | 'sony-gm-85-1.4'
  // Sigma Art
  | 'sigma-art-35' | 'sigma-art-50' | 'sigma-art-85' | 'sigma-art-105-macro'
  // Cinema
  | 'cooke-s7i' | 'cooke-anamorphic' | 'arri-signature-prime' | 'arri-ultra-prime'
  | 'panavision-primo' | 'panavision-anamorphic' | 'atlas-orion-anamorphic'
  // Vintage
  | 'helios-44-2' | 'canon-fd-55' | 'minolta-rokkor-58' | 'pentax-takumar-50'
```

#### `FocusType`

```typescript
type FocusType = | 'shallow' | 'deep' | 'soft-focus' | 'tilt-shift' | 'rack-focus' | 'split-diopter'
  | 'zone-focus' | 'hyperfocal' | 'selective' | 'bokeh-heavy' | 'tack-sharp'
```

#### `BokehStyle`

```typescript
type BokehStyle = | 'smooth' | 'creamy' | 'swirly' | 'busy' | 'soap-bubble' | 'cat-eye' | 'oval-anamorphic'
```

#### `FilterType`

```typescript
type FilterType = | 'uv' | 'polarizer' | 'nd' | 'nd-graduated' | 'black-pro-mist' | 'white-pro-mist'
  | 'glimmer-glass' | 'classic-soft' | 'streak' | 'starburst' | 'diffusion'
  | 'infrared' | 'color-gel' | 'warming' | 'cooling' | 'vintage-look'
```

#### `CameraMovement`

```typescript
type CameraMovement = | 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'pedestal' | 'zoom' 
  | 'handheld' | 'steadicam' | 'crane' | 'drone' | 'tracking' | 'arc' | 'whip-pan'
  | 'roll' | 'boom' | 'jib' | 'cable-cam' | 'motion-control' | 'snorricam'
  | 'dutch-roll' | 'vertigo-effect' | 'crash-zoom' | 'slow-push' | 'slow-pull'
```

#### `CameraRig`

```typescript
type CameraRig = | 'tripod' | 'monopod' | 'gimbal' | 'steadicam' | 'easyrig' | 'shoulder-rig'
  | 'slider' | 'dolly' | 'jib' | 'crane' | 'technocrane' | 'russian-arm'
  | 'cable-cam' | 'drone' | 'fpv-drone' | 'motion-control' | 'handheld'
```

#### `GimbalModel`

```typescript
type GimbalModel = | 'dji-ronin-4d' | 'dji-ronin-rs3-pro' | 'dji-ronin-rs4' | 'moza-air-2'
  | 'zhiyun-crane-3s' | 'freefly-movi-pro' | 'tilta-gravity-g2x'
```

#### `LightingType`

```typescript
type LightingType = | 'natural' | 'studio' | 'dramatic' | 'soft' | 'hard' | 'diffused'
  | 'key' | 'fill' | 'rim' | 'backlit' | 'silhouette' | 'rembrandt'
  | 'split' | 'butterfly' | 'loop' | 'broad' | 'short' | 'chiaroscuro'
  | 'high-key' | 'low-key' | 'three-point' | 'practical' | 'motivated'
```

#### `TimeOfDay`

```typescript
type TimeOfDay = | 'dawn' | 'sunrise' | 'golden-hour' | 'morning' | 'midday' | 'afternoon'
  | 'blue-hour' | 'sunset' | 'dusk' | 'twilight' | 'night' | 'midnight'
```

#### `WeatherLighting`

```typescript
type WeatherLighting = | 'sunny' | 'cloudy' | 'overcast' | 'foggy' | 'misty' | 'rainy' 
  | 'stormy' | 'snowy' | 'hazy'
```

#### `ArtStyle`

```typescript
type ArtStyle = | 'photorealistic' | 'hyperrealistic' | 'cinematic' | 'documentary'
  | 'editorial' | 'fashion' | 'portrait' | 'landscape' | 'street'
  | 'fine-art' | 'conceptual' | 'surreal' | 'abstract' | 'minimalist'
  | 'maximalist' | 'vintage' | 'retro' | 'noir' | 'gothic' | 'romantic'
  | 'impressionist' | 'expressionist' | 'pop-art' | 'art-nouveau' | 'art-deco'
  | 'cyberpunk' | 'steampunk' | 'fantasy' | 'sci-fi' | 'anime' | 'manga'
  | 'comic-book' | 'illustration' | 'digital-art' | 'oil-painting' | 'watercolor'
  | 'sketch' | 'pencil-drawing' | 'charcoal' | 'pastel' | '3d-render'
```

#### `FilmStock`

```typescript
type FilmStock = | 'kodak-portra-160' | 'kodak-portra-400' | 'kodak-portra-800' 
  | 'kodak-ektar-100' | 'kodak-gold-200' | 'kodak-ultramax-400' | 'kodak-colorplus-200'
  // Kodak Black & White
  | 'kodak-tri-x-400' | 'kodak-tmax-100' | 'kodak-tmax-400' | 'kodak-tmax-3200'
  // Kodak Slide
  | 'kodak-ektachrome-e100' | 'kodachrome-64' | 'kodachrome-200'
  // Kodak Cinema
  | 'kodak-vision3-50d' | 'kodak-vision3-200t' | 'kodak-vision3-250d' | 'kodak-vision3-500t'
  // Fujifilm
  | 'fujifilm-pro-400h' | 'fujifilm-superia-400' | 'fujifilm-c200'
  | 'fujifilm-velvia-50' | 'fujifilm-velvia-100' | 'fujifilm-provia-100f'
  | 'fujifilm-acros-100' | 'fujifilm-neopan-400' | 'fujifilm-eterna-500t'
  // Ilford
  | 'ilford-hp5-plus' | 'ilford-delta-100' | 'ilford-delta-400' | 'ilford-delta-3200'
  | 'ilford-fp4-plus' | 'ilford-pan-f-plus' | 'ilford-xp2-super'
  // CineStill
  | 'cinestill-50d' | 'cinestill-800t' | 'cinestill-400d' | 'cinestill-bwxx'
  // Lomography
  | 'lomography-100' | 'lomography-400' | 'lomography-800'
  | 'lomochrome-purple' | 'lomochrome-metropolis' | 'lomochrome-turquoise'
  // Instant
  | 'polaroid-sx-70' | 'polaroid-600' | 'polaroid-i-type' | 'polaroid-spectra'
  | 'instax-mini' | 'instax-wide' | 'instax-square'
  // Vintage/Discontinued
  | 'agfa-vista-400' | 'agfa-apx-100' | 'fomapan-100' | 'fomapan-400'
  | 'bergger-pancro-400' | 'jch-streetpan-400'
```

#### `AspectRatio`

```typescript
type AspectRatio = | '1:1' | '4:3' | '3:2' | '16:9' | '21:9' | '9:16' | '2:3' | '4:5' | '5:4'
```

#### `ColorPalette`

```typescript
type ColorPalette = | 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted' | 'pastel' | 'neon'
  | 'monochrome' | 'sepia' | 'desaturated' | 'high-contrast' | 'low-contrast'
  | 'earthy' | 'oceanic' | 'forest' | 'sunset' | 'midnight' | 'golden'
```

#### `Mood`

```typescript
type Mood = | 'serene' | 'peaceful' | 'melancholic' | 'dramatic' | 'tense' | 'mysterious'
  | 'romantic' | 'nostalgic' | 'hopeful' | 'joyful' | 'energetic' | 'chaotic'
  | 'ethereal' | 'dark' | 'light' | 'whimsical' | 'eerie' | 'epic' | 'intimate'
```

#### `VideoTransition`

```typescript
type VideoTransition = | 'cut' | 'fade' | 'dissolve' | 'wipe' | 'morph' | 'match-cut' | 'jump-cut'
  | 'cross-dissolve' | 'iris' | 'push' | 'slide'
```

#### `VideoPacing`

```typescript
type VideoPacing = | 'slow' | 'medium' | 'fast' | 'variable' | 'building' | 'frenetic' | 'contemplative'
```

#### `MusicGenre`

```typescript
type MusicGenre = | 'pop' | 'rock' | 'jazz' | 'classical' | 'electronic' | 'hip-hop' | 'r&b'
  | 'country' | 'folk' | 'blues' | 'metal' | 'punk' | 'indie' | 'alternative'
  | 'ambient' | 'lo-fi' | 'synthwave' | 'orchestral' | 'cinematic' | 'world'
  | 'latin' | 'reggae' | 'soul' | 'funk' | 'disco' | 'house' | 'techno' | 'edm'
```

#### `Instrument`

```typescript
type Instrument = | 'piano' | 'guitar' | 'acoustic-guitar' | 'electric-guitar' | 'bass' | 'drums'
  | 'violin' | 'cello' | 'viola' | 'flute' | 'saxophone' | 'trumpet' | 'trombone'
  | 'synthesizer' | 'organ' | 'harp' | 'percussion' | 'strings' | 'brass' | 'woodwinds'
  | 'choir' | 'vocals' | 'beatbox' | 'turntables' | 'harmonica' | 'banjo' | 'ukulele'
```

#### `VocalStyle`

```typescript
type VocalStyle = | 'male' | 'female' | 'duet' | 'choir' | 'a-cappella' | 'spoken-word' | 'rap'
  | 'falsetto' | 'belting' | 'whisper' | 'growl' | 'melodic' | 'harmonized'
```

#### `Tempo`

```typescript
type Tempo = | 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'vivace' | 'presto'
  | number
```

### Interfaces

#### `ImageSubject`

| Property | Type | Description |
|----------|------|-------------|
| `main` | `string` | - |
| `details` | `string[]` | - |
| `expression` | `string` | - |
| `pose` | `string` | - |
| `action` | `string` | - |
| `clothing` | `string` | - |
| `accessories` | `string[]` | - |
| `age` | `string` | - |
| `ethnicity` | `string` | - |
| `gender` | `string` | - |
| `count` | `number | 'single' | 'couple' | 'group' | 'crowd'` | - |

#### `ImageCamera`

| Property | Type | Description |
|----------|------|-------------|
| `angle` | `CameraAngle` | - |
| `shot` | `ShotType` | - |
| `brand` | `CameraBrand` | - |
| `model` | `CameraModel` | - |
| `sensor` | `SensorFormat` | - |
| `lens` | `LensType` | - |
| `lensModel` | `LensModel` | - |
| `lensBrand` | `LensBrand` | - |
| `focalLength` | `string` | - |
| `focus` | `FocusType` | - |
| `aperture` | `string` | - |
| `bokeh` | `BokehStyle` | - |
| `focusDistance` | `string` | - |
| `iso` | `number` | - |
| `shutterSpeed` | `string` | - |
| `exposureCompensation` | `string` | - |
| `filmStock` | `FilmStock` | - |
| `filmFormat` | `FilmFormat` | - |
| `filter` | `FilterType | FilterType[]` | - |
| `whiteBalance` | `'daylight' | 'cloudy' | 'tungsten' | 'fluorescent' | 'flash' | 'custom'` | - |
| `colorProfile` | `string` | - |
| `pictureProfile` | `string` | - |

#### `ImageLighting`

| Property | Type | Description |
|----------|------|-------------|
| `type` | `LightingType | LightingType[]` | - |
| `time` | `TimeOfDay` | - |
| `weather` | `WeatherLighting` | - |
| `direction` | `'front' | 'side' | 'back' | 'top' | 'bottom' | 'three-quarter'` | - |
| `intensity` | `'soft' | 'medium' | 'hard' | 'dramatic'` | - |
| `color` | `string` | - |
| `sources` | `string[]` | - |

#### `ImageComposition`

| Property | Type | Description |
|----------|------|-------------|
| `ruleOfThirds` | `boolean` | - |
| `goldenRatio` | `boolean` | - |
| `symmetry` | `'none' | 'horizontal' | 'vertical' | 'radial'` | - |
| `leadingLines` | `boolean` | - |
| `framing` | `string` | - |
| `negativeSpace` | `boolean` | - |
| `layers` | `string[]` | - |
| `foreground` | `string` | - |
| `midground` | `string` | - |
| `background` | `string` | - |

#### `ImageStyle`

| Property | Type | Description |
|----------|------|-------------|
| `medium` | `ArtStyle | ArtStyle[]` | - |
| `artist` | `string | string[]` | - |
| `era` | `string` | - |
| `influence` | `string[]` | - |
| `quality` | `string[]` | - |
| `render` | `string` | - |

#### `ImageColor`

| Property | Type | Description |
|----------|------|-------------|
| `palette` | `ColorPalette | ColorPalette[]` | - |
| `primary` | `string[]` | - |
| `accent` | `string[]` | - |
| `grade` | `string` | - |
| `temperature` | `'warm' | 'neutral' | 'cool'` | - |
| `saturation` | `'desaturated' | 'natural' | 'vibrant' | 'hyper-saturated'` | - |
| `contrast` | `'low' | 'medium' | 'high'` | - |

#### `ImageEnvironment`

| Property | Type | Description |
|----------|------|-------------|
| `setting` | `string` | - |
| `location` | `string` | - |
| `terrain` | `string` | - |
| `architecture` | `string` | - |
| `props` | `string[]` | - |
| `atmosphere` | `string` | - |
| `season` | `'spring' | 'summer' | 'autumn' | 'winter'` | - |
| `era` | `string` | - |

#### `ImageTechnical`

| Property | Type | Description |
|----------|------|-------------|
| `aspectRatio` | `AspectRatio` | - |
| `resolution` | `string` | - |
| `quality` | `'draft' | 'standard' | 'high' | 'ultra' | 'masterpiece'` | - |
| `detail` | `'low' | 'medium' | 'high' | 'extreme'` | - |
| `noise` | `'none' | 'subtle' | 'filmic' | 'grainy'` | - |
| `sharpness` | `'soft' | 'natural' | 'sharp' | 'crisp'` | - |

#### `BuiltImagePrompt`

| Property | Type | Description |
|----------|------|-------------|
| `prompt` | `string` | - |
| `structure` | `unknown` | - |

### Classes

#### `ImagePromptBuilder`

**Methods:**

| Method | Description |
|--------|-------------|
| `subject(main: string | ImageSubject): this` | - |
| `subjectDetails(details: string[]): this` | - |
| `expression(expression: string): this` | - |
| `pose(pose: string): this` | - |
| `action(action: string): this` | - |
| `clothing(clothing: string): this` | - |
| `accessories(accessories: string[]): this` | - |
| `subjectCount(count: ImageSubject['count']): this` | - |
| `camera(settings: ImageCamera): this` | - |
| `angle(angle: CameraAngle): this` | - |
| `shot(shot: ShotType): this` | - |
| `lens(lens: LensType): this` | - |
| `focus(focus: FocusType): this` | - |
| `aperture(aperture: string): this` | - |
| `filmStock(filmStock: FilmStock): this` | - |
| `filmFormat(format: FilmFormat): this` | - |
| `cameraBrand(brand: CameraBrand): this` | - |
| `cameraModel(model: CameraModel): this` | - |
| `sensor(sensor: SensorFormat): this` | - |
| `lensModel(model: LensModel): this` | - |
| `lensBrand(brand: LensBrand): this` | - |
| `focalLength(length: string): this` | - |
| `bokeh(style: BokehStyle): this` | - |
| `filter(filter: FilterType | FilterType[]): this` | - |
| `iso(iso: number): this` | - |
| `shutterSpeed(speed: string): this` | - |
| `whiteBalance(wb: ImageCamera['whiteBalance']): this` | - |
| `colorProfile(profile: string): this` | - |
| `lighting(settings: ImageLighting): this` | - |
| `lightingType(type: LightingType | LightingType[]): this` | - |
| `timeOfDay(time: TimeOfDay): this` | - |
| `weather(weather: WeatherLighting): this` | - |
| `lightDirection(direction: ImageLighting['direction']): this` | - |
| `lightIntensity(intensity: ImageLighting['intensity']): this` | - |
| `composition(settings: ImageComposition): this` | - |
| `ruleOfThirds(): this` | - |
| `goldenRatio(): this` | - |
| `symmetry(type: ImageComposition['symmetry']): this` | - |
| `foreground(fg: string): this` | - |
| `midground(mg: string): this` | - |
| `background(bg: string): this` | - |
| `environment(setting: string | ImageEnvironment): this` | - |
| `location(location: string): this` | - |
| `props(props: string[]): this` | - |
| `atmosphere(atmosphere: string): this` | - |
| `season(season: ImageEnvironment['season']): this` | - |
| `style(settings: ImageStyle): this` | - |
| `medium(medium: ArtStyle | ArtStyle[]): this` | - |
| `artist(artist: string | string[]): this` | - |
| `influence(influences: string[]): this` | - |
| `color(settings: ImageColor): this` | - |
| `palette(palette: ColorPalette | ColorPalette[]): this` | - |
| `primaryColors(colors: string[]): this` | - |
| `accentColors(colors: string[]): this` | - |
| `colorGrade(grade: string): this` | - |
| `technical(settings: ImageTechnical): this` | - |
| `aspectRatio(ratio: AspectRatio): this` | - |
| `resolution(resolution: string): this` | - |
| `quality(quality: ImageTechnical['quality']): this` | - |
| `mood(mood: Mood | Mood[]): this` | - |
| `negative(items: string[]): this` | - |
| `custom(text: string): this` | - |
| `build(): BuiltImagePrompt` | - |
| `toString(): string` | - |
| `toJSON(): string` | - |
| `toYAML(): string` | - |
| `toMarkdown(): string` | - |
| `format(fmt: OutputFormat): string` | - |

##### `subject()`

```typescript
subject(main: string | ImageSubject): this
```

**Parameters:**

- `main`: `string | ImageSubject`

**Returns:** `this`

##### `subjectDetails()`

```typescript
subjectDetails(details: string[]): this
```

**Parameters:**

- `details`: `string[]`

**Returns:** `this`

##### `expression()`

```typescript
expression(expression: string): this
```

**Parameters:**

- `expression`: `string`

**Returns:** `this`

##### `pose()`

```typescript
pose(pose: string): this
```

**Parameters:**

- `pose`: `string`

**Returns:** `this`

##### `action()`

```typescript
action(action: string): this
```

**Parameters:**

- `action`: `string`

**Returns:** `this`

##### `clothing()`

```typescript
clothing(clothing: string): this
```

**Parameters:**

- `clothing`: `string`

**Returns:** `this`

##### `accessories()`

```typescript
accessories(accessories: string[]): this
```

**Parameters:**

- `accessories`: `string[]`

**Returns:** `this`

##### `subjectCount()`

```typescript
subjectCount(count: ImageSubject['count']): this
```

**Parameters:**

- `count`: `ImageSubject['count']`

**Returns:** `this`

##### `camera()`

```typescript
camera(settings: ImageCamera): this
```

**Parameters:**

- `settings`: `ImageCamera`

**Returns:** `this`

##### `angle()`

```typescript
angle(angle: CameraAngle): this
```

**Parameters:**

- `angle`: `CameraAngle`

**Returns:** `this`

##### `shot()`

```typescript
shot(shot: ShotType): this
```

**Parameters:**

- `shot`: `ShotType`

**Returns:** `this`

##### `lens()`

```typescript
lens(lens: LensType): this
```

**Parameters:**

- `lens`: `LensType`

**Returns:** `this`

##### `focus()`

```typescript
focus(focus: FocusType): this
```

**Parameters:**

- `focus`: `FocusType`

**Returns:** `this`

##### `aperture()`

```typescript
aperture(aperture: string): this
```

**Parameters:**

- `aperture`: `string`

**Returns:** `this`

##### `filmStock()`

```typescript
filmStock(filmStock: FilmStock): this
```

**Parameters:**

- `filmStock`: `FilmStock`

**Returns:** `this`

##### `filmFormat()`

```typescript
filmFormat(format: FilmFormat): this
```

**Parameters:**

- `format`: `FilmFormat`

**Returns:** `this`

##### `cameraBrand()`

```typescript
cameraBrand(brand: CameraBrand): this
```

**Parameters:**

- `brand`: `CameraBrand`

**Returns:** `this`

##### `cameraModel()`

```typescript
cameraModel(model: CameraModel): this
```

**Parameters:**

- `model`: `CameraModel`

**Returns:** `this`

##### `sensor()`

```typescript
sensor(sensor: SensorFormat): this
```

**Parameters:**

- `sensor`: `SensorFormat`

**Returns:** `this`

##### `lensModel()`

```typescript
lensModel(model: LensModel): this
```

**Parameters:**

- `model`: `LensModel`

**Returns:** `this`

##### `lensBrand()`

```typescript
lensBrand(brand: LensBrand): this
```

**Parameters:**

- `brand`: `LensBrand`

**Returns:** `this`

##### `focalLength()`

```typescript
focalLength(length: string): this
```

**Parameters:**

- `length`: `string`

**Returns:** `this`

##### `bokeh()`

```typescript
bokeh(style: BokehStyle): this
```

**Parameters:**

- `style`: `BokehStyle`

**Returns:** `this`

##### `filter()`

```typescript
filter(filter: FilterType | FilterType[]): this
```

**Parameters:**

- `filter`: `FilterType | FilterType[]`

**Returns:** `this`

##### `iso()`

```typescript
iso(iso: number): this
```

**Parameters:**

- `iso`: `number`

**Returns:** `this`

##### `shutterSpeed()`

```typescript
shutterSpeed(speed: string): this
```

**Parameters:**

- `speed`: `string`

**Returns:** `this`

##### `whiteBalance()`

```typescript
whiteBalance(wb: ImageCamera['whiteBalance']): this
```

**Parameters:**

- `wb`: `ImageCamera['whiteBalance']`

**Returns:** `this`

##### `colorProfile()`

```typescript
colorProfile(profile: string): this
```

**Parameters:**

- `profile`: `string`

**Returns:** `this`

##### `lighting()`

```typescript
lighting(settings: ImageLighting): this
```

**Parameters:**

- `settings`: `ImageLighting`

**Returns:** `this`

##### `lightingType()`

```typescript
lightingType(type: LightingType | LightingType[]): this
```

**Parameters:**

- `type`: `LightingType | LightingType[]`

**Returns:** `this`

##### `timeOfDay()`

```typescript
timeOfDay(time: TimeOfDay): this
```

**Parameters:**

- `time`: `TimeOfDay`

**Returns:** `this`

##### `weather()`

```typescript
weather(weather: WeatherLighting): this
```

**Parameters:**

- `weather`: `WeatherLighting`

**Returns:** `this`

##### `lightDirection()`

```typescript
lightDirection(direction: ImageLighting['direction']): this
```

**Parameters:**

- `direction`: `ImageLighting['direction']`

**Returns:** `this`

##### `lightIntensity()`

```typescript
lightIntensity(intensity: ImageLighting['intensity']): this
```

**Parameters:**

- `intensity`: `ImageLighting['intensity']`

**Returns:** `this`

##### `composition()`

```typescript
composition(settings: ImageComposition): this
```

**Parameters:**

- `settings`: `ImageComposition`

**Returns:** `this`

##### `ruleOfThirds()`

```typescript
ruleOfThirds(): this
```

**Returns:** `this`

##### `goldenRatio()`

```typescript
goldenRatio(): this
```

**Returns:** `this`

##### `symmetry()`

```typescript
symmetry(type: ImageComposition['symmetry']): this
```

**Parameters:**

- `type`: `ImageComposition['symmetry']`

**Returns:** `this`

##### `foreground()`

```typescript
foreground(fg: string): this
```

**Parameters:**

- `fg`: `string`

**Returns:** `this`

##### `midground()`

```typescript
midground(mg: string): this
```

**Parameters:**

- `mg`: `string`

**Returns:** `this`

##### `background()`

```typescript
background(bg: string): this
```

**Parameters:**

- `bg`: `string`

**Returns:** `this`

##### `environment()`

```typescript
environment(setting: string | ImageEnvironment): this
```

**Parameters:**

- `setting`: `string | ImageEnvironment`

**Returns:** `this`

##### `location()`

```typescript
location(location: string): this
```

**Parameters:**

- `location`: `string`

**Returns:** `this`

##### `props()`

```typescript
props(props: string[]): this
```

**Parameters:**

- `props`: `string[]`

**Returns:** `this`

##### `atmosphere()`

```typescript
atmosphere(atmosphere: string): this
```

**Parameters:**

- `atmosphere`: `string`

**Returns:** `this`

##### `season()`

```typescript
season(season: ImageEnvironment['season']): this
```

**Parameters:**

- `season`: `ImageEnvironment['season']`

**Returns:** `this`

##### `style()`

```typescript
style(settings: ImageStyle): this
```

**Parameters:**

- `settings`: `ImageStyle`

**Returns:** `this`

##### `medium()`

```typescript
medium(medium: ArtStyle | ArtStyle[]): this
```

**Parameters:**

- `medium`: `ArtStyle | ArtStyle[]`

**Returns:** `this`

##### `artist()`

```typescript
artist(artist: string | string[]): this
```

**Parameters:**

- `artist`: `string | string[]`

**Returns:** `this`

##### `influence()`

```typescript
influence(influences: string[]): this
```

**Parameters:**

- `influences`: `string[]`

**Returns:** `this`

##### `color()`

```typescript
color(settings: ImageColor): this
```

**Parameters:**

- `settings`: `ImageColor`

**Returns:** `this`

##### `palette()`

```typescript
palette(palette: ColorPalette | ColorPalette[]): this
```

**Parameters:**

- `palette`: `ColorPalette | ColorPalette[]`

**Returns:** `this`

##### `primaryColors()`

```typescript
primaryColors(colors: string[]): this
```

**Parameters:**

- `colors`: `string[]`

**Returns:** `this`

##### `accentColors()`

```typescript
accentColors(colors: string[]): this
```

**Parameters:**

- `colors`: `string[]`

**Returns:** `this`

##### `colorGrade()`

```typescript
colorGrade(grade: string): this
```

**Parameters:**

- `grade`: `string`

**Returns:** `this`

##### `technical()`

```typescript
technical(settings: ImageTechnical): this
```

**Parameters:**

- `settings`: `ImageTechnical`

**Returns:** `this`

##### `aspectRatio()`

```typescript
aspectRatio(ratio: AspectRatio): this
```

**Parameters:**

- `ratio`: `AspectRatio`

**Returns:** `this`

##### `resolution()`

```typescript
resolution(resolution: string): this
```

**Parameters:**

- `resolution`: `string`

**Returns:** `this`

##### `quality()`

```typescript
quality(quality: ImageTechnical['quality']): this
```

**Parameters:**

- `quality`: `ImageTechnical['quality']`

**Returns:** `this`

##### `mood()`

```typescript
mood(mood: Mood | Mood[]): this
```

**Parameters:**

- `mood`: `Mood | Mood[]`

**Returns:** `this`

##### `negative()`

```typescript
negative(items: string[]): this
```

**Parameters:**

- `items`: `string[]`

**Returns:** `this`

##### `custom()`

```typescript
custom(text: string): this
```

**Parameters:**

- `text`: `string`

**Returns:** `this`

##### `build()`

```typescript
build(): BuiltImagePrompt
```

**Returns:** `BuiltImagePrompt`

##### `toString()`

```typescript
toString(): string
```

**Returns:** `string`

##### `toJSON()`

```typescript
toJSON(): string
```

**Returns:** `string`

##### `toYAML()`

```typescript
toYAML(): string
```

**Returns:** `string`

##### `toMarkdown()`

```typescript
toMarkdown(): string
```

**Returns:** `string`

##### `format()`

```typescript
format(fmt: OutputFormat): string
```

**Parameters:**

- `fmt`: `OutputFormat`

**Returns:** `string`

### Functions

#### `image()`

Create a new image prompt builder

```typescript
image(): ImagePromptBuilder
```

**Returns:** `ImagePromptBuilder`

---

## builder/video

Video Prompt Builder - Comprehensive video generation prompt builder

Based on OpenAI Sora, Runway, and other video generation best practices.

@example
```ts
import { video } from 'prompts.chat/builder';

const prompt = video()
  .scene("A samurai walks through a bamboo forest")
  .camera({ movement: "tracking", angle: "low" })
  .lighting({ time: "golden-hour", type: "natural" })
  .duration(5)
  .build();
```

### Interfaces

#### `VideoScene`

| Property | Type | Description |
|----------|------|-------------|
| `description` | `string` | - |
| `setting` | `string` | - |
| `timeOfDay` | `TimeOfDay` | - |
| `weather` | `WeatherLighting` | - |
| `atmosphere` | `string` | - |

#### `VideoSubject`

| Property | Type | Description |
|----------|------|-------------|
| `main` | `string` | - |
| `appearance` | `string` | - |
| `clothing` | `string` | - |
| `age` | `string` | - |
| `gender` | `string` | - |
| `count` | `number | 'single' | 'couple' | 'group' | 'crowd'` | - |

#### `VideoCamera`

| Property | Type | Description |
|----------|------|-------------|
| `shot` | `ShotType` | - |
| `angle` | `CameraAngle` | - |
| `brand` | `CameraBrand` | - |
| `model` | `CameraModel` | - |
| `sensor` | `SensorFormat` | - |
| `lens` | `LensType` | - |
| `lensModel` | `LensModel` | - |
| `lensBrand` | `LensBrand` | - |
| `focalLength` | `string` | - |
| `anamorphic` | `boolean` | - |
| `anamorphicRatio` | `'1.33x' | '1.5x' | '1.8x' | '2x'` | - |
| `focus` | `'shallow' | 'deep' | 'rack-focus' | 'pull-focus' | 'split-diopter'` | - |
| `aperture` | `string` | - |
| `bokeh` | `BokehStyle` | - |
| `movement` | `CameraMovement` | - |
| `movementSpeed` | `'slow' | 'medium' | 'fast'` | - |
| `movementDirection` | `'left' | 'right' | 'forward' | 'backward' | 'up' | 'down' | 'arc-left' | 'arc-right'` | - |
| `rig` | `CameraRig` | - |
| `gimbal` | `GimbalModel` | - |
| `platform` | `'handheld' | 'steadicam' | 'tripod' | 'drone' | 'crane' | 'gimbal' | 'slider' | 'dolly' | 'technocrane' | 'russian-arm' | 'fpv-drone'` | - |
| `shutterAngle` | `number` | - |
| `frameRate` | `24 | 25 | 30 | 48 | 60 | 120 | 240` | - |
| `slowMotion` | `boolean` | - |
| `filter` | `FilterType | FilterType[]` | - |
| `filmStock` | `FilmStock` | - |
| `filmGrain` | `'none' | 'subtle' | 'moderate' | 'heavy'` | - |
| `halation` | `boolean` | - |

#### `VideoLighting`

| Property | Type | Description |
|----------|------|-------------|
| `type` | `LightingType | LightingType[]` | - |
| `time` | `TimeOfDay` | - |
| `weather` | `WeatherLighting` | - |
| `direction` | `'front' | 'side' | 'back' | 'top' | 'three-quarter'` | - |
| `intensity` | `'soft' | 'medium' | 'hard' | 'dramatic'` | - |
| `sources` | `string[]` | - |
| `color` | `string` | - |

#### `VideoAction`

| Property | Type | Description |
|----------|------|-------------|
| `beat` | `number` | - |
| `action` | `string` | - |
| `duration` | `number` | - |
| `timing` | `'start' | 'middle' | 'end'` | - |

#### `VideoMotion`

| Property | Type | Description |
|----------|------|-------------|
| `subject` | `string` | - |
| `type` | `'walk' | 'run' | 'gesture' | 'turn' | 'look' | 'reach' | 'sit' | 'stand' | 'custom'` | - |
| `direction` | `'left' | 'right' | 'forward' | 'backward' | 'up' | 'down'` | - |
| `speed` | `'slow' | 'normal' | 'fast'` | - |
| `beats` | `string[]` | - |

#### `VideoStyle`

| Property | Type | Description |
|----------|------|-------------|
| `format` | `string` | - |
| `era` | `string` | - |
| `filmStock` | `string` | - |
| `look` | `ArtStyle | ArtStyle[]` | - |
| `grade` | `string` | - |
| `reference` | `string[]` | - |

#### `VideoColor`

| Property | Type | Description |
|----------|------|-------------|
| `palette` | `ColorPalette | ColorPalette[]` | - |
| `anchors` | `string[]` | - |
| `temperature` | `'warm' | 'neutral' | 'cool'` | - |
| `grade` | `string` | - |

#### `VideoAudio`

| Property | Type | Description |
|----------|------|-------------|
| `diegetic` | `string[]` | - |
| `ambient` | `string` | - |
| `dialogue` | `string` | - |
| `music` | `string` | - |
| `soundEffects` | `string[]` | - |
| `mix` | `string` | - |

#### `VideoTechnical`

| Property | Type | Description |
|----------|------|-------------|
| `duration` | `number` | - |
| `resolution` | `'480p' | '720p' | '1080p' | '4K'` | - |
| `fps` | `24 | 30 | 60` | - |
| `aspectRatio` | `'16:9' | '9:16' | '1:1' | '4:3' | '21:9'` | - |
| `shutterAngle` | `number` | - |

#### `VideoShot`

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | `string` | - |
| `name` | `string` | - |
| `camera` | `VideoCamera` | - |
| `action` | `string` | - |
| `purpose` | `string` | - |

#### `BuiltVideoPrompt`

| Property | Type | Description |
|----------|------|-------------|
| `prompt` | `string` | - |
| `structure` | `unknown` | - |

### Classes

#### `VideoPromptBuilder`

**Methods:**

| Method | Description |
|--------|-------------|
| `scene(description: string | VideoScene): this` | - |
| `setting(setting: string): this` | - |
| `subject(main: string | VideoSubject): this` | - |
| `appearance(appearance: string): this` | - |
| `clothing(clothing: string): this` | - |
| `camera(settings: VideoCamera): this` | - |
| `shot(shot: ShotType): this` | - |
| `angle(angle: CameraAngle): this` | - |
| `movement(movement: CameraMovement): this` | - |
| `lens(lens: LensType): this` | - |
| `platform(platform: VideoCamera['platform']): this` | - |
| `cameraSpeed(speed: VideoCamera['movementSpeed']): this` | - |
| `movementDirection(direction: VideoCamera['movementDirection']): this` | - |
| `rig(rig: CameraRig): this` | - |
| `gimbal(gimbal: GimbalModel): this` | - |
| `cameraBrand(brand: CameraBrand): this` | - |
| `cameraModel(model: CameraModel): this` | - |
| `sensor(sensor: SensorFormat): this` | - |
| `lensModel(model: LensModel): this` | - |
| `lensBrand(brand: LensBrand): this` | - |
| `focalLength(length: string): this` | - |
| `anamorphic(ratio?: VideoCamera['anamorphicRatio']): this` | - |
| `aperture(aperture: string): this` | - |
| `frameRate(fps: VideoCamera['frameRate']): this` | - |
| `slowMotion(enabled?: any): this` | - |
| `shutterAngle(angle: number): this` | - |
| `filter(filter: FilterType | FilterType[]): this` | - |
| `filmStock(stock: FilmStock): this` | - |
| `filmGrain(grain: VideoCamera['filmGrain']): this` | - |
| `halation(enabled?: any): this` | - |
| `lighting(settings: VideoLighting): this` | - |
| `lightingType(type: LightingType | LightingType[]): this` | - |
| `timeOfDay(time: TimeOfDay): this` | - |
| `weather(weather: WeatherLighting): this` | - |
| `action(action: string, options?: Partial<Omit<VideoAction, 'action'>>): this` | - |
| `actions(actions: string[]): this` | - |
| `motion(settings: VideoMotion): this` | - |
| `motionBeats(beats: string[]): this` | - |
| `style(settings: VideoStyle): this` | - |
| `format(format: string): this` | - |
| `era(era: string): this` | - |
| `styleFilmStock(stock: string): this` | - |
| `look(look: ArtStyle | ArtStyle[]): this` | - |
| `reference(references: string[]): this` | - |
| `color(settings: VideoColor): this` | - |
| `palette(palette: ColorPalette | ColorPalette[]): this` | - |
| `colorAnchors(anchors: string[]): this` | - |
| `colorGrade(grade: string): this` | - |
| `audio(settings: VideoAudio): this` | - |
| `dialogue(dialogue: string): this` | - |
| `ambient(ambient: string): this` | - |
| `diegetic(sounds: string[]): this` | - |
| `soundEffects(effects: string[]): this` | - |
| `music(music: string): this` | - |
| `technical(settings: VideoTechnical): this` | - |
| `duration(seconds: number): this` | - |
| `resolution(res: VideoTechnical['resolution']): this` | - |
| `fps(fps: VideoTechnical['fps']): this` | - |
| `aspectRatio(ratio: VideoTechnical['aspectRatio']): this` | - |
| `addShot(shot: VideoShot): this` | - |
| `shotList(shots: VideoShot[]): this` | - |
| `mood(mood: Mood | Mood[]): this` | - |
| `pacing(pacing: VideoPacing): this` | - |
| `transition(transition: VideoTransition): this` | - |
| `transitions(transitions: VideoTransition[]): this` | - |
| `custom(text: string): this` | - |
| `build(): BuiltVideoPrompt` | - |
| `toString(): string` | - |
| `toJSON(): string` | - |
| `toYAML(): string` | - |
| `toMarkdown(): string` | - |
| `outputFormat(fmt: OutputFormat): string` | - |

##### `scene()`

```typescript
scene(description: string | VideoScene): this
```

**Parameters:**

- `description`: `string | VideoScene`

**Returns:** `this`

##### `setting()`

```typescript
setting(setting: string): this
```

**Parameters:**

- `setting`: `string`

**Returns:** `this`

##### `subject()`

```typescript
subject(main: string | VideoSubject): this
```

**Parameters:**

- `main`: `string | VideoSubject`

**Returns:** `this`

##### `appearance()`

```typescript
appearance(appearance: string): this
```

**Parameters:**

- `appearance`: `string`

**Returns:** `this`

##### `clothing()`

```typescript
clothing(clothing: string): this
```

**Parameters:**

- `clothing`: `string`

**Returns:** `this`

##### `camera()`

```typescript
camera(settings: VideoCamera): this
```

**Parameters:**

- `settings`: `VideoCamera`

**Returns:** `this`

##### `shot()`

```typescript
shot(shot: ShotType): this
```

**Parameters:**

- `shot`: `ShotType`

**Returns:** `this`

##### `angle()`

```typescript
angle(angle: CameraAngle): this
```

**Parameters:**

- `angle`: `CameraAngle`

**Returns:** `this`

##### `movement()`

```typescript
movement(movement: CameraMovement): this
```

**Parameters:**

- `movement`: `CameraMovement`

**Returns:** `this`

##### `lens()`

```typescript
lens(lens: LensType): this
```

**Parameters:**

- `lens`: `LensType`

**Returns:** `this`

##### `platform()`

```typescript
platform(platform: VideoCamera['platform']): this
```

**Parameters:**

- `platform`: `VideoCamera['platform']`

**Returns:** `this`

##### `cameraSpeed()`

```typescript
cameraSpeed(speed: VideoCamera['movementSpeed']): this
```

**Parameters:**

- `speed`: `VideoCamera['movementSpeed']`

**Returns:** `this`

##### `movementDirection()`

```typescript
movementDirection(direction: VideoCamera['movementDirection']): this
```

**Parameters:**

- `direction`: `VideoCamera['movementDirection']`

**Returns:** `this`

##### `rig()`

```typescript
rig(rig: CameraRig): this
```

**Parameters:**

- `rig`: `CameraRig`

**Returns:** `this`

##### `gimbal()`

```typescript
gimbal(gimbal: GimbalModel): this
```

**Parameters:**

- `gimbal`: `GimbalModel`

**Returns:** `this`

##### `cameraBrand()`

```typescript
cameraBrand(brand: CameraBrand): this
```

**Parameters:**

- `brand`: `CameraBrand`

**Returns:** `this`

##### `cameraModel()`

```typescript
cameraModel(model: CameraModel): this
```

**Parameters:**

- `model`: `CameraModel`

**Returns:** `this`

##### `sensor()`

```typescript
sensor(sensor: SensorFormat): this
```

**Parameters:**

- `sensor`: `SensorFormat`

**Returns:** `this`

##### `lensModel()`

```typescript
lensModel(model: LensModel): this
```

**Parameters:**

- `model`: `LensModel`

**Returns:** `this`

##### `lensBrand()`

```typescript
lensBrand(brand: LensBrand): this
```

**Parameters:**

- `brand`: `LensBrand`

**Returns:** `this`

##### `focalLength()`

```typescript
focalLength(length: string): this
```

**Parameters:**

- `length`: `string`

**Returns:** `this`

##### `anamorphic()`

```typescript
anamorphic(ratio?: VideoCamera['anamorphicRatio']): this
```

**Parameters:**

- `ratio`: `VideoCamera['anamorphicRatio']` (optional)

**Returns:** `this`

##### `aperture()`

```typescript
aperture(aperture: string): this
```

**Parameters:**

- `aperture`: `string`

**Returns:** `this`

##### `frameRate()`

```typescript
frameRate(fps: VideoCamera['frameRate']): this
```

**Parameters:**

- `fps`: `VideoCamera['frameRate']`

**Returns:** `this`

##### `slowMotion()`

```typescript
slowMotion(enabled?: any): this
```

**Parameters:**

- `enabled`: `any` (optional) = `true`

**Returns:** `this`

##### `shutterAngle()`

```typescript
shutterAngle(angle: number): this
```

**Parameters:**

- `angle`: `number`

**Returns:** `this`

##### `filter()`

```typescript
filter(filter: FilterType | FilterType[]): this
```

**Parameters:**

- `filter`: `FilterType | FilterType[]`

**Returns:** `this`

##### `filmStock()`

```typescript
filmStock(stock: FilmStock): this
```

**Parameters:**

- `stock`: `FilmStock`

**Returns:** `this`

##### `filmGrain()`

```typescript
filmGrain(grain: VideoCamera['filmGrain']): this
```

**Parameters:**

- `grain`: `VideoCamera['filmGrain']`

**Returns:** `this`

##### `halation()`

```typescript
halation(enabled?: any): this
```

**Parameters:**

- `enabled`: `any` (optional) = `true`

**Returns:** `this`

##### `lighting()`

```typescript
lighting(settings: VideoLighting): this
```

**Parameters:**

- `settings`: `VideoLighting`

**Returns:** `this`

##### `lightingType()`

```typescript
lightingType(type: LightingType | LightingType[]): this
```

**Parameters:**

- `type`: `LightingType | LightingType[]`

**Returns:** `this`

##### `timeOfDay()`

```typescript
timeOfDay(time: TimeOfDay): this
```

**Parameters:**

- `time`: `TimeOfDay`

**Returns:** `this`

##### `weather()`

```typescript
weather(weather: WeatherLighting): this
```

**Parameters:**

- `weather`: `WeatherLighting`

**Returns:** `this`

##### `action()`

```typescript
action(action: string, options?: Partial<Omit<VideoAction, 'action'>>): this
```

**Parameters:**

- `action`: `string`
- `options`: `Partial<Omit<VideoAction, 'action'>>` (optional) = `{}`

**Returns:** `this`

##### `actions()`

```typescript
actions(actions: string[]): this
```

**Parameters:**

- `actions`: `string[]`

**Returns:** `this`

##### `motion()`

```typescript
motion(settings: VideoMotion): this
```

**Parameters:**

- `settings`: `VideoMotion`

**Returns:** `this`

##### `motionBeats()`

```typescript
motionBeats(beats: string[]): this
```

**Parameters:**

- `beats`: `string[]`

**Returns:** `this`

##### `style()`

```typescript
style(settings: VideoStyle): this
```

**Parameters:**

- `settings`: `VideoStyle`

**Returns:** `this`

##### `format()`

```typescript
format(format: string): this
```

**Parameters:**

- `format`: `string`

**Returns:** `this`

##### `era()`

```typescript
era(era: string): this
```

**Parameters:**

- `era`: `string`

**Returns:** `this`

##### `styleFilmStock()`

```typescript
styleFilmStock(stock: string): this
```

**Parameters:**

- `stock`: `string`

**Returns:** `this`

##### `look()`

```typescript
look(look: ArtStyle | ArtStyle[]): this
```

**Parameters:**

- `look`: `ArtStyle | ArtStyle[]`

**Returns:** `this`

##### `reference()`

```typescript
reference(references: string[]): this
```

**Parameters:**

- `references`: `string[]`

**Returns:** `this`

##### `color()`

```typescript
color(settings: VideoColor): this
```

**Parameters:**

- `settings`: `VideoColor`

**Returns:** `this`

##### `palette()`

```typescript
palette(palette: ColorPalette | ColorPalette[]): this
```

**Parameters:**

- `palette`: `ColorPalette | ColorPalette[]`

**Returns:** `this`

##### `colorAnchors()`

```typescript
colorAnchors(anchors: string[]): this
```

**Parameters:**

- `anchors`: `string[]`

**Returns:** `this`

##### `colorGrade()`

```typescript
colorGrade(grade: string): this
```

**Parameters:**

- `grade`: `string`

**Returns:** `this`

##### `audio()`

```typescript
audio(settings: VideoAudio): this
```

**Parameters:**

- `settings`: `VideoAudio`

**Returns:** `this`

##### `dialogue()`

```typescript
dialogue(dialogue: string): this
```

**Parameters:**

- `dialogue`: `string`

**Returns:** `this`

##### `ambient()`

```typescript
ambient(ambient: string): this
```

**Parameters:**

- `ambient`: `string`

**Returns:** `this`

##### `diegetic()`

```typescript
diegetic(sounds: string[]): this
```

**Parameters:**

- `sounds`: `string[]`

**Returns:** `this`

##### `soundEffects()`

```typescript
soundEffects(effects: string[]): this
```

**Parameters:**

- `effects`: `string[]`

**Returns:** `this`

##### `music()`

```typescript
music(music: string): this
```

**Parameters:**

- `music`: `string`

**Returns:** `this`

##### `technical()`

```typescript
technical(settings: VideoTechnical): this
```

**Parameters:**

- `settings`: `VideoTechnical`

**Returns:** `this`

##### `duration()`

```typescript
duration(seconds: number): this
```

**Parameters:**

- `seconds`: `number`

**Returns:** `this`

##### `resolution()`

```typescript
resolution(res: VideoTechnical['resolution']): this
```

**Parameters:**

- `res`: `VideoTechnical['resolution']`

**Returns:** `this`

##### `fps()`

```typescript
fps(fps: VideoTechnical['fps']): this
```

**Parameters:**

- `fps`: `VideoTechnical['fps']`

**Returns:** `this`

##### `aspectRatio()`

```typescript
aspectRatio(ratio: VideoTechnical['aspectRatio']): this
```

**Parameters:**

- `ratio`: `VideoTechnical['aspectRatio']`

**Returns:** `this`

##### `addShot()`

```typescript
addShot(shot: VideoShot): this
```

**Parameters:**

- `shot`: `VideoShot`

**Returns:** `this`

##### `shotList()`

```typescript
shotList(shots: VideoShot[]): this
```

**Parameters:**

- `shots`: `VideoShot[]`

**Returns:** `this`

##### `mood()`

```typescript
mood(mood: Mood | Mood[]): this
```

**Parameters:**

- `mood`: `Mood | Mood[]`

**Returns:** `this`

##### `pacing()`

```typescript
pacing(pacing: VideoPacing): this
```

**Parameters:**

- `pacing`: `VideoPacing`

**Returns:** `this`

##### `transition()`

```typescript
transition(transition: VideoTransition): this
```

**Parameters:**

- `transition`: `VideoTransition`

**Returns:** `this`

##### `transitions()`

```typescript
transitions(transitions: VideoTransition[]): this
```

**Parameters:**

- `transitions`: `VideoTransition[]`

**Returns:** `this`

##### `custom()`

```typescript
custom(text: string): this
```

**Parameters:**

- `text`: `string`

**Returns:** `this`

##### `build()`

```typescript
build(): BuiltVideoPrompt
```

**Returns:** `BuiltVideoPrompt`

##### `toString()`

```typescript
toString(): string
```

**Returns:** `string`

##### `toJSON()`

```typescript
toJSON(): string
```

**Returns:** `string`

##### `toYAML()`

```typescript
toYAML(): string
```

**Returns:** `string`

##### `toMarkdown()`

```typescript
toMarkdown(): string
```

**Returns:** `string`

##### `outputFormat()`

```typescript
outputFormat(fmt: OutputFormat): string
```

**Parameters:**

- `fmt`: `OutputFormat`

**Returns:** `string`

### Functions

#### `video()`

Create a new video prompt builder

```typescript
video(): VideoPromptBuilder
```

**Returns:** `VideoPromptBuilder`

---

## builder/audio

Audio/Music Prompt Builder - Comprehensive music generation prompt builder

Based on Suno, Udio, and other music generation best practices.

@example
```ts
import { audio } from 'prompts.chat/builder';

const prompt = audio()
  .genre("synthwave")
  .mood("nostalgic", "dreamy")
  .tempo(110)
  .instruments(["synthesizer", "drums", "bass"])
  .structure({ intro: 8, verse: 16, chorus: 16 })
  .build();
```

### Types

#### `MusicGenre`

```typescript
type MusicGenre = | 'pop' | 'rock' | 'jazz' | 'classical' | 'electronic' | 'hip-hop' | 'r&b'
  | 'country' | 'folk' | 'blues' | 'metal' | 'punk' | 'indie' | 'alternative'
  | 'ambient' | 'lo-fi' | 'synthwave' | 'orchestral' | 'cinematic' | 'world'
  | 'latin' | 'reggae' | 'soul' | 'funk' | 'disco' | 'house' | 'techno' | 'edm'
  | 'trap' | 'drill' | 'k-pop' | 'j-pop' | 'bossa-nova' | 'gospel' | 'grunge'
  | 'shoegaze' | 'post-rock' | 'prog-rock' | 'psychedelic' | 'chillwave'
  | 'vaporwave' | 'drum-and-bass' | 'dubstep' | 'trance' | 'hardcore'
```

#### `Instrument`

```typescript
type Instrument = | 'piano' | 'guitar' | 'acoustic-guitar' | 'electric-guitar' | 'bass' | 'drums'
  | 'violin' | 'cello' | 'viola' | 'flute' | 'saxophone' | 'trumpet' | 'trombone'
  | 'synthesizer' | 'organ' | 'harp' | 'percussion' | 'strings' | 'brass' | 'woodwinds'
  | 'choir' | 'vocals' | 'beatbox' | 'turntables' | 'harmonica' | 'banjo' | 'ukulele'
  | 'mandolin' | 'accordion' | 'marimba' | 'vibraphone' | 'xylophone' | 'timpani'
  | 'congas' | 'bongos' | 'djembe' | 'tabla' | 'sitar' | 'erhu' | 'koto'
  | '808' | '909' | 'moog' | 'rhodes' | 'wurlitzer' | 'mellotron' | 'theremin'
```

#### `VocalStyle`

```typescript
type VocalStyle = | 'male' | 'female' | 'duet' | 'choir' | 'a-cappella' | 'spoken-word' | 'rap'
  | 'falsetto' | 'belting' | 'whisper' | 'growl' | 'melodic' | 'harmonized'
  | 'auto-tuned' | 'operatic' | 'soul' | 'breathy' | 'nasal' | 'raspy' | 'clear'
```

#### `VocalLanguage`

```typescript
type VocalLanguage = | 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'portuguese'
  | 'japanese' | 'korean' | 'chinese' | 'arabic' | 'hindi' | 'russian' | 'turkish'
  | 'instrumental'
```

#### `TempoMarking`

```typescript
type TempoMarking = | 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'vivace' | 'presto'
```

#### `TimeSignature`

```typescript
type TimeSignature = '4/4' | '3/4' | '6/8' | '2/4' | '5/4' | '7/8' | '12/8'
```

#### `MusicalKey`

```typescript
type MusicalKey = | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' 
  | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'
  | 'Cm' | 'C#m' | 'Dm' | 'D#m' | 'Ebm' | 'Em' | 'Fm' | 'F#m' 
  | 'Gm' | 'G#m' | 'Am' | 'A#m' | 'Bbm' | 'Bm'
```

#### `SongSection`

```typescript
type SongSection = | 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'breakdown'
  | 'drop' | 'build-up' | 'outro' | 'solo' | 'interlude' | 'hook'
```

#### `ProductionStyle`

```typescript
type ProductionStyle = | 'lo-fi' | 'hi-fi' | 'vintage' | 'modern' | 'polished' | 'raw' | 'organic'
  | 'synthetic' | 'acoustic' | 'electric' | 'hybrid' | 'minimalist' | 'maximalist'
  | 'layered' | 'sparse' | 'dense' | 'atmospheric' | 'punchy' | 'warm' | 'bright'
```

#### `Era`

```typescript
type Era = | '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s'
  | 'retro' | 'vintage' | 'classic' | 'modern' | 'futuristic'
```

### Interfaces

#### `AudioGenre`

| Property | Type | Description |
|----------|------|-------------|
| `primary` | `MusicGenre` | - |
| `secondary` | `MusicGenre[]` | - |
| `subgenre` | `string` | - |
| `fusion` | `string[]` | - |

#### `AudioMood`

| Property | Type | Description |
|----------|------|-------------|
| `primary` | `Mood | string` | - |
| `secondary` | `(Mood | string)[]` | - |
| `energy` | `'low' | 'medium' | 'high' | 'building' | 'fluctuating'` | - |
| `emotion` | `string` | - |

#### `AudioTempo`

| Property | Type | Description |
|----------|------|-------------|
| `bpm` | `number` | - |
| `marking` | `TempoMarking` | - |
| `feel` | `'steady' | 'swung' | 'shuffled' | 'syncopated' | 'rubato' | 'driving'` | - |
| `variation` | `boolean` | - |

#### `AudioVocals`

| Property | Type | Description |
|----------|------|-------------|
| `style` | `VocalStyle | VocalStyle[]` | - |
| `language` | `VocalLanguage` | - |
| `lyrics` | `string` | - |
| `theme` | `string` | - |
| `delivery` | `string` | - |
| `harmonies` | `boolean` | - |
| `adlibs` | `boolean` | - |

#### `AudioInstrumentation`

| Property | Type | Description |
|----------|------|-------------|
| `lead` | `Instrument | Instrument[]` | - |
| `rhythm` | `Instrument | Instrument[]` | - |
| `bass` | `Instrument` | - |
| `percussion` | `Instrument | Instrument[]` | - |
| `pads` | `Instrument | Instrument[]` | - |
| `effects` | `string[]` | - |
| `featured` | `Instrument` | - |

#### `AudioStructure`

| Property | Type | Description |
|----------|------|-------------|
| `sections` | `unknown` | - |
| `intro` | `number` | - |
| `verse` | `number` | - |
| `chorus` | `number` | - |
| `bridge` | `number` | - |
| `outro` | `number` | - |
| `form` | `string` | - |
| `duration` | `number` | - |

#### `AudioProduction`

| Property | Type | Description |
|----------|------|-------------|
| `style` | `ProductionStyle | ProductionStyle[]` | - |
| `era` | `Era` | - |
| `reference` | `string[]` | - |
| `mix` | `string` | - |
| `mastering` | `string` | - |
| `effects` | `string[]` | - |
| `texture` | `string` | - |

#### `AudioTechnical`

| Property | Type | Description |
|----------|------|-------------|
| `key` | `MusicalKey` | - |
| `timeSignature` | `TimeSignature` | - |
| `duration` | `number` | - |
| `format` | `'song' | 'instrumental' | 'jingle' | 'loop' | 'soundtrack'` | - |

#### `BuiltAudioPrompt`

| Property | Type | Description |
|----------|------|-------------|
| `prompt` | `string` | - |
| `stylePrompt` | `string` | - |
| `lyricsPrompt` | `string` | - |
| `structure` | `unknown` | - |

### Classes

#### `AudioPromptBuilder`

**Methods:**

| Method | Description |
|--------|-------------|
| `genre(primary: MusicGenre | AudioGenre): this` | - |
| `subgenre(subgenre: string): this` | - |
| `fusion(genres: MusicGenre[]): this` | - |
| `mood(primary: Mood | string, ...secondary: (Mood | string)[]): this` | - |
| `energy(level: AudioMood['energy']): this` | - |
| `emotion(emotion: string): this` | - |
| `tempo(bpmOrSettings: number | AudioTempo): this` | - |
| `bpm(bpm: number): this` | - |
| `tempoMarking(marking: TempoMarking): this` | - |
| `tempoFeel(feel: AudioTempo['feel']): this` | - |
| `vocals(settings: AudioVocals): this` | - |
| `vocalStyle(style: VocalStyle | VocalStyle[]): this` | - |
| `language(language: VocalLanguage): this` | - |
| `lyrics(lyrics: string): this` | - |
| `lyricsTheme(theme: string): this` | - |
| `delivery(delivery: string): this` | - |
| `instrumental(): this` | - |
| `instruments(instruments: Instrument[]): this` | - |
| `instrumentation(settings: AudioInstrumentation): this` | - |
| `leadInstrument(instrument: Instrument | Instrument[]): this` | - |
| `rhythmSection(instruments: Instrument[]): this` | - |
| `bassInstrument(instrument: Instrument): this` | - |
| `percussion(instruments: Instrument | Instrument[]): this` | - |
| `pads(instruments: Instrument | Instrument[]): this` | - |
| `featuredInstrument(instrument: Instrument): this` | - |
| `structure(settings: AudioStructure | { [key in SongSection]?: number }): this` | - |
| `section(type: SongSection, bars?: number, description?: string): this` | - |
| `form(form: string): this` | - |
| `duration(seconds: number): this` | - |
| `production(settings: AudioProduction): this` | - |
| `productionStyle(style: ProductionStyle | ProductionStyle[]): this` | - |
| `era(era: Era): this` | - |
| `reference(artists: string[]): this` | - |
| `texture(texture: string): this` | - |
| `effects(effects: string[]): this` | - |
| `technical(settings: AudioTechnical): this` | - |
| `key(key: MusicalKey): this` | - |
| `timeSignature(sig: TimeSignature): this` | - |
| `formatType(format: AudioTechnical['format']): this` | - |
| `tag(tag: string): this` | - |
| `tags(tags: string[]): this` | - |
| `custom(text: string): this` | - |
| `build(): BuiltAudioPrompt` | - |
| `toString(): string` | - |
| `toStyleString(): string` | - |
| `toJSON(): string` | - |
| `toYAML(): string` | - |
| `toMarkdown(): string` | - |
| `outputFormat(fmt: OutputFormat): string` | - |

##### `genre()`

```typescript
genre(primary: MusicGenre | AudioGenre): this
```

**Parameters:**

- `primary`: `MusicGenre | AudioGenre`

**Returns:** `this`

##### `subgenre()`

```typescript
subgenre(subgenre: string): this
```

**Parameters:**

- `subgenre`: `string`

**Returns:** `this`

##### `fusion()`

```typescript
fusion(genres: MusicGenre[]): this
```

**Parameters:**

- `genres`: `MusicGenre[]`

**Returns:** `this`

##### `mood()`

```typescript
mood(primary: Mood | string, ...secondary: (Mood | string)[]): this
```

**Parameters:**

- `primary`: `Mood | string`
- `secondary`: `(Mood | string)[]`

**Returns:** `this`

##### `energy()`

```typescript
energy(level: AudioMood['energy']): this
```

**Parameters:**

- `level`: `AudioMood['energy']`

**Returns:** `this`

##### `emotion()`

```typescript
emotion(emotion: string): this
```

**Parameters:**

- `emotion`: `string`

**Returns:** `this`

##### `tempo()`

```typescript
tempo(bpmOrSettings: number | AudioTempo): this
```

**Parameters:**

- `bpmOrSettings`: `number | AudioTempo`

**Returns:** `this`

##### `bpm()`

```typescript
bpm(bpm: number): this
```

**Parameters:**

- `bpm`: `number`

**Returns:** `this`

##### `tempoMarking()`

```typescript
tempoMarking(marking: TempoMarking): this
```

**Parameters:**

- `marking`: `TempoMarking`

**Returns:** `this`

##### `tempoFeel()`

```typescript
tempoFeel(feel: AudioTempo['feel']): this
```

**Parameters:**

- `feel`: `AudioTempo['feel']`

**Returns:** `this`

##### `vocals()`

```typescript
vocals(settings: AudioVocals): this
```

**Parameters:**

- `settings`: `AudioVocals`

**Returns:** `this`

##### `vocalStyle()`

```typescript
vocalStyle(style: VocalStyle | VocalStyle[]): this
```

**Parameters:**

- `style`: `VocalStyle | VocalStyle[]`

**Returns:** `this`

##### `language()`

```typescript
language(language: VocalLanguage): this
```

**Parameters:**

- `language`: `VocalLanguage`

**Returns:** `this`

##### `lyrics()`

```typescript
lyrics(lyrics: string): this
```

**Parameters:**

- `lyrics`: `string`

**Returns:** `this`

##### `lyricsTheme()`

```typescript
lyricsTheme(theme: string): this
```

**Parameters:**

- `theme`: `string`

**Returns:** `this`

##### `delivery()`

```typescript
delivery(delivery: string): this
```

**Parameters:**

- `delivery`: `string`

**Returns:** `this`

##### `instrumental()`

```typescript
instrumental(): this
```

**Returns:** `this`

##### `instruments()`

```typescript
instruments(instruments: Instrument[]): this
```

**Parameters:**

- `instruments`: `Instrument[]`

**Returns:** `this`

##### `instrumentation()`

```typescript
instrumentation(settings: AudioInstrumentation): this
```

**Parameters:**

- `settings`: `AudioInstrumentation`

**Returns:** `this`

##### `leadInstrument()`

```typescript
leadInstrument(instrument: Instrument | Instrument[]): this
```

**Parameters:**

- `instrument`: `Instrument | Instrument[]`

**Returns:** `this`

##### `rhythmSection()`

```typescript
rhythmSection(instruments: Instrument[]): this
```

**Parameters:**

- `instruments`: `Instrument[]`

**Returns:** `this`

##### `bassInstrument()`

```typescript
bassInstrument(instrument: Instrument): this
```

**Parameters:**

- `instrument`: `Instrument`

**Returns:** `this`

##### `percussion()`

```typescript
percussion(instruments: Instrument | Instrument[]): this
```

**Parameters:**

- `instruments`: `Instrument | Instrument[]`

**Returns:** `this`

##### `pads()`

```typescript
pads(instruments: Instrument | Instrument[]): this
```

**Parameters:**

- `instruments`: `Instrument | Instrument[]`

**Returns:** `this`

##### `featuredInstrument()`

```typescript
featuredInstrument(instrument: Instrument): this
```

**Parameters:**

- `instrument`: `Instrument`

**Returns:** `this`

##### `structure()`

```typescript
structure(settings: AudioStructure | { [key in SongSection]?: number }): this
```

**Parameters:**

- `settings`: `AudioStructure | { [key in SongSection]?: number }`

**Returns:** `this`

##### `section()`

```typescript
section(type: SongSection, bars?: number, description?: string): this
```

**Parameters:**

- `type`: `SongSection`
- `bars`: `number` (optional)
- `description`: `string` (optional)

**Returns:** `this`

##### `form()`

```typescript
form(form: string): this
```

**Parameters:**

- `form`: `string`

**Returns:** `this`

##### `duration()`

```typescript
duration(seconds: number): this
```

**Parameters:**

- `seconds`: `number`

**Returns:** `this`

##### `production()`

```typescript
production(settings: AudioProduction): this
```

**Parameters:**

- `settings`: `AudioProduction`

**Returns:** `this`

##### `productionStyle()`

```typescript
productionStyle(style: ProductionStyle | ProductionStyle[]): this
```

**Parameters:**

- `style`: `ProductionStyle | ProductionStyle[]`

**Returns:** `this`

##### `era()`

```typescript
era(era: Era): this
```

**Parameters:**

- `era`: `Era`

**Returns:** `this`

##### `reference()`

```typescript
reference(artists: string[]): this
```

**Parameters:**

- `artists`: `string[]`

**Returns:** `this`

##### `texture()`

```typescript
texture(texture: string): this
```

**Parameters:**

- `texture`: `string`

**Returns:** `this`

##### `effects()`

```typescript
effects(effects: string[]): this
```

**Parameters:**

- `effects`: `string[]`

**Returns:** `this`

##### `technical()`

```typescript
technical(settings: AudioTechnical): this
```

**Parameters:**

- `settings`: `AudioTechnical`

**Returns:** `this`

##### `key()`

```typescript
key(key: MusicalKey): this
```

**Parameters:**

- `key`: `MusicalKey`

**Returns:** `this`

##### `timeSignature()`

```typescript
timeSignature(sig: TimeSignature): this
```

**Parameters:**

- `sig`: `TimeSignature`

**Returns:** `this`

##### `formatType()`

```typescript
formatType(format: AudioTechnical['format']): this
```

**Parameters:**

- `format`: `AudioTechnical['format']`

**Returns:** `this`

##### `tag()`

```typescript
tag(tag: string): this
```

**Parameters:**

- `tag`: `string`

**Returns:** `this`

##### `tags()`

```typescript
tags(tags: string[]): this
```

**Parameters:**

- `tags`: `string[]`

**Returns:** `this`

##### `custom()`

```typescript
custom(text: string): this
```

**Parameters:**

- `text`: `string`

**Returns:** `this`

##### `build()`

```typescript
build(): BuiltAudioPrompt
```

**Returns:** `BuiltAudioPrompt`

##### `toString()`

```typescript
toString(): string
```

**Returns:** `string`

##### `toStyleString()`

```typescript
toStyleString(): string
```

**Returns:** `string`

##### `toJSON()`

```typescript
toJSON(): string
```

**Returns:** `string`

##### `toYAML()`

```typescript
toYAML(): string
```

**Returns:** `string`

##### `toMarkdown()`

```typescript
toMarkdown(): string
```

**Returns:** `string`

##### `outputFormat()`

```typescript
outputFormat(fmt: OutputFormat): string
```

**Parameters:**

- `fmt`: `OutputFormat`

**Returns:** `string`

### Functions

#### `audio()`

Create a new audio/music prompt builder

```typescript
audio(): AudioPromptBuilder
```

**Returns:** `AudioPromptBuilder`
