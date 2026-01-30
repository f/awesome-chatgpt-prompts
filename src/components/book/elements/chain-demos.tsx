"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, RotateCcw, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ArrowDown, FileText, Search, Edit3, Sparkles, Package } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleField } from "./locales";

type StepStatus = "pending" | "running" | "success" | "failed" | "invalid" | "retrying";

// ============================================
// Validation Demo
// ============================================

interface ValidationStep {
  id: string;
  name: string;
  status: StepStatus;
  output?: string;
  validationResult?: "valid" | "invalid";
  reason?: string;
}

export function ValidationDemo() {
  const locale = useLocale();
  const localeData = getLocaleField(locale, "validationDemo");
  const [scenario, setScenario] = useState<"valid" | "invalid">("invalid");
  const [isRunning, setIsRunning] = useState(false);
  
  const getInitialSteps = (): ValidationStep[] => localeData.steps.map(s => ({ ...s, status: "pending" as StepStatus }));
  const [steps, setSteps] = useState<ValidationStep[]>(getInitialSteps());

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const updateStep = (id: string, updates: Partial<ValidationStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const resetSteps = () => {
    setSteps(getInitialSteps());
  };

  const runDemo = async () => {
    setIsRunning(true);
    resetSteps();
    await delay(300);

    // Step 1: Generate data
    updateStep("generate", { status: "running" });
    await delay(800);
    
    if (scenario === "invalid") {
      // First attempt produces invalid data
      updateStep("generate", { 
        status: "success", 
        output: '{"name": "John", "age": "twenty-five"}' 
      });
      
      await delay(400);
      updateStep("validate", { status: "running" });
      await delay(600);
      updateStep("validate", { 
        status: "failed", 
        validationResult: "invalid",
        reason: localeData.outputs.ageMustBeNumber 
      });
      
      await delay(600);
      // Retry with feedback
      updateStep("generate", { status: "retrying", output: localeData.outputs.retryingWithFeedback });
      await delay(1000);
      updateStep("generate", { 
        status: "success", 
        output: '{"name": "John", "age": 25}' 
      });
      
      await delay(400);
      updateStep("validate", { status: "running", validationResult: undefined, reason: undefined });
      await delay(600);
      updateStep("validate", { 
        status: "success", 
        validationResult: "valid",
        reason: localeData.outputs.allFieldsValid 
      });
    } else {
      // Valid scenario
      updateStep("generate", { 
        status: "success", 
        output: '{"name": "John", "age": 25}' 
      });
      
      await delay(400);
      updateStep("validate", { status: "running" });
      await delay(600);
      updateStep("validate", { 
        status: "success", 
        validationResult: "valid",
        reason: localeData.outputs.allFieldsValid 
      });
    }
    
    await delay(400);
    updateStep("process", { status: "running" });
    await delay(700);
    updateStep("process", { status: "success", output: localeData.outputs.dataProcessedSuccessfully });
    
    setIsRunning(false);
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
        <span className="font-medium text-sm">{localeData.title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setScenario("valid"); resetSteps(); }}
            className={cn(
              "px-2 py-1 text-xs rounded",
              scenario === "valid" ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" : "bg-muted"
            )}
          >
            {localeData.validData}
          </button>
          <button
            onClick={() => { setScenario("invalid"); resetSteps(); }}
            className={cn(
              "px-2 py-1 text-xs rounded",
              scenario === "invalid" ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" : "bg-muted"
            )}
          >
            {localeData.invalidRetry}
          </button>
          <button
            onClick={runDemo}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {localeData.run}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Generate Step */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            steps[0].status === "pending" && "border-dashed border-muted-foreground/30",
            steps[0].status === "running" && "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
            steps[0].status === "success" && "border-green-400 bg-green-50 dark:bg-green-950/30",
            steps[0].status === "retrying" && "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
          )}>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{localeData.step} 1</div>
            <div className="flex items-center gap-2 mb-2">
              {steps[0].status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
              {steps[0].status === "running" && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
              {steps[0].status === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {steps[0].status === "retrying" && <RotateCcw className="w-4 h-4 text-amber-500 animate-spin" />}
              <span className="font-medium text-sm">{steps[0].name}</span>
            </div>
            {steps[0].output && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono break-all">
                {steps[0].output}
              </div>
            )}
          </div>
          
          {/* Validate Step */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            steps[1].status === "pending" && "border-dashed border-muted-foreground/30",
            steps[1].status === "running" && "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
            steps[1].status === "success" && "border-green-400 bg-green-50 dark:bg-green-950/30",
            steps[1].status === "failed" && "border-red-400 bg-red-50 dark:bg-red-950/30"
          )}>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{localeData.step} 2</div>
            <div className="flex items-center gap-2 mb-2">
              {steps[1].status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
              {steps[1].status === "running" && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
              {steps[1].status === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {steps[1].status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
              <span className="font-medium text-sm">{steps[1].name}</span>
            </div>
            {steps[1].validationResult === "invalid" && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">✗ INVALID</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{steps[1].reason}</p>
              </div>
            )}
            {steps[1].validationResult === "valid" && (
              <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium">✓ VALID</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">{steps[1].reason}</p>
              </div>
            )}
            {steps[1].status === "pending" && (
              <p className="text-xs text-muted-foreground">{localeData.checksOutput}</p>
            )}
          </div>
          
          {/* Process Step */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            steps[2].status === "pending" && "border-dashed border-muted-foreground/30",
            steps[2].status === "running" && "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
            steps[2].status === "success" && "border-green-400 bg-green-50 dark:bg-green-950/30"
          )}>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{localeData.step} 3</div>
            <div className="flex items-center gap-2 mb-2">
              {steps[2].status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
              {steps[2].status === "running" && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
              {steps[2].status === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              <span className="font-medium text-sm">{steps[2].name}</span>
            </div>
            {steps[2].output && <p className="text-xs text-muted-foreground">{steps[2].output}</p>}
            {steps[2].status === "pending" && (
              <p className="text-xs text-muted-foreground">{localeData.usesValidatedData}</p>
            )}
          </div>
        </div>
        
        {/* Retry indicator */}
        {scenario === "invalid" && steps[0].status === "retrying" && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <span className="font-medium">↺ {localeData.retryingStep}</span> — {localeData.validationFailed}: "{steps[1].reason}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Fallback Demo
// ============================================

interface FallbackStep {
  id: string;
  name: string;
  type: "primary" | "fallback";
  status: StepStatus;
  output?: string;
  confidence?: number;
}

export function FallbackDemo() {
  const locale = useLocale();
  const localeData = getLocaleField(locale, "fallbackDemo");
  const [scenario, setScenario] = useState<"primary" | "fallback">("fallback");
  const [isRunning, setIsRunning] = useState(false);
  
  const getInitialSteps = (): FallbackStep[] => localeData.steps.map(s => ({ ...s, type: s.type as "primary" | "fallback", status: "pending" as StepStatus }));
  const [steps, setSteps] = useState<FallbackStep[]>(getInitialSteps());

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const updateStep = (id: string, updates: Partial<FallbackStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const resetSteps = () => {
    setSteps(getInitialSteps());
  };

  const runDemo = async () => {
    setIsRunning(true);
    resetSteps();
    await delay(300);

    updateStep("primary", { status: "running" });
    await delay(1000);

    if (scenario === "fallback") {
      updateStep("primary", { 
        status: "failed", 
        output: localeData.outputs.lowConfidence.replace("{confidence}", "32"),
        confidence: 32
      });
      
      await delay(500);
      updateStep("fallback", { status: "running" });
      await delay(800);
      updateStep("fallback", { 
        status: "success", 
        output: localeData.outputs.extractedKeyEntities,
        confidence: 95
      });
      
      await delay(400);
      updateStep("output", { status: "running" });
      await delay(600);
      updateStep("output", { 
        status: "success", 
        output: localeData.outputs.resultFromFallback
      });
    } else {
      updateStep("primary", { 
        status: "success", 
        output: localeData.outputs.deepAnalysisComplete,
        confidence: 94
      });
      
      await delay(400);
      updateStep("output", { status: "running" });
      await delay(600);
      updateStep("output", { 
        status: "success", 
        output: localeData.outputs.resultFromPrimary
      });
    }
    
    setIsRunning(false);
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
        <span className="font-medium text-sm">{localeData.title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setScenario("primary"); resetSteps(); }}
            className={cn(
              "px-2 py-1 text-xs rounded",
              scenario === "primary" ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" : "bg-muted"
            )}
          >
            {localeData.primarySucceeds}
          </button>
          <button
            onClick={() => { setScenario("fallback"); resetSteps(); }}
            className={cn(
              "px-2 py-1 text-xs rounded",
              scenario === "fallback" ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300" : "bg-muted"
            )}
          >
            {localeData.useFallback}
          </button>
          <button
            onClick={runDemo}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {localeData.run}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Primary */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            steps[0].status === "pending" && "border-dashed border-muted-foreground/30",
            steps[0].status === "running" && "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
            steps[0].status === "success" && "border-green-400 bg-green-50 dark:bg-green-950/30",
            steps[0].status === "failed" && "border-red-400 bg-red-50 dark:bg-red-950/30"
          )}>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{localeData.primary}</div>
            <div className="flex items-center gap-2 mb-2">
              {steps[0].status === "running" && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
              {steps[0].status === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {steps[0].status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
              {steps[0].status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
              <span className="font-medium text-sm">{steps[0].name}</span>
            </div>
            {steps[0].output && <p className="text-xs text-muted-foreground">{steps[0].output}</p>}
            {steps[0].confidence && (
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      steps[0].confidence > 70 ? "bg-green-500" : "bg-red-500"
                    )}
                    style={{ width: `${steps[0].confidence}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{localeData.confidence}: {steps[0].confidence}%</p>
              </div>
            )}
          </div>
          
          {/* Fallback */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            steps[1].status === "pending" && "border-dashed border-muted-foreground/30",
            steps[1].status === "running" && "border-purple-400 bg-purple-50 dark:bg-purple-950/30",
            steps[1].status === "success" && "border-purple-400 bg-purple-50 dark:bg-purple-950/30"
          )}>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{localeData.fallback}</div>
            <div className="flex items-center gap-2 mb-2">
              {steps[1].status === "running" && <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />}
              {steps[1].status === "success" && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
              {steps[1].status === "pending" && <AlertTriangle className="w-4 h-4 text-muted-foreground/50" />}
              <span className="font-medium text-sm">{steps[1].name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {steps[1].status === "pending" ? localeData.standbyIfPrimaryFails : steps[1].output}
            </p>
            {steps[1].confidence && (
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${steps[1].confidence}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{localeData.confidence}: {steps[1].confidence}%</p>
              </div>
            )}
          </div>
          
          {/* Output */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-all",
            steps[2].status === "pending" && "border-dashed border-muted-foreground/30",
            steps[2].status === "running" && "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
            steps[2].status === "success" && "border-green-400 bg-green-50 dark:bg-green-950/30"
          )}>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{localeData.output}</div>
            <div className="flex items-center gap-2 mb-2">
              {steps[2].status === "running" && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
              {steps[2].status === "success" && <Package className="w-4 h-4 text-green-500" />}
              {steps[2].status === "pending" && <Package className="w-4 h-4 text-muted-foreground/50" />}
              <span className="font-medium text-sm">{steps[2].name}</span>
            </div>
            {steps[2].output && <p className="text-xs text-muted-foreground">{steps[2].output}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Content Pipeline Demo
// ============================================

interface PipelineStep {
  id: string;
  name: string;
  icon: typeof FileText;
  status: StepStatus;
  output?: string;
  parallel?: boolean;
  prompt?: string;
}

const pipelineIcons: Record<string, typeof FileText> = {
  input: Sparkles,
  outline: Search,
  draft: Edit3,
  review: FileText,
  edit: Edit3,
  metadata: Package,
};

export function ContentPipelineDemo() {
  const locale = useLocale();
  const localeData = getLocaleField(locale, "contentPipelineDemo");
  const [isRunning, setIsRunning] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  
  const getInitialSteps = (): PipelineStep[] => localeData.steps.map(s => ({
    ...s,
    icon: pipelineIcons[s.id],
    status: "pending" as StepStatus,
    output: s.id === "input" ? `"${localeData.prompts.input}"` : undefined,
    parallel: s.id === "draft" ? true : undefined,
  }));
  const [steps, setSteps] = useState<PipelineStep[]>(getInitialSteps());

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const updateStep = (id: string, updates: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const resetSteps = () => {
    setExpandedStep(null);
    setSteps(getInitialSteps());
  };

  const runDemo = async () => {
    setIsRunning(true);
    resetSteps();
    await delay(300);

    // Input ready
    updateStep("input", { status: "success" });
    await delay(400);

    // Step 1: Outline
    updateStep("outline", { status: "running" });
    await delay(1000);
    updateStep("outline", { status: "success", output: localeData.outputs.sectionsOutlined });
    await delay(300);

    // Step 2: Draft (parallel)
    updateStep("draft", { status: "running", output: localeData.outputs.writingSectionsParallel });
    await delay(1500);
    updateStep("draft", { status: "success", output: localeData.outputs.sectionsDrafted });
    await delay(300);

    // Step 3: Review
    updateStep("review", { status: "running" });
    await delay(1000);
    updateStep("review", { status: "success", output: localeData.outputs.editSuggestions });
    await delay(300);

    // Step 4: Final Edit
    updateStep("edit", { status: "running" });
    await delay(800);
    updateStep("edit", { status: "success", output: localeData.outputs.articlePolished });
    await delay(300);

    // Step 5: Metadata
    updateStep("metadata", { status: "running" });
    await delay(700);
    updateStep("metadata", { status: "success", output: localeData.outputs.seoMetadata });

    setIsRunning(false);
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
        <span className="font-medium text-sm">{localeData.title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSteps}
            disabled={isRunning}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={runDemo}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {localeData.runPipeline}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const prompt = localeData.prompts[step.id];
            const isExpanded = expandedStep === step.id;
            const showPrompt = step.status === "running" || isExpanded;
            
            return (
              <div key={step.id} className="relative flex gap-3">
                {index < steps.length - 1 && (
                  <div className={cn(
                    "absolute left-[11px] top-7 w-0.5",
                    showPrompt ? "h-[calc(100%+8px)]" : "h-[calc(100%+8px)]",
                    step.status === "success" ? "bg-green-400" : "bg-muted-foreground/20"
                  )} />
                )}
                <div className="flex items-center justify-center w-6 h-9 shrink-0">
                  {step.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 bg-background flex items-center justify-center"><Icon className="w-3 h-3 text-muted-foreground/50" /></div>}
                  {step.status === "running" && <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent bg-background animate-spin" />}
                  {step.status === "success" && <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    disabled={step.id === "input"}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border transition-all flex items-center justify-between text-left",
                      step.status === "pending" && "bg-muted/20 hover:bg-muted/40",
                      step.status === "running" && "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700",
                      step.status === "success" && "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-950/50",
                      step.id !== "input" && "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{step.name}</span>
                      {step.parallel && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">{localeData.parallel}</span>
                      )}
                    </div>
                    {step.output && (
                      <span className="text-xs text-muted-foreground">{step.output}</span>
                    )}
                  </button>
                  {showPrompt && prompt && step.id !== "input" && (
                    <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-dashed">
                      <div className="text-xs font-medium text-muted-foreground mb-1">{localeData.prompt}:</div>
                      <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/80">{prompt}</pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
