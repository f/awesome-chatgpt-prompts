import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Sparkles, Brain, Layers, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Interactive Book of Prompting | prompts.chat",
  description: "An Interactive Guide to Crafting Clear and Effective Prompts",
};

export default function BookHomePage() {
  const highlights = [
    { icon: Brain, text: "Understanding how AI models think and process prompts" },
    { icon: Target, text: "Crafting clear, specific, and effective prompts" },
    { icon: Layers, text: "Advanced techniques: chain-of-thought, few-shot learning, and prompt chaining" },
    { icon: Sparkles, text: "Interactive examples you can try directly in the browser" },
    { icon: Lightbulb, text: "Real-world use cases for writing, coding, education, and business" },
    { icon: BookOpen, text: "The future of prompting: agents and agentic systems" },
  ];

  return (
    <div className="max-w-2xl">
      {/* Book Cover Image */}
      <div className="mb-10">
        <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
          <Image
            src="/book-cover-photo.jpg"
            alt="The Interactive Book of Prompting"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Book Cover Header */}
      <div className="mb-10">
        <p className="text-sm text-muted-foreground mb-4">An Interactive Guide by</p>
        <h2 className="text-lg font-medium mb-6">Fatih Kadir Akın</h2>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          The Interactive Book of Prompting
        </h1>
        <p className="text-xl text-muted-foreground">
          An Interactive Guide to Crafting Clear and Effective Prompts
        </p>
      </div>

      {/* Author Introduction */}
      <div className="mb-10 text-muted-foreground space-y-4">
        <p>
          Hi, I&apos;m <strong className="text-foreground">Fatih Kadir Akın</strong>, the curator of the popular{" "}
          <a href="https://github.com/f/awesome-chatgpt-prompts" className="text-primary hover:underline">
            Awesome ChatGPT Prompts
          </a>{" "}
          repository on GitHub and <strong className="text-foreground">prompts.chat</strong>.
        </p>
        <p>
          In this comprehensive and interactive guide, you&apos;ll discover expert strategies for crafting 
          compelling AI prompts that drive engaging and effective conversations. From understanding 
          how AI models work to mastering advanced techniques like prompt chaining and agentic systems, 
          this book provides you with the tools you need to take your AI interactions to the next level.
        </p>
      </div>

      {/* Highlights */}
      <div className="mb-10">
        <h3 className="text-sm font-semibold text-foreground mb-4">What you&apos;ll learn:</h3>
        <div className="space-y-3">
          {highlights.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <item.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Book Structure */}
      <div className="mb-10 p-6 bg-muted/30 rounded-lg">
        <h3 className="text-sm font-semibold text-foreground mb-3">Book Structure</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>• Introduction</div>
          <div>• Part 1: Foundations</div>
          <div>• Part 2: Techniques</div>
          <div>• Part 3: Advanced Strategies</div>
          <div>• Part 4: Best Practices</div>
          <div>• Part 5: Use Cases</div>
          <div>• Part 6: Conclusion</div>
          <div>• 25 Interactive Chapters</div>
        </div>
      </div>

      {/* CTA */}
      <div className="mb-10 flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link href="/book/00a-preface">
            Start Reading
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/book/01-understanding-ai-models">
            Skip to Chapter 1
          </Link>
        </Button>
      </div>

      {/* Note */}
      <div className="text-sm text-muted-foreground italic">
        <p>This book is continuously updated with new techniques and insights as AI evolves.</p>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t text-sm text-muted-foreground">
        <p>
          Part of the{" "}
          <a href="https://github.com/f/awesome-chatgpt-prompts" className="text-primary hover:underline">
            Awesome ChatGPT Prompts
          </a>{" "}
          project. Licensed under CC0.
        </p>
      </div>
    </div>
  );
}
