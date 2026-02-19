import { SlideDeck, SlideTitle, SlideContent, SlideHighlight } from "@/components/presentation/SlideDeck";
import { StatsSlide, TimelineSlide, TypedPromptsDemoSlide, ModelComparisonSlide, FeatureShowcaseSlide } from "@/components/presentation/interactive-slides";
import { MoveRight, Star, GitMerge, MessageSquare, Globe, Users, Code, Zap, Lightbulb, Smartphone, Chrome, Terminal, Puzzle, Server, Waypoints, Github, Linkedin } from "lucide-react";
import { Schoolbell } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const kidsFont = Schoolbell({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "Why prompts.chat? | Presentation",
  description: "Discover why prompts are more important than ever in the agentic era.",
};

const speakerNotes = [
  // 1. Title
  "Hi everyone, thank you so much for being here today. [smile] I really appreciate you taking the time. So, today I want to talk about something I've been working on for a few years now — it's called prompts.chat. And I want to explain what it is, why we built it, and honestly, why I think prompts are more important now than they've ever been. [pause] You know, there's this idea that AI is getting so smart that we won't need prompts anymore. I hear that a lot. But I think the opposite is true, and I want to show you why. [stop] So let's get into it.",
  // 2. Who am I
  "But first, let me introduce myself. [smile] My name is Fatih Kadir Akın. I'm a software developer from Istanbul, and I'm currently working as a DevRel Manager at Teknasyon. I've been coding for... I don't know, a long time now, mostly JavaScript, some Ruby, a bit of everything really. [pause] I'm also a GitHub Star, which is kind of cool — GitHub has this program where they recognize developers who are doing interesting things in open source. [smile] And back in December 2022, when ChatGPT first came out, I created this repository called Awesome ChatGPT Prompts. I'll tell you more about that in a second. I also wrote a book about prompting — The Interactive Book of Prompting — which I sell on Gumroad. [pause] So yeah, prompts have been my thing for a while now. It's kind of my obsession at this point. [smile]",
  // 3. The Genesis
  "OK so how did this all start? [pause] Well, it was actually super simple. When ChatGPT first launched — I think it was late November 2022 — I was just playing around with it, like everyone else. And I was trying different prompts, and some of them worked really well. So I thought, hey, why don't I put these in a GitHub repo so other people can use them too? [smile] So I made a repo, called it Awesome ChatGPT Prompts, and it was literally just a README file with some useful prompts. That's it. Nothing fancy. [pause] But then something crazy happened. People started sharing it on Twitter, on Reddit, on Hacker News. It got thousands of stars in the first week. Then tens of thousands. It just kept growing and growing. [stop] And at some point I realized — OK, this is not just a README anymore. People actually need a real platform for this. And that's how prompts.chat was born.",
  // 4. Timeline
  "Here you can see the full timeline of our journey. [point to screen] So it started in December 2022 — just a repo, just a README. Then in early 2023, things went viral. We hit 100K stars, which was insane. I published the first edition of the book. Lots of contributors started coming in from all over the world. [pause] Then in 2024, we did a big UI refresh. We started thinking about this more seriously as a product. We redesigned everything, made it more professional. [pause] And then 2025 was the big year — we launched the full platform. Built it from scratch with Next.js, added user accounts, categories, tags, a whole prompt management system. [stop] And now in 2026, we have agentic features — agent skills, MCP integration, typed prompts SDK, the iOS app... it's become a real ecosystem. [smile] Pretty wild journey if you think about it.",
  // 5. Stats
  "And let me show you some numbers, because I think they really tell the story. [pause] 145,000+ stars on GitHub. That makes it one of the most starred repositories in the entire AI category. More than 1,000 community-contributed prompts. 300+ contributors — people from all over the world who have helped build this. And 19,200+ forks. [stop] And I want to be clear about something — this is not my project. I mean, I started it, sure. But this is a community project. These numbers represent thousands of people who cared enough to contribute, to share their knowledge, to help others get better at talking to AI. [smile] That's what makes this special. It's not one person — it's collective effort.",
  // 6. The Agentic Era
  "OK, now let's get into the meat of the talk. [pause] Why do prompts still matter? I know, I know — you're probably thinking, AI is getting smarter every day, models are getting bigger, they understand more context... so why do we need prompts? [pause] Well, here's the thing. We are now entering what people call the agentic era. AI agents — software that can act on its own, make decisions, use tools, browse the web, write code. These agents are amazing. But here's the catch: [stop] they still need instructions. They need someone to tell them what to do, how to do it, and what the boundaries are. And those instructions? Those are prompts. The quality of the prompt directly determines the quality of what the agent does. Bad prompt, bad result. Good prompt, great result. It's that simple.",
  // 7. Core Question
  "People ask me this all the time. They come up to me after talks and say: [pause] \"Fatih, isn't AI getting smart enough that we won't need prompts anymore?\" And I always smile and say the same thing — no, absolutely not. [smile] Think about it this way. Let's say you have the smartest person in the world sitting in a room. A genius. IQ off the charts. But you don't tell them what to work on. You don't give them a task. You don't give them any context. What happens? [pause] Nothing. They just sit there. They might be brilliant, but without direction, they're useless. [stop] It's the same with AI. A very powerful model with no instructions is just... an expensive idle machine. The prompt is what turns potential into action.",
  // 8. Agentic Need
  "Let me make this more concrete. [pause] Think about what an AI agent actually needs to know to do its job. It needs to know: what tools am I allowed to use? Can I browse the web? Can I run code? Can I send emails? [pause] It needs to know its limits — what should I NOT do? What are my boundaries? It needs to know how to format the output — should I give a JSON response? A markdown document? A simple yes or no? [stop] And it needs to know the tone — should I be formal? Casual? Technical? Friendly? [pause] All of these things come from prompts. Every single one of them. Prompts are not just the question you ask the AI. Prompts are the entire control layer. They're the configuration, the rules, the personality, the constraints. Without good prompts, agents are unpredictable. With good prompts, they're incredibly powerful.",
  // 9. Crucial for SLMs
  "And this is where it gets really interesting. [pause] Because we're not just talking about big models here. You know, the GPT-4s, the Claudes, the Geminis — these frontier models with hundreds of billions or even trillions of parameters. Those models are pretty forgiving. You can give them a so-so prompt and they'll still figure it out. [pause] But what about Small Language Models? SLMs? The ones that run on your phone, your laptop, your Raspberry Pi. Models with 2 billion, 3 billion, 8 billion parameters. [stop] These models are the future of edge computing. They're private, they're fast, they don't need the cloud. But they are small. And because they're small, they need really, really good prompts. They can't guess what you mean. You have to be precise. And that's exactly what prompts.chat helps with.",
  // 10. Model Comparison
  "Let me show you this chart because I think it makes the point really clearly. [point to screen] On the left, you have the big models — trillions of parameters. Their need for prompt quality is moderate. They can handle vague instructions. [pause] But look what happens as you go to the right — smaller and smaller models. 70 billion, 8 billion, 3.8 billion, 2 billion parameters. The bars get bigger and bigger. The smaller the model, the more it depends on prompt quality. [stop] So if you're building something that runs on a phone, or in a car, or on an embedded device — and a lot of companies are doing this right now — you need prompts that are tested, proven, optimized. Not just something you wrote in five seconds. And that's what our community provides.",
  // 11. SLM Constraints
  "Let me put it another way. [pause] Big models have what I like to call \"common sense\" — in quotes, of course, because it's not real common sense, but they've seen so much data that they can fill in the gaps. If your prompt is a bit vague, they can figure out what you probably meant. [pause] Small models don't have that luxury. They've seen less data, they have fewer parameters, less room to store patterns. So when you give them a vague prompt, they get confused. They hallucinate more. They give you weird outputs. [stop] But here's the exciting part — with the right prompt, a 3 billion parameter model can do things that would have required a 70 billion parameter model just a year ago. That's the power of prompt engineering. And prompts.chat is basically a library of these battle-tested, optimized prompts that help small models punch way above their weight. [smile]",
  // 12. Community Sharing
  "OK, let me shift gears a bit and talk about community. [pause] Because I think this is actually the most important part. Nobody learns how to talk to AI alone. I mean, you can try, but you'll be reinventing the wheel every time. [smile] When we share prompts openly, when we put them in a public place where anyone can find them, copy them, modify them — we're accelerating everyone's learning. [pause] It's like open source, right? In the early days of programming, everyone wrote their own sorting algorithms. Now nobody does that — you use a library. I think prompts are going the same way. Why write your own prompt from scratch when someone has already written and tested one that works great? [stop] That's the philosophy behind prompts.chat. It's the open-source movement, but for human-AI communication. And I think that's a really beautiful idea. [smile]",
  // 13. Collective Intelligence
  "And when you zoom out, what we're actually building here is something pretty special. [pause] We're building the largest open collection of human-AI interaction patterns in the world. [stop] Think about that for a second. Every prompt on prompts.chat has been written by a real person, tested in real situations, and often improved by other community members. It's peer-reviewed. It's versioned — we keep track of changes, just like code. [pause] Someone once told me it's like Wikipedia but for prompts, and I think that's actually a pretty good comparison. [smile] It's collective intelligence. It's thousands of people pooling their knowledge about how to talk to AI effectively. And that knowledge is free, open, and available to everyone.",
  // 14. Feature: Typed Prompts
  "Alright, let me walk you through some of the features we've built. [pause] And I want to start with one that I'm really proud of — Typed Prompts. [stop] So here's the problem. Natural language is messy. When you write a prompt, you might say \"give me a summary\" — but what does that mean? How long? What format? What should be included? It's ambiguous. [pause] So what we did is we added structure to prompts. With Typed Prompts, you can define the inputs — what variables the prompt needs. You can define the output format. You can set constraints. It's like... giving prompts a type system. [smile] And the cool thing is, because they're structured, you can now execute them programmatically through APIs. You can build applications on top of them. You're not just copy-pasting text anymore — you're using prompts as actual building blocks. This is a really big deal for developers.",
  // 15. Typed Prompts SDK Demo
  "And let me show you the SDK in action. [point to screen] So on the left side, you can see the code. We're using the image builder from the prompts.chat package. And look how clean this is — you call image(), then you chain methods: subject, environment, shot, lens, angle, lighting, time of day, medium. It reads like English, but it's fully typed TypeScript. [pause] Now look at the right side. This is what happens when you make a mistake. Someone typed \"ultra-zoom\" as the shot type. But that's not a valid value. And TypeScript immediately catches it — at build time, not at runtime. You get a clear error: \"ultra-zoom is not assignable to type ShotType.\" And it even tells you the valid options. [smile] This is type safety for prompts. No more sending bad prompts to the API and getting weird results back. You catch errors before they happen. I think that's pretty cool. [pause]",
  // 16. When It Compiles
  "And here's what happens when everything is correct and you call build. [point to screen] You can see the code on top — subject, environment, camera settings, lighting, style. All structured, all typed. [pause] And then the arrow points down to the compiled output. Just one clean sentence: \"a lone samurai, bamboo forest at dawn, wide shot, low-angle, 35mm lens, rim lighting, golden-hour, cinematic.\" [stop] That's it. That's what gets sent to the AI. The SDK takes all your structured parameters and compiles them into the perfect prompt string. No typos, no missing commas, no wrong order. [pause] And if you're building an app that generates images — like a design tool or a creative platform — you can just use this SDK and let your users build prompts through a nice UI, while the SDK handles all the formatting behind the scenes. It's a developer tool that saves you so much time.",
  // 17. Workflows
  "Next feature — Workflows. [pause] So here's the thing about real-world AI tasks. They're rarely just one prompt. Usually you need to do something like: first, analyze the input. Then, based on the analysis, generate something. Then, review what was generated. Then, format the final output. [pause] That's four prompts chained together. And each one depends on the output of the previous one. We call these Workflows. [stop] Think of it like a pipeline. Step one feeds into step two, which feeds into step three. And you can build really complex things this way — like a content creation pipeline, or a code review workflow, or a customer support automation. [pause] The beauty of it is that each step is just a prompt. And because they're on prompts.chat, they can be shared, reused, and improved by the community. So you're not building everything from scratch.",
  // 18. Agent Skills
  "Agent Skills is another one I'm really excited about. [smile] OK so, you know how a lot of developers are now using AI coding assistants? Things like Claude in the terminal, Cursor, Windsurf, GitHub Copilot. These tools are amazing, but they have a problem — they don't know your specific project. [pause] They don't know your coding conventions, your architecture decisions, your tech stack preferences. So you spend a lot of time explaining the same things over and over. [stop] Agent Skills solve this. A Skill is basically a set of files — instructions, rules, context — that you install into your coding assistant. It's like giving your AI a manual for your specific project. [pause] And the cool part is, anyone can create and share Skills on prompts.chat. So if someone has already created a great Skill for, say, building Next.js apps, or working with Prisma, or writing React components — you can just install it and your AI immediately knows how to work in that context. Very powerful stuff.",
  // 19. Change Requests
  "And here's something that I think is really innovative — Change Requests. [pause] So you know how in software development, we have Pull Requests? Someone writes code, you review it, suggest changes, they update it, and eventually it gets merged. It's a great system for collaboration. [stop] Well, we built the same thing for prompts. [smile] Someone writes a prompt on prompts.chat. You try it, and you think — hey, this is good, but it could be even better if you added this constraint, or changed that wording. So you submit a Change Request. The original author gets notified, reviews your suggestion, and can accept or decline it. [pause] This means prompts on our platform actually get better over time. They're not static. They evolve through community collaboration, just like open-source code. I think this is how all AI knowledge should work — collaboratively, transparently, openly.",
  // 20. Feature Showcase
  "Here's a quick overview of everything we've built. [point to screen] And I'm going to go through them quickly because we've already talked about most of these. Typed Prompts — structured, type-safe prompts. Agent Skills — for coding assistants. Change Requests — collaboration on prompts. [pause] Promptmasters — that's our leaderboard system where the top contributors get recognized. MCP integration — I'll talk about this more in a bit, but basically your AI tools can directly access prompts from our platform. And AI-powered semantic search — so you can search for prompts by meaning, not just keywords. [stop] There's a lot packed into this platform. And we're adding more every month. [smile]",
  // 21. For Developers
  "Now, who is all this for? [pause] Well, first and foremost — developers. If you're building AI applications, prompts.chat is a tool you should know about. You've got the SDK for building typed prompts programmatically. You've got Agent Skills for supercharging your coding assistant. You've got a full REST API so you can integrate prompts into your own apps. [pause] And here's something people don't always realize — prompts.chat is not just a website. It's infrastructure. You can build your entire prompt management layer on top of it. Store your prompts, version them, serve them through an API, even use our MCP server so that any AI tool can discover and use your prompts. [stop] For developers, it's like having npm but for AI prompts. [smile]",
  // 22. For Everyone
  "But it's definitely not only for developers. [smile] That's important to me. Any non-tech person should be able to use this too, you know? [pause] If you're a teacher, a writer, a marketer, a student — anyone who uses AI — you can just come to prompts.chat, browse through categories, find prompts that help you do your job better, and save them to your collection. [pause] You can follow categories you're interested in — like \"writing\" or \"coding\" or \"education\" — and get a personalized feed of new prompts. You can upvote prompts that you think are good, which helps other people find the best ones. [stop] The whole platform is designed to be simple and beautiful. No technical knowledge required. Just find what you need and use it.",
  // 23. Discover & Feed
  "And let me tell you about the Discover and Feed features, because I think they're really important for everyday users. [pause] When you open prompts.chat, the Discover page shows you what's hot right now. Featured prompts that our team has hand-picked. Today's most upvoted prompts. The latest additions. Recently updated ones. Prompts with the most contributors. [stop] It's like a homepage that's always fresh, always showing you something interesting. [pause] And then there's your personal Feed. Once you subscribe to categories — say you're interested in coding, creative writing, and data analysis — your Feed shows you new prompts only from those categories. It's like your own personalized prompt newsletter. [smile] No noise, just the stuff you care about.",
  // 24. Collections
  "We also have Collections. [pause] And this is one of those features that sounds simple but is actually super useful. When you find a prompt you like, you can bookmark it — add it to your collection. And then all your saved prompts are in one place. [pause] So let's say you're a content marketer. Over time, you build up a collection of prompts for writing blog posts, social media captions, email subject lines, SEO descriptions. [stop] That collection becomes your personal toolkit. And because everything is on the platform, the prompts in your collection keep getting better — because other people are submitting Change Requests and improving them. So your toolkit improves automatically over time. [smile] I really like that idea.",
  // 25. Categories & Tags
  "Let me also talk about how we organize everything. [pause] We have a full category system — hierarchical categories, so you have parent categories like \"Development\" or \"Writing\" or \"Business,\" and then subcategories underneath. Each category has its own page with all the prompts in it. [pause] And then we have tags — colorful tags that you can attach to any prompt. Things like \"GPT-4,\" \"beginner-friendly,\" \"creative,\" \"technical.\" You can filter by tags, search by tags, combine categories and tags together. [stop] The point is — when you have over a thousand prompts, you need good organization. Otherwise it's just chaos. And we've spent a lot of time making sure you can always find what you're looking for, even if you're not sure exactly what it's called. [smile]",
  // 26. i18n
  "And here's something that I'm really proud of — internationalization. [pause] prompts.chat is not just in English. The entire platform — every button, every label, every message — is translated into 17 languages. [stop] And I want to be honest — as a non-native English speaker myself, this matters a lot to me. [smile] Not everyone in the world speaks English. But everyone deserves access to good AI prompts. So we worked hard to make the platform accessible to as many people as possible. [pause] The prompts themselves are mostly in English, because that's what most AI models work best with, but the entire user interface speaks your language. [smile]",
  // 27. Self-Hosted
  "And here's something really important to me — you can self-host the entire thing. [stop] I know a lot of companies, especially in enterprise, they don't want their prompts on a public platform. They have proprietary prompts, internal processes, sensitive data. I totally understand that. [pause] So we made it possible to run your own instance of prompts.chat. One command: npx prompts.chat new my-prompt-library. That's it. Boom. You have your own prompt library. [pause] And you can customize everything — your own branding, your own logo, your own colors, your own authentication providers. Want to use your company's Azure AD? Go ahead. Want to disable public registration? No problem. Want to deploy it on AWS? On Vercel? On your own server? All works. [stop] Your data stays with you. It's 100% open-source. And I think that's really important in the age of AI — data sovereignty.",
  // 28. Clients
  "We also built clients for pretty much every platform. [point to screen] So we have a native iOS app — built with SwiftUI, feels really nice. And by the way, the iOS app works with any custom server. So if you self-host your own prompts.chat instance, the iOS app connects to your server. Not ours. [pause] Then we have browser extensions — Chrome and Firefox — so you can access your prompts from any webpage. We have a Raycast extension for quick access on Mac. A CLI tool — just run npx prompts.chat from your terminal. [pause] A Claude Code plugin, so Claude can use your prompts directly. An MCP server — which I'll talk about next — and a full REST API so you can build literally anything on top of it. [stop] The idea is simple: your prompts should be available wherever you are. Not locked in one website. [smile]",
  // 29. MCP Deep Dive
  "Let me go a bit deeper on the MCP server, because I think it's one of the most powerful features. [pause] MCP stands for Model Context Protocol. It's basically a standard way for AI tools to discover and use external resources. And prompts.chat has a built-in MCP server. [stop] What does that mean in practice? It means any AI tool that supports MCP — Claude, for example — can directly browse your prompts, search through them, and use them. [pause] It even supports variables. So if your prompt has a variable like \"language\" or \"topic,\" the AI can fill that in automatically. And we have a search_prompts tool that lets the AI search for relevant prompts by keyword, by category, by tag, even by prompt type. [stop] So imagine you're using Claude, and you say \"find me a good code review prompt.\" Claude calls our MCP server, finds the best matching prompt, fills in the variables, and uses it. All automatic. [smile] That's the future of AI tool integration.",
  // 30. Kids
  "And now I want to show you something that's really special to me personally. [smile] We built prompts.chat/kids. This is a free, interactive section of the platform that teaches children — ages 8 to 14 — how to communicate with AI. [pause] It's designed as a pixel-art adventure. There's this character called Promi — you can see the little robot on the slide — and Promi guides kids through lessons about what prompts are, how to write good ones, how to be safe with AI. [stop] It's completely free, completely open source, and it's available in 16 languages. Because I believe — very strongly — that kids need to learn this stuff early. AI is going to be a huge part of their lives. The earlier they learn how to communicate with it effectively, and safely, the better prepared they'll be. [pause] And honestly, building this was one of the most rewarding things I've done. [smile]",
  // 31. A Free Platform for All
  "So let me zoom out and talk about the big picture. [pause] Why are we doing all of this? What's the point? [stop] The point is this: as AI grows — and it's growing fast — more and more people need to know how to talk to AI. Not just developers. Not just tech people. Everyone. Teachers, doctors, lawyers, students, artists, small business owners. Everyone. [pause] And I believe there should be a free, open place where anyone can come, learn, share, and discover how to communicate with AI. Not a paid tool. Not a locked platform. A free, community-driven place. [stop] That's what prompts.chat is. And I promise you — it will always be free and open. That's not just a business decision. It's a principle. [smile] Because access to AI knowledge should not depend on your wallet.",
  // 32. Call to Action
  "OK, that's it from me. [smile] Thank you so much for listening to all of this. I hope I gave you a good sense of what prompts.chat is and why we think it matters. [pause] If you're interested, please go to prompts.chat and explore. Star us on GitHub if you like what you see — it really helps with visibility. [pause] And if you want to contribute — write a prompt, submit a Change Request, translate something, build a client — we'd love to have you in the community. The more people contribute, the better it gets for everyone. [stop] Oh, and one more thing — everything on prompts.chat is licensed under CC0 1.0 Universal. That means it's public domain. No attribution required. You can use it however you want, for any purpose, commercial or not. No strings attached. [pause] So yeah. Thank you again. Unfortunately we don't have time for questions, sorry about that — but you can always reach me on LinkedIn. I'm happy to chat there. [smile]",
];

export default function PresentationPage() {
  return (
    <SlideDeck notes={speakerNotes}>
      {/* 1. Title Slide */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <Image src="/logo.svg" alt="prompts.chat logo" width={120} height={120} className="mb-8" />
        <SlideTitle className="mb-6">Why prompts.chat?</SlideTitle>
        <SlideContent className="max-w-3xl mb-12">Discover why prompts are more important than ever in the agentic era.</SlideContent>
        <p className="text-sm text-muted-foreground animate-pulse mt-8">
          Use arrow keys <MoveRight className="inline w-4 h-4 mx-1" /> or swipe to navigate
        </p>
      </div>

      {/* Who am I */}
      <div className="flex flex-col justify-center h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://github.com/f.png" alt="Fatih Kadir Akın" className="w-24 h-24 rounded-full mb-6 border-2 border-border" />
        <SlideTitle>Who am I?</SlideTitle>
        <div className="flex items-center gap-5 mb-6">
          <Link href="https://github.com/f" target="_blank" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-4 h-4" />
            <span>f</span>
          </Link>
          <Link href="https://x.com/fkadev" target="_blank" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            <span>fkadev</span>
          </Link>
          <Link href="https://linkedin.com/in/fatihkadirakin" target="_blank" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Linkedin className="w-4 h-4" />
            <span>fatihkadirakin</span>
          </Link>
        </div>
        <SlideContent>
          <SlideHighlight>Fatih Kadir Akın</SlideHighlight> — JavaScript developer, author, and open-source advocate based in Istanbul.
        </SlideContent>
        <div className="mt-10 flex flex-wrap gap-3">
          {[
            "Creator of prompts.chat",
            "GitHub Star",
            "Author of \"The Interactive Book of Prompting\"",
            "10K+ GitHub followers",
            "Working at Teknasyon",
          ].map((item) => (
            <span key={item} className="px-4 py-2 rounded-full border border-border bg-muted/40 text-sm md:text-base font-medium text-foreground">
              {item}
            </span>
          ))}
        </div>
        <p className="mt-8 text-lg text-muted-foreground">
          <Link href="https://github.com/f" target="_blank" className="text-primary hover:underline underline-offset-4">github.com/f</Link>
          {" · "}
          <Link href="https://x.com/fkadev" target="_blank" className="text-primary hover:underline underline-offset-4">@fkadev</Link>
        </p>
      </div>

      {/* The Genesis */}
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

      {/* 3. Interactive Timeline */}
      <TimelineSlide />

      {/* 4. Stats */}
      <StatsSlide />

      {/* 5. The Paradigm Shift */}
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

      {/* 8. The SLM Revolution */}
      <div className="flex flex-col justify-center h-full">
        <Globe className="w-12 h-12 text-green-500 mb-6" />
        <SlideTitle>Crucial for SLMs</SlideTitle>
        <SlideContent>
          Small Language Models (SLMs) are the future of edge computing. They require precise, well-crafted prompts to perform tasks accurately without the massive parameter count of frontier models.
        </SlideContent>
      </div>

      {/* 9. Model Comparison (Interactive) */}
      <ModelComparisonSlide />

      {/* 10. SLM Constraints */}
      <div className="flex flex-col justify-center h-full">
        <SlideTitle>SLM Constraints</SlideTitle>
        <SlideContent>
          Smaller models lack the vast "common sense" of 1T+ parameter models.
          <br /><br />
          They require <SlideHighlight>highly optimized, battle-tested prompts</SlideHighlight> to punch above their weight class and run efficiently on local devices.
        </SlideContent>
      </div>

      {/* Open Source AI */}
      <div className="flex flex-col justify-center h-full">
        <Users className="w-12 h-12 text-indigo-500 mb-6" />
        <SlideTitle>Community Sharing</SlideTitle>
        <SlideContent>
          Nobody learns in isolation. By sharing prompts, we accelerate the collective understanding of how to communicate with AI. It's the open-source movement for human-AI interaction.
        </SlideContent>
      </div>

      {/* 13. Collective Intelligence */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <SlideTitle className="text-5xl md:text-6xl">Collective Intelligence</SlideTitle>
        <SlideContent className="max-w-4xl mt-8">
          We are building the <SlideHighlight>largest open repository</SlideHighlight> of human-AI interaction patterns.
          <br /><br />
          Tested, versioned, and peer-reviewed.
        </SlideContent>
      </div>

      {/* Feature - Typed Prompts */}
      <div className="flex flex-col justify-center h-full">
        <Code className="w-12 h-12 text-red-500 mb-6" />
        <SlideTitle>Feature: Typed Prompts</SlideTitle>
        <SlideContent>
          Natural language is ambiguous. <SlideHighlight>Typed Prompts</SlideHighlight> bring structure.
          <br /><br />
          Define inputs, outputs, and variables systematically so prompts can be executed predictably via APIs.
        </SlideContent>
      </div>

      {/* Typed Prompts SDK Demo (Interactive) */}
      <TypedPromptsDemoSlide />

      {/* Compiled Output */}
      <div className="flex flex-col justify-center h-full">
        <SlideTitle>When It Compiles</SlideTitle>
        <SlideContent className="mb-8">
          Structured code becomes a <SlideHighlight>ready-to-use prompt</SlideHighlight>:
        </SlideContent>
        <div className="flex flex-col gap-4 max-w-4xl">
          <div className="bg-muted/50 border border-border rounded-xl p-5 font-mono text-xs md:text-sm leading-relaxed">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-sans font-bold">Code</div>
            <div className="text-blue-400">image()</div>
            <div className="text-green-400 pl-4">{`.subject("a lone samurai")`}</div>
            <div className="text-green-400 pl-4">{`.environment("bamboo forest at dawn")`}</div>
            <div className="text-cyan-400 pl-4">{`.shot("wide").lens("35mm").angle("low-angle")`}</div>
            <div className="text-yellow-400 pl-4">{`.lightingType("rim").timeOfDay("golden-hour")`}</div>
            <div className="text-purple-400 pl-4">{`.medium("cinematic")`}</div>
            <div className="text-blue-400 pl-4">{`.build();`}</div>
          </div>
          <div className="flex justify-center text-muted-foreground">
            <MoveRight className="w-6 h-6 rotate-90" />
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="text-xs text-primary uppercase tracking-wider mb-3 font-bold">Compiled Prompt</div>
            <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
              a lone samurai, bamboo forest at dawn, wide shot, low-angle, 35mm lens, rim lighting, golden-hour, cinematic
            </p>
          </div>
        </div>
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

      {/* 18. Feature - Change Requests */}
      <div className="flex flex-col justify-center h-full">
        <GitMerge className="w-12 h-12 text-orange-500 mb-6" />
        <SlideTitle>Feature: Change Requests</SlideTitle>
        <SlideContent>
          Prompts evolve. We've introduced <SlideHighlight>Pull Requests for Prompts.</SlideHighlight>
          <br /><br />
          Collaborate, suggest improvements, and refine instructions together as a community.
        </SlideContent>
      </div>

      {/* 19. Feature Showcase (Interactive) */}
      <FeatureShowcaseSlide />

      {/* 20. For Developers */}
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

      {/* Discover & Feed */}
      <div className="flex flex-col justify-center h-full">
        <Star className="w-12 h-12 text-amber-500 mb-6" />
        <SlideTitle>Discover & Feed</SlideTitle>
        <SlideContent>
          A personalized experience for every user.
        </SlideContent>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div className="p-5 rounded-xl border border-border bg-muted/30">
            <div className="text-lg font-bold text-foreground mb-2">Discover</div>
            <div className="text-sm text-muted-foreground">Featured prompts, trending today, latest additions, most contributed — always fresh.</div>
          </div>
          <div className="p-5 rounded-xl border border-border bg-muted/30">
            <div className="text-lg font-bold text-foreground mb-2">Your Feed</div>
            <div className="text-sm text-muted-foreground">Subscribe to categories and get a personalized stream of new prompts you care about.</div>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="flex flex-col justify-center h-full">
        <MessageSquare className="w-12 h-12 text-violet-500 mb-6" />
        <SlideTitle>Collections</SlideTitle>
        <SlideContent>
          Bookmark prompts you love. Build your personal <SlideHighlight>prompt toolkit</SlideHighlight> over time.
          <br /><br />
          Your saved prompts keep improving as the community submits Change Requests.
        </SlideContent>
      </div>

      {/* Categories & Tags */}
      <div className="flex flex-col justify-center h-full">
        <SlideTitle>Categories & Tags</SlideTitle>
        <SlideContent className="mb-8">
          Hierarchical categories, colorful tags, and powerful filtering to find exactly what you need.
        </SlideContent>
        <div className="flex flex-wrap gap-2 max-w-3xl">
          {[
            { name: "Development", color: "#3b82f6" },
            { name: "Writing", color: "#8b5cf6" },
            { name: "Business", color: "#10b981" },
            { name: "Education", color: "#f59e0b" },
            { name: "Creative", color: "#ec4899" },
            { name: "Data", color: "#06b6d4" },
          ].map((cat) => (
            <span key={cat.name} className="px-4 py-2 rounded-full border text-sm font-medium" style={{ borderColor: cat.color + "40", backgroundColor: cat.color + "10", color: cat.color }}>
              {cat.name}
            </span>
          ))}
        </div>
      </div>

      {/* Internationalization */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <Globe className="w-12 h-12 text-blue-500 mb-6" />
        <SlideTitle>17 Languages</SlideTitle>
        <SlideContent className="max-w-3xl">
          The entire platform is translated into <SlideHighlight>17 languages</SlideHighlight> — and counting.
        </SlideContent>
        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-2xl">
          {["EN", "TR", "ES", "ZH", "JA", "AR", "AZ", "PT", "FR", "DE", "KO", "IT", "EL", "FA", "HE", "NL", "RU"].map((lang) => (
            <span key={lang} className="w-10 h-10 rounded-full border border-border bg-muted/40 flex items-center justify-center text-xs font-bold text-foreground">
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Self-Hosted */}
      <div className="flex flex-col justify-center h-full">
        <Globe className="w-12 h-12 text-teal-500 mb-6" />
        <SlideTitle>Fully Self-Hosted</SlideTitle>
        <SlideContent>
          Your data, your platform. One command to deploy your own prompt library.
        </SlideContent>
        <div className="mt-8 bg-muted/50 border border-border rounded-xl p-5 max-w-2xl font-mono text-sm md:text-base">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-sans font-bold">Get Started</div>
          <div className="text-primary">$ npx prompts.chat new my-prompt-library</div>
        </div>
        <SlideContent className="mt-6 text-base md:text-lg">
          <SlideHighlight>100% open-source</SlideHighlight> — custom branding, themes, auth providers, and deployable to any server or cloud.
        </SlideContent>
      </div>

      {/* Clients */}
      <div className="flex flex-col justify-center h-full">
        <SlideTitle>Available Everywhere</SlideTitle>
        <SlideContent className="mb-8">
          Access your prompts from any device or tool.
        </SlideContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
          {[
            { name: "iOS App", desc: "Native SwiftUI", icon: <Smartphone className="w-5 h-5" /> },
            { name: "Chrome", desc: "Browser extension", icon: <Chrome className="w-5 h-5" /> },
            { name: "Firefox", desc: "Browser extension", icon: <Globe className="w-5 h-5" /> },
            { name: "Raycast", desc: "Quick access", icon: <Zap className="w-5 h-5" /> },
            { name: "CLI", desc: "npx prompts.chat", icon: <Terminal className="w-5 h-5" /> },
            { name: "Claude Code", desc: "Plugin", icon: <Puzzle className="w-5 h-5" /> },
            { name: "MCP Server", desc: "Tool integration", icon: <Waypoints className="w-5 h-5" /> },
            { name: "REST API", desc: "Build anything", icon: <Server className="w-5 h-5" /> },
          ].map((client) => (
            <div key={client.name} className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="text-muted-foreground mb-2">{client.icon}</div>
              <div className="text-base md:text-lg font-bold text-foreground">{client.name}</div>
              <div className="text-sm text-muted-foreground">{client.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MCP Deep Dive */}
      <div className="flex flex-col justify-center h-full">
        <Waypoints className="w-12 h-12 text-blue-500 mb-6" />
        <SlideTitle>MCP Integration</SlideTitle>
        <SlideContent className="mb-8">
          Any AI tool that supports <SlideHighlight>Model Context Protocol</SlideHighlight> can discover, search, and use your prompts — with full variable support.
        </SlideContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="text-base font-bold text-foreground mb-1">Browse</div>
            <div className="text-sm text-muted-foreground">List all prompts as MCP resources</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="text-base font-bold text-foreground mb-1">Search</div>
            <div className="text-sm text-muted-foreground">search_prompts tool with filters by category, tag, type</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="text-base font-bold text-foreground mb-1">Variables</div>
            <div className="text-sm text-muted-foreground">Auto-fill prompt variables at runtime</div>
          </div>
        </div>
      </div>

      {/* Kids */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <Image src="/promi.svg" alt="Promi" width={80} height={100} className="mb-6" style={{ imageRendering: "pixelated" }} />
        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 md:mb-12 leading-normal ${kidsFont.className}`}>
          <span className="text-[#4A90D9]">Prompt</span>{" "}
          <span className="text-[#FFD700]">Education</span>{" "}
          <span className="text-[#22C55E]">for Kids</span>
        </h1>
        <SlideContent className="max-w-3xl">
          <SlideHighlight>prompts.chat/kids</SlideHighlight> interactively teaches children aged 8–14 how to prompt AI through a pixel-art adventure with Promi the robot.
        </SlideContent>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {["#FF6B6B", "#FFD700", "#22C55E", "#4A90D9", "#A855F7", "#F97316"].map((color) => (
            <div key={color} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          ))}
        </div>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
          Free · Open source · Available in <SlideHighlight>16 languages</SlideHighlight>
        </p>
      </div>

      {/* The Vision */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <SlideTitle className="text-5xl md:text-6xl">A Free Platform for All</SlideTitle>
        <SlideContent className="max-w-4xl mt-8">
          As the AI era grows, so does the need for a <SlideHighlight>free and open place</SlideHighlight> where everyone can share, discover, and learn how to communicate with AI.
          <br /><br />
          That place is prompts.chat.
        </SlideContent>
      </div>

      {/* Call to Action */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
          <Users className="w-12 h-12 text-primary" />
        </div>
        <SlideTitle>Join the Community</SlideTitle>
        <SlideContent className="max-w-2xl mb-8">
          Start exploring, sharing, and building the future of AI interaction today.
        </SlideContent>
        <div className="flex flex-col items-center gap-3 text-xl md:text-2xl mb-8">
          <Link href="https://prompts.chat" className="text-primary hover:underline underline-offset-4 font-semibold">prompts.chat</Link>
          <Link href="https://github.com/f/prompts.chat" target="_blank" className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors">github.com/f/prompts.chat</Link>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg">
          Licensed under <SlideHighlight>CC0 1.0 Universal</SlideHighlight> — Public Domain. No attribution required. Use it as you wish.
        </p>
      </div>
    </SlideDeck>
  );
}
