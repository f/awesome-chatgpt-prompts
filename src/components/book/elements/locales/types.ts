/**
 * Type definitions for localized book element data.
 */

export interface TemperatureExamplesData {
  prompt: string;
  lowTemp: string[];
  mediumLowTemp: string[];
  mediumHighTemp: string[];
  highTemp: string[];
}

export interface TokenPredictionData {
  tokens: string[];
  fullText: string;
  predictions: {
    empty: Array<{ token: string; probability: number }>;
    partial: { and: string; the: string };
    steps: Record<string, Array<{ token: string; probability: number }>>;
    complete: Array<{ token: string; probability: number }>;
    fallback: Array<{ token: string; probability: number }>;
  };
}

export interface EmbeddingWord {
  word: string;
  vector: number[];
  color: string;
}

export interface Capability {
  title: string;
  description: string;
  example: string;
  canDo: boolean;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  tokens: number;
}

export interface SummarizationStrategy {
  name: string;
  description: string;
  color: string;
  summary?: string;
}

export interface ContextBlock {
  id: string;
  type: "system" | "history" | "rag" | "tools" | "query";
  label: string;
  content: string;
  tokens: number;
  enabled: boolean;
}

export interface ChainScenario {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface ChainStep {
  id: string;
  name: string;
  status: string;
}

export interface TokenizerSample {
  text: string;
  tokens: string[];
}

export interface TokenizerData {
  default: string;
  samples: Record<string, TokenizerSample>;
  tryExamples: string;
}

export interface BuilderField {
  id: "role" | "context" | "task" | "constraints" | "format" | "examples";
  label: string;
  placeholder: string;
  hint: string;
  required?: boolean;
}

export interface ChainType {
  id: string;
  name: string;
  description: string;
  color: string;
  steps: Array<{ label: string; desc: string }>;
}

export interface BookPart {
  number: number;
  title: string;
  description: string;
  customIcon?: boolean;
  color: string;
  slug: string;
}

export interface Principle {
  iconName: string;
  title: string;
  description: string;
  color: string;
}

export interface JailbreakExample {
  name: string;
  attack: string;
  description: string;
  systemPrompt: string;
}

/** Chain Demos Data */
export interface ValidationDemoData {
  title: string;
  validData: string;
  invalidRetry: string;
  run: string;
  step: string;
  steps: Array<{ id: string; name: string }>;
  checksOutput: string;
  usesValidatedData: string;
  retryingStep: string;
  validationFailed: string;
  outputs: {
    ageMustBeNumber: string;
    retryingWithFeedback: string;
    allFieldsValid: string;
    dataProcessedSuccessfully: string;
  };
}

export interface FallbackDemoData {
  title: string;
  primarySucceeds: string;
  useFallback: string;
  run: string;
  primary: string;
  fallback: string;
  output: string;
  steps: Array<{ id: string; name: string; type: string }>;
  standbyIfPrimaryFails: string;
  confidence: string;
  outputs: {
    lowConfidence: string;
    extractedKeyEntities: string;
    resultFromFallback: string;
    deepAnalysisComplete: string;
    resultFromPrimary: string;
  };
}

export interface ContentPipelineDemoData {
  title: string;
  runPipeline: string;
  parallel: string;
  prompt: string;
  steps: Array<{ id: string; name: string }>;
  prompts: Record<string, string>;
  outputs: {
    sectionsOutlined: string;
    writingSectionsParallel: string;
    sectionsDrafted: string;
    editSuggestions: string;
    articlePolished: string;
    seoMetadata: string;
  };
}

/** Frameworks Data */
export interface FrameworkStepData {
  letter: string;
  label: string;
  description: string;
  iconName: string;
  color: string;
  example?: string;
}

export interface FrameworkData {
  name: string;
  steps: FrameworkStepData[];
  examplePrompt: string;
  exampleDescription: string;
}

export interface FrameworksData {
  crispe: FrameworkData;
  break: FrameworkData;
  rtf: FrameworkData;
}

/** Exercises Data */
export interface ExercisesData {
  fillInTheBlank: {
    defaultTitle: string;
    rateLimitReached: string;
    usingLocalValidation: string;
    aiCheckFailed: string;
    aiValidationFailed: string;
    perfect: string;
    xOfYCorrect: string;
    correctAnswer: string;
    wellStructuredPrompt: string;
    consistencyIssuesFound: string;
    issues: string;
    suggestions: string;
    checking: string;
    checkAnswers: string;
    tryAgain: string;
    aiPoweredValidation: string;
    hintForBlank: string;
    showHint: string;
  };
  checklist: {
    defaultTitle: string;
    complete: string;
    allDone: string;
  };
  debugger: {
    defaultTitle: string;
    hideHint: string;
    showHint: string;
    thePrompt: string;
    theOutputProblematic: string;
    whatsWrong: string;
    correct: string;
    notQuite: string;
    tryAgain: string;
  };
}

/** Complete locale data structure */
export interface LocaleData {
  temperatureExamples: TemperatureExamplesData;
  tokenPrediction: TokenPredictionData;
  embeddingWords: EmbeddingWord[];
  capabilities: Capability[];
  sampleConversation: ConversationMessage[];
  strategies: SummarizationStrategy[];
  contextBlocks: ContextBlock[];
  scenarios: ChainScenario[];
  steps: ChainStep[];
  tokenizer: TokenizerData;
  builderFields: BuilderField[];
  chainTypes: ChainType[];
  bookParts: BookPart[];
  principles: Principle[];
  jailbreakExamples: JailbreakExample[];
  imagePromptOptions: Record<string, string[]>;
  imageCategoryLabels: Record<string, string>;
  videoPromptOptions: Record<string, string[]>;
  videoCategoryLabels: Record<string, string>;
  validationDemo: ValidationDemoData;
  fallbackDemo: FallbackDemoData;
  contentPipelineDemo: ContentPipelineDemoData;
  exercises: ExercisesData;
  frameworks: FrameworksData;
}
