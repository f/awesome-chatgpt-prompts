"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Embeddings Demo
interface EmbeddingWord {
  word: string;
  vector: number[];
  color: string;
}

const embeddingWords: EmbeddingWord[] = [
  { word: "happy", vector: [0.82, 0.75, 0.15, 0.91], color: "amber" },
  { word: "joyful", vector: [0.79, 0.78, 0.18, 0.88], color: "amber" },
  { word: "delighted", vector: [0.76, 0.81, 0.21, 0.85], color: "amber" },
  { word: "sad", vector: [0.18, 0.22, 0.85, 0.12], color: "blue" },
  { word: "unhappy", vector: [0.21, 0.19, 0.82, 0.15], color: "blue" },
  { word: "angry", vector: [0.45, 0.12, 0.72, 0.35], color: "red" },
  { word: "furious", vector: [0.48, 0.09, 0.78, 0.32], color: "red" },
];

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const embeddingColors: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300", bar: "bg-amber-500" },
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300", bar: "bg-blue-500" },
  red: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-300 dark:border-red-700", text: "text-red-700 dark:text-red-300", bar: "bg-red-500" },
};

export function EmbeddingsDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = embeddingWords[selectedIndex];
  const selectedColors = embeddingColors[selected.color];

  const similarities = embeddingWords.map((w, i) => ({
    ...w,
    similarity: i === selectedIndex ? 1 : cosineSimilarity(selected.vector, w.vector),
    index: i,
  })).sort((a, b) => b.similarity - a.similarity);

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <h4 className="font-semibold mt-2!">Embeddings Visualization</h4>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4 mt-0!">
          Click a word to see its vector and similarity to other words:
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {embeddingWords.map((w, index) => {
            const c = embeddingColors[w.color];
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-all",
                  selectedIndex === index 
                    ? cn(c.bg, c.border, c.text, "border-2") 
                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                )}
              >
                {w.word}
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className={cn("p-4 rounded-lg border", selectedColors.bg, selectedColors.border)}>
            <p className={cn("font-semibold mb-2 mt-0!", selectedColors.text)}>"{selected.word}" vector</p>
            <div className="space-y-2">
              {selected.vector.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8">d{i + 1}:</span>
                  <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
                    <div 
                      className={cn("h-full rounded transition-all", selectedColors.bar)}
                      style={{ width: `${val * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-10">{val.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2 m-0!">Similarity to "{selected.word}"</p>
            {similarities.map((w) => {
              const c = embeddingColors[w.color];
              const percent = Math.round(w.similarity * 100);
              const isSame = w.index === selectedIndex;
              return (
                <div key={w.index} className="flex items-center gap-2">
                  <span className={cn("text-sm w-20", c.text)}>{w.word}</span>
                  <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                    <div 
                      className={cn("h-full rounded transition-all", c.bar, isSame && "opacity-50")}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-mono w-12",
                    percent >= 95 ? "text-green-600 dark:text-green-400" : 
                    percent >= 80 ? "text-amber-600 dark:text-amber-400" : 
                    "text-muted-foreground"
                  )}>
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 m-0!">
          Words with similar meanings (like "happy" and "joyful") have similar vectors, resulting in high similarity scores.
        </p>
      </div>
    </div>
  );
}

// LLM Capabilities Demo
interface Capability {
  title: string;
  description: string;
  example: string;
  canDo: boolean;
}

const capabilities: Capability[] = [
  { title: "Write text", description: "Stories, emails, essays, summaries", example: "Write a professional email declining a meeting politely", canDo: true },
  { title: "Explain things", description: "Break down complex topics simply", example: "Explain quantum physics like I'm 10 years old", canDo: true },
  { title: "Translate", description: "Between languages and formats", example: "Translate this to Spanish: 'Hello, how are you?'", canDo: true },
  { title: "Code", description: "Write, explain, and fix code", example: "Write a Python function to reverse a string", canDo: true },
  { title: "Play roles", description: "Act as different characters or experts", example: "You are a career coach. Review my resume.", canDo: true },
  { title: "Reason step-by-step", description: "Solve problems with logical thinking", example: "If I have 3 apples and give away 1, then buy 5 more...", canDo: true },
  { title: "Know current events", description: "Their knowledge stops at a training date", example: "Who won the game last night?", canDo: false },
  { title: "Take real actions", description: "They can only write text (unless connected to tools)", example: "Send an email to my boss", canDo: false },
  { title: "Remember past chats", description: "Each conversation starts fresh", example: "What did we talk about last week?", canDo: false },
  { title: "Always be correct", description: "They sometimes make up plausible-sounding facts", example: "What's the phone number of this restaurant?", canDo: false },
  { title: "Do complex math", description: "Calculations with many steps often go wrong", example: "Calculate 847 × 293 + 1847 ÷ 23", canDo: false },
];

export function LLMCapabilitiesDemo() {
  const canDo = capabilities.filter(c => c.canDo);
  const cannotDo = capabilities.filter(c => !c.canDo);

  return (
    <div className="my-6 grid md:grid-cols-2 gap-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-sm text-green-700 dark:text-green-300">Can Do Well</span>
        </div>
        <div className="p-2 space-y-1">
          {canDo.map((cap) => (
            <div key={cap.title} className="px-2 py-1.5 rounded bg-green-50/50 dark:bg-green-950/20">
              <p className="font-medium text-sm text-green-800 dark:text-green-200 m-0!">{cap.title}</p>
              <p className="text-xs text-muted-foreground m-0!">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="font-semibold text-sm text-red-700 dark:text-red-300">Cannot Do</span>
        </div>
        <div className="p-2 space-y-1">
          {cannotDo.map((cap) => (
            <div key={cap.title} className="px-2 py-1.5 rounded bg-red-50/50 dark:bg-red-950/20">
              <p className="font-medium text-sm text-red-800 dark:text-red-200 m-0!">{cap.title}</p>
              <p className="text-xs text-muted-foreground m-0!">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
