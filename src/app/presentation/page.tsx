import { SlideDeck, SlideTitle, SlideContent, SlideHighlight } from "@/components/presentation/SlideDeck";
import { MoveRight, Star, GitMerge, FileCode2, Sparkles, MessageSquare, Globe, Users, Code, Zap, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Why prompts.chat? | Presentation",
  description: "Discover why prompts are more important than ever in the agentic era.",
};

export default function PresentationPage() {
  return (
    <SlideDeck>
      {/* 1. Title Slide */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 duration-500">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <SlideTitle className="mb-6">Why prompts.chat?</SlideTitle>
        <SlideContent className="max-w-3xl mb-12">Discover why prompts are more important than ever in the agentic era.</SlideContent>
        <p className="text-sm text-muted-foreground animate-pulse mt-8">
          Use arrow keys <MoveRight className="inline w-4 h-4 mx-1" /> or swipe to navigate
        </p>
      </div>

      {/* 2. The Genesis */}
      <div className="flex flex-col justify-center h-full">
        <Star className="w-12 h-12 text-yellow-500 mb-6" />
        <SlideTitle>The History of prompts.chat</SlideTitle>
        <SlideContent>
          From a simple repository to a full-fledged platform. We started as Awesome ChatGPT Prompts, and evolved to support the entire AI community with typed prompts, workflows, and skills.
        </SlideContent>
        <div className="mt-12 p-6 bg-muted/50 rounded-2xl border border-border max-w-2xl">
          <p className="text-lg text-foreground font-mono">
            Awesome ChatGPT Prompts → <SlideHighlight>prompts.chat</SlideHighlight>
          </p>
        </div>
      </div>

      {/* 3. The Paradigm Shift */}
      <div className="flex flex-col justify-center h-full">
        <Zap className="w-12 h-12 text-blue-500 mb-6" />
        <SlideTitle>The Agentic Era</SlideTitle>
        <SlideContent>
          Why are prompts still important? Because agents need instructions. As AI becomes more autonomous, the quality of instructions determines the quality of the outcome.
        </SlideContent>
      </div>

      {/* 4. The Core Question */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <Lightbulb className="w-16 h-16 text-yellow-400 mb-8" />
        <SlideTitle className="text-5xl md:text-6xl">Wait, isn't AI getting smarter?</SlideTitle>
        <SlideContent className="max-w-4xl mt-8">
          Yes, but <SlideHighlight>smart AI still needs direction.</SlideHighlight>
          <br /><br />
          A genius without instructions is just a very capable idle machine.
        </SlideContent>
      </div>

      {/* 5. The Agentic Need */}
      <div className="flex flex-col justify-center h-full">
        <SlideTitle>The Agentic Need</SlideTitle>
        <SlideContent>
          Agents require precise instructions, constraints, and goal definitions.
          <ul className="mt-8 space-y-6 list-disc list-inside ml-4 text-foreground/80 text-2xl md:text-3xl">
            <li>What tools can they use?</li>
            <li>What are their boundaries?</li>
            <li>How should they format the output?</li>
            <li>What tone should they adopt?</li>
          </ul>
        </SlideContent>
      </div>

      {/* 6. The SLM Revolution */}
      <div className="flex flex-col justify-center h-full">
        <Globe className="w-12 h-12 text-green-500 mb-6" />
        <SlideTitle>Crucial for SLMs</SlideTitle>
        <SlideContent>
          Small Language Models (SLMs) are the future of edge computing. They require precise, well-crafted prompts to perform tasks accurately without the massive parameter count of frontier models.
        </SlideContent>
      </div>

      {/* 7. SLM Constraints */}
      <div className="flex flex-col justify-center h-full">
        <SlideTitle>SLM Constraints</SlideTitle>
        <SlideContent>
          Smaller models lack the vast "common sense" of 1T+ parameter models.
          <br /><br />
          They require <SlideHighlight>highly optimized, battle-tested prompts</SlideHighlight> to punch above their weight class and run efficiently on local devices.
        </SlideContent>
      </div>

      {/* 8. The New Primitive */}
      <div className="flex flex-col justify-center h-full">
        <FileCode2 className="w-12 h-12 text-purple-500 mb-6" />
        <SlideTitle>Prompts are New Code Snippets</SlideTitle>
        <SlideContent>
          Just as developers copy/paste code snippets from StackOverflow, AI practitioners now share prompt templates. Prompts are the new primitive of programming.
        </SlideContent>
        <div className="mt-12 flex items-center gap-4 text-xl md:text-2xl font-mono text-muted-foreground bg-muted p-6 rounded-xl border max-w-fit">
          <span>const codeSnippet = "..."</span>
          <MoveRight className="w-6 h-6 text-primary mx-2" />
          <span className="text-primary">const promptTemplate = "..."</span>
        </div>
      </div>

      {/* 9. Open Source AI */}
      <div className="flex flex-col justify-center h-full">
        <Users className="w-12 h-12 text-indigo-500 mb-6" />
        <SlideTitle>Community Sharing</SlideTitle>
        <SlideContent>
          Nobody learns in isolation. By sharing prompts, we accelerate the collective understanding of how to communicate with AI. It's the open-source movement for human-AI interaction.
        </SlideContent>
      </div>

      {/* 10. Collective Intelligence */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <SlideTitle className="text-5xl md:text-6xl">Collective Intelligence</SlideTitle>
        <SlideContent className="max-w-4xl mt-8">
          We are building the <SlideHighlight>largest open repository</SlideHighlight> of human-AI interaction patterns.
          <br /><br />
          Tested, versioned, and peer-reviewed.
        </SlideContent>
      </div>

      {/* 11. Feature - Typed Prompts */}
      <div className="flex flex-col justify-center h-full">
        <Code className="w-12 h-12 text-red-500 mb-6" />
        <SlideTitle>Feature: Typed Prompts</SlideTitle>
        <SlideContent>
          Natural language is ambiguous. <SlideHighlight>Typed Prompts</SlideHighlight> bring structure.
          <br /><br />
          Define inputs, outputs, and variables systematically so prompts can be executed predictably via APIs.
        </SlideContent>
      </div>

      {/* 12. Feature - Workflows */}
      <div className="flex flex-col justify-center h-full">
        <div className="flex gap-2 mb-6">
          <div className="w-8 h-8 rounded bg-primary"></div>
          <MoveRight className="w-8 h-8 text-muted-foreground" />
          <div className="w-8 h-8 rounded bg-primary/70"></div>
          <MoveRight className="w-8 h-8 text-muted-foreground" />
          <div className="w-8 h-8 rounded bg-primary/40"></div>
        </div>
        <SlideTitle>Feature: Workflows</SlideTitle>
        <SlideContent>
          Some tasks are too complex for a single prompt.
          <br /><br />
          Chain multiple prompts together to create <SlideHighlight>Workflows</SlideHighlight> — dividing and conquering complex agentic tasks.
        </SlideContent>
      </div>

      {/* 13. Feature - Agent Skills */}
      <div className="flex flex-col justify-center h-full">
        <SlideTitle>Feature: Agent Skills</SlideTitle>
        <SlideContent>
          Equip coding assistants (like Claude, Cursor, Windsurf) with specialized, multi-file capabilities.
          <br /><br />
          Give your AI the context and rules it needs to build within your specific tech stack.
        </SlideContent>
      </div>

      {/* 14. Feature - Change Requests */}
      <div className="flex flex-col justify-center h-full">
        <GitMerge className="w-12 h-12 text-orange-500 mb-6" />
        <SlideTitle>Feature: Change Requests</SlideTitle>
        <SlideContent>
          Prompts evolve. We've introduced <SlideHighlight>Pull Requests for Prompts.</SlideHighlight>
          <br /><br />
          Collaborate, suggest improvements, and refine instructions together as a community.
        </SlideContent>
      </div>

      {/* 15. For Developers */}
      <div className="flex flex-col justify-center h-full">
        <SlideTitle>For Developers</SlideTitle>
        <SlideContent>
          prompts.chat isn't just for end-users. With features like Agent Skills, Typed Prompts, and API integrations, it's a vital tool for developers building the next generation of AI apps.
        </SlideContent>
      </div>

      {/* 16. For Everyone */}
      <div className="flex flex-col justify-center h-full">
        <MessageSquare className="w-12 h-12 text-pink-500 mb-6" />
        <SlideTitle>For Everyone</SlideTitle>
        <SlideContent>
          Discover, collect, and learn from <SlideHighlight>Promptmasters</SlideHighlight>.
          <br /><br />
          A beautifully designed, accessible platform to find exactly what you need to make AI work for you.
        </SlideContent>
      </div>

      {/* 17. Self-Hosted */}
      <div className="flex flex-col justify-center h-full">
        <Globe className="w-12 h-12 text-teal-500 mb-6" />
        <SlideTitle>Fully Self-Hosted</SlideTitle>
        <SlideContent>
          Your data, your platform.
          <br /><br />
          prompts.chat is <SlideHighlight>100% open-source</SlideHighlight> and deployable to any server or cloud provider. Own your organization's prompt library securely.
        </SlideContent>
      </div>

      {/* 18. The Vision */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <SlideTitle className="text-5xl md:text-6xl">The Vision</SlideTitle>
        <SlideContent className="max-w-4xl mt-8">
          To create the <SlideHighlight>standard protocol</SlideHighlight> for human-AI interaction.
          <br /><br />
          Where every great instruction is shared, improved, and accessible to all.
        </SlideContent>
      </div>

      {/* 19. Call to Action */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
          <Users className="w-12 h-12 text-primary" />
        </div>
        <SlideTitle>Join the Community</SlideTitle>
        <SlideContent className="max-w-2xl mb-12">
          Start exploring, sharing, and building the future of AI interaction today.
        </SlideContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/discover">
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl">Explore Prompts</Button>
          </Link>
          <Link href="https://github.com/fka/awesome-chatgpt-prompts" target="_blank">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl">Star on GitHub</Button>
          </Link>
        </div>
      </div>
    </SlideDeck>
  );
}
