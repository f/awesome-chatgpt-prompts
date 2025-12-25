"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Play, RotateCcw, Code2, FileJson, FileText, Book, ChevronDown, ChevronRight, Video, Music, Image, X, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Import the actual prompts.chat library
import {
  builder,
  fromPrompt,
  templates,
  video,
  audio,
  image,
  chat,
  chatPresets,
  variables,
  similarity,
  quality,
  parser,
} from "@/../packages/prompts.chat";

type OutputFormat = "json" | "yaml" | "markdown";

interface ApiSection {
  name: string;
  items: ApiItem[];
}

interface ApiItem {
  name: string;
  type: "function" | "class" | "type" | "interface" | "const";
  signature?: string;
  description?: string;
  example?: string;
  returns?: string;
  params?: { name: string; type: string; description: string }[];
}

const EXAMPLE_VIDEO = `import { video } from 'prompts.chat';

// Create a cinematic video prompt for Sora/Runway
const prompt = video()
  // Scene - using individual methods for clarity
  .scene("A lone samurai walks through an ancient bamboo forest")
  .setting("Feudal Japan, remote mountain region")
  .timeOfDay("golden-hour")
  .weather("misty")
  
  // Subject - using object form
  .subject({
    main: "A weathered samurai in traditional armor",
    appearance: "battle-scarred face, grey streaks in hair tied in topknot",
    clothing: "worn black and red yoroi armor, tattered cape flowing behind",
    age: "50s",
    count: "single"
  })
  
  // Camera - individual chainable methods
  .shot("medium-wide")
  .angle("low-angle")
  .lens("anamorphic")
  .focalLength("35mm")
  .movement("tracking")
  .cameraSpeed("slow")
  .movementDirection("arc-left")
  .aperture("f/1.4")
  .filmStock("kodak-vision3-500t")
  .filmGrain("subtle")
  
  // Lighting
  .lighting({
    type: ["rim", "natural"],
    time: "golden-hour",
    direction: "back",
    intensity: "dramatic"
  })
  
  // Actions - timed beats in the video
  .action("Samurai pauses, hand resting on katana")
  .action("Wind picks up, cape billows dramatically")
  .action("He turns slowly to face camera")
  
  // Visual style
  .look(["cinematic", "noir"])
  .era("1960s Japanese cinema")
  .reference(["Akira Kurosawa", "Roger Deakins"])
  
  // Color grading
  .palette(["earthy", "muted"])
  .colorAnchors(["deep greens", "warm amber", "shadow blue"])
  .colorGrade("teal and orange with crushed blacks")
  
  // Audio elements
  .ambient("wind rustling through bamboo, distant bird calls")
  .diegetic(["footsteps on fallen leaves", "armor clinking softly"])
  .music("solo shakuhachi flute, melancholic melody")
  
  // Technical specifications
  .duration(8)
  .resolution("4K")
  .fps(24)
  .aspectRatio("21:9")
  
  // Mood and pacing
  .mood(["melancholic", "epic", "mysterious"])
  .pacing("slow")
  
  .build();

prompt;
`;

const EXAMPLE_AUDIO = `import { audio } from 'prompts.chat';

// Create a detailed music prompt for Suno/Udio
const prompt = audio()
  // Genre - string or object form
  .genre("synthwave")
  .subgenre("darksynth")
  .fusion(["electronic", "ambient"])
  
  // Mood - takes primary and spread secondary args
  .mood("nostalgic", "mysterious", "hopeful")
  .energy("building")
  .emotion("bittersweet longing for a retro-futuristic past")
  
  // Tempo - number or object
  .bpm(108)
  .tempoMarking("moderato")
  .tempoFeel("driving")
  
  // Vocals
  .vocalStyle(["male", "breathy"])
  .language("english")
  .lyricsTheme("memories of a neon-lit city that never was")
  .delivery("intimate and reflective, slight reverb")
  
  // Instrumentation - individual methods
  .leadInstrument(["synthesizer", "electric-guitar"])
  .rhythmSection(["drums", "bass"])
  .bassInstrument("bass")
  .percussion(["drums"])
  .pads(["synthesizer", "strings"])
  .featuredInstrument("synthesizer")
  
  // Song structure - section by section
  .section("intro", 8, "Atmospheric synth pad fade-in")
  .section("verse", 16, "Driving beat with vocals")
  .section("pre-chorus", 8, "Building tension")
  .section("chorus", 16, "Full arrangement, soaring melody")
  .section("verse", 16, "Second verse, added elements")
  .section("chorus", 16, "Repeat chorus with variations")
  .section("bridge", 8, "Breakdown, stripped back")
  .section("drop", 16, "Final chorus with extra energy")
  .section("outro", 8, "Fade out with reverb tail")
  
  // Production style
  .productionStyle(["polished", "atmospheric", "layered"])
  .era("1980s")
  .reference(["The Midnight", "Gunship", "FM-84"])
  .texture("lush and cinematic with analog warmth")
  .effects(["heavy reverb on snare", "chorus on guitars", "tape saturation"])
  
  // Technical specs
  .key("Am")
  .timeSignature("4/4")
  .duration(210)
  
  // Style tags - individual or batch
  .tag("retrowave")
  .tag("outrun")
  .tags(["80s nostalgia", "neon", "night drive"])
  
  .build();

prompt;
`;

const EXAMPLE_IMAGE = `import { image } from 'prompts.chat';

// Create a detailed image prompt for Midjourney/DALL-E/Stable Diffusion
const prompt = image()
  // Main subject - string or object form
  .subject("An ancient library hidden inside a giant hollow tree")
  .subjectDetails([
    "thousands of leather-bound books on curved wooden shelves",
    "spiral staircase winding up through the center",
    "glowing fireflies floating between bookshelves",
    "worn reading chairs with velvet cushions"
  ])
  .pose("majestic interior view")
  .expression("magical and inviting atmosphere")
  
  // Environment - string or object form
  .environment("interior of a massive ancient oak tree")
  .location("enchanted forest, hidden realm")
  .atmosphere("mystical, warm and cozy")
  .season("autumn")
  .props([
    "scattered scrolls and quills on oak desks",
    "mystical runes carved into bark walls",
    "mushrooms glowing softly in corners"
  ])
  
  // Camera - individual chainable methods
  .angle("low-angle")
  .shot("wide")
  .lens("wide-angle")
  .focalLength("24mm")
  .focus("deep")
  .cameraBrand("hasselblad")
  .sensor("medium-format")
  .aperture("f/8")
  
  // Lighting - object or individual methods
  .lightingType(["practical", "rim"])
  .timeOfDay("twilight")
  .lightDirection("three-quarter")
  .lightIntensity("soft")
  
  // Composition - object or individual methods
  .goldenRatio()
  .foreground("scattered books and scrolls")
  .midground("spiral staircase with warm glow")
  .background("small windows showing starlit forest")
  
  // Art style
  .medium("digital-art")
  .artist(["Greg Rutkowski", "Thomas Kinkade", "Studio Ghibli"])
  .influence(["Art Nouveau", "cottage core aesthetic"])
  
  // Color palette
  .palette(["warm", "earthy"])
  .primaryColors(["amber", "deep brown", "forest green"])
  .accentColors(["soft gold", "moonlight blue", "fairy pink"])
  .colorGrade("rich saturation with deep shadows")
  
  // Mood
  .mood(["serene", "peaceful", "nostalgic", "whimsical"])
  
  // Technical specifications
  .aspectRatio("3:2")
  .resolution("8K")
  .quality("masterpiece")
  
  // Negative prompt - takes array
  .negative([
    "blurry", "low quality", "bad anatomy", "watermark",
    "text", "signature", "modern elements", "plastic",
    "harsh lighting", "overexposed", "underexposed"
  ])
  
  // Custom additions
  .custom("volumetric lighting, ray tracing, octane render")
  
  .build();

prompt;
`;

const EXAMPLE_CHAT = `import { chat } from 'prompts.chat';

// Create a chat prompt for conversational AI
const prompt = chat()
  // Define the AI's role and expertise
  .role("senior software architect")
  .tone("professional")
  .expertise("TypeScript", "React", "Node.js", "System Design")
  
  // Set the main task
  .task("Review code and provide architectural feedback")
  
  // Configure reasoning style
  .stepByStep()
  
  // Output format
  .json()
  
  // Response length
  .detailed()
  
  .build();

prompt;
`;

const API_DOCS: ApiSection[] = [
  // ============================================================================
  // TEXT PROMPTS
  // ============================================================================
  {
    name: "Text Prompts",
    items: [
      { name: "builder()", type: "function", signature: "builder(): PromptBuilder", description: "Create a new prompt builder" },
      { name: "fromPrompt()", type: "function", signature: "fromPrompt(content: string): PromptBuilder", description: "Create builder from existing prompt" },
      { name: ".role()", type: "function", signature: "role(role: string): this", description: "Set AI persona/role" },
      { name: ".context()", type: "function", signature: "context(ctx: string): this", description: "Set background context" },
      { name: ".task()", type: "function", signature: "task(task: string): this", description: "Set main instruction" },
      { name: ".constraints()", type: "function", signature: "constraints(c: string[]): this", description: "Add rules/constraints" },
      { name: ".output()", type: "function", signature: "output(format: string): this", description: "Set output format" },
      { name: ".example()", type: "function", signature: "example(in: string, out: string): this", description: "Add input/output example" },
      { name: ".variable()", type: "function", signature: "variable(name: string, opts?): this", description: "Define a placeholder variable" },
      { name: ".section()", type: "function", signature: "section(title: string, content: string): this", description: "Add custom section" },
      { name: ".build()", type: "function", signature: "build(): BuiltPrompt", description: "Build the final prompt" },
    ],
  },
  {
    name: "Templates",
    items: [
      { name: "templates.codeReview()", type: "function", signature: "codeReview(opts?): PromptBuilder", description: "Code review template" },
      { name: "templates.translation()", type: "function", signature: "translation(from, to): PromptBuilder", description: "Translation template" },
      { name: "templates.summarize()", type: "function", signature: "summarize(opts?): PromptBuilder", description: "Summarization template" },
      { name: "templates.qa()", type: "function", signature: "qa(context?): PromptBuilder", description: "Q&A template" },
    ],
  },
  // ============================================================================
  // CHAT PROMPTS
  // ============================================================================
  {
    name: "Chat: Messages",
    items: [
      { name: "chat()", type: "function", signature: "chat(): ChatPromptBuilder", description: "Create chat prompt builder" },
      { name: ".system()", type: "function", signature: "system(content: string): this", description: "Set system message" },
      { name: ".user()", type: "function", signature: "user(content, name?): this", description: "Add user message" },
      { name: ".assistant()", type: "function", signature: "assistant(content: string): this", description: "Add assistant message" },
      { name: ".messages()", type: "function", signature: "messages(msgs[]): this", description: "Add multiple messages" },
      { name: ".conversation()", type: "function", signature: "conversation(turns[]): this", description: "Add conversation turns" },
    ],
  },
  {
    name: "Chat: Persona",
    items: [
      { name: ".persona()", type: "function", signature: "persona(settings | string): this", description: "Set full persona" },
      { name: ".role()", type: "function", signature: "role(role: string): this", description: "Set AI role" },
      { name: ".tone()", type: "function", signature: "tone(tone): this", description: "Set tone(s)" },
      { name: ".expertise()", type: "function", signature: "expertise(areas): this", description: "Set expertise areas" },
      { name: ".personality()", type: "function", signature: "personality(traits[]): this", description: "Set personality traits" },
      { name: ".background()", type: "function", signature: "background(bg: string): this", description: "Set background info" },
      { name: ".speakAs()", type: "function", signature: "speakAs(name: string): this", description: "Set persona name" },
    ],
  },
  {
    name: "Chat: Context",
    items: [
      { name: ".context()", type: "function", signature: "context(settings | string): this", description: "Set full context" },
      { name: ".domain()", type: "function", signature: "domain(domain: string): this", description: "Set knowledge domain" },
      { name: ".audience()", type: "function", signature: "audience(audience: string): this", description: "Set target audience" },
      { name: ".constraints()", type: "function", signature: "constraints(c[]): this", description: "Add constraints" },
      { name: ".knowledge()", type: "function", signature: "knowledge(facts[]): this", description: "Set known facts" },
    ],
  },
  {
    name: "Chat: Task",
    items: [
      { name: ".task()", type: "function", signature: "task(instruction | ChatTask): this", description: "Set task" },
      { name: ".steps()", type: "function", signature: "steps(steps[]): this", description: "Set task steps" },
      { name: ".deliverables()", type: "function", signature: "deliverables(d[]): this", description: "Set deliverables" },
      { name: ".criteria()", type: "function", signature: "criteria(criteria[]): this", description: "Set success criteria" },
      { name: ".avoid()", type: "function", signature: "avoid(antiPatterns[]): this", description: "Set anti-patterns" },
    ],
  },
  {
    name: "Chat: Output",
    items: [
      { name: ".json()", type: "function", signature: "json(schema?): this", description: "JSON output" },
      { name: ".jsonSchema()", type: "function", signature: "jsonSchema(name, schema): this", description: "JSON with schema" },
      { name: ".markdown()", type: "function", signature: "markdown(): this", description: "Markdown output" },
      { name: ".code()", type: "function", signature: "code(language?): this", description: "Code output" },
      { name: ".brief()", type: "function", signature: "brief(): this", description: "Brief output" },
      { name: ".detailed()", type: "function", signature: "detailed(): this", description: "Detailed output" },
      { name: ".comprehensive()", type: "function", signature: "comprehensive(): this", description: "Comprehensive output" },
      { name: ".withExamples()", type: "function", signature: "withExamples(): this", description: "Include examples" },
      { name: ".withSources()", type: "function", signature: "withSources(): this", description: "Cite sources" },
    ],
  },
  {
    name: "Chat: Reasoning",
    items: [
      { name: ".stepByStep()", type: "function", signature: "stepByStep(): this", description: "Step-by-step reasoning" },
      { name: ".chainOfThought()", type: "function", signature: "chainOfThought(): this", description: "Chain-of-thought" },
      { name: ".treeOfThought()", type: "function", signature: "treeOfThought(): this", description: "Tree-of-thought" },
      { name: ".firstPrinciples()", type: "function", signature: "firstPrinciples(): this", description: "First principles" },
      { name: ".devilsAdvocate()", type: "function", signature: "devilsAdvocate(): this", description: "Devil's advocate" },
      { name: ".showWork()", type: "function", signature: "showWork(): this", description: "Show reasoning" },
      { name: ".verifyAnswer()", type: "function", signature: "verifyAnswer(): this", description: "Verify answer" },
    ],
  },
  {
    name: "Chat: Presets",
    items: [
      { name: "chatPresets.coder()", type: "function", signature: "coder(lang?): ChatPromptBuilder", description: "Expert coder" },
      { name: "chatPresets.writer()", type: "function", signature: "writer(style?): ChatPromptBuilder", description: "Writer assistant" },
      { name: "chatPresets.tutor()", type: "function", signature: "tutor(subject?): ChatPromptBuilder", description: "Patient tutor" },
      { name: "chatPresets.analyst()", type: "function", signature: "analyst(): ChatPromptBuilder", description: "Data analyst" },
      { name: "chatPresets.socratic()", type: "function", signature: "socratic(): ChatPromptBuilder", description: "Socratic teacher" },
      { name: "chatPresets.summarizer()", type: "function", signature: "summarizer(len?): ChatPromptBuilder", description: "Summarizer" },
      { name: "chatPresets.translator()", type: "function", signature: "translator(lang): ChatPromptBuilder", description: "Translator" },
    ],
  },
  // ============================================================================
  // MEDIA: IMAGE
  // ============================================================================
  {
    name: "Image: Subject",
    items: [
      { name: "image()", type: "function", signature: "image(): ImagePromptBuilder", description: "Create image prompt builder" },
      { name: ".subject()", type: "function", signature: "subject(main | ImageSubject): this", description: "Set main subject" },
      { name: ".subjectDetails()", type: "function", signature: "subjectDetails(details[]): this", description: "Add subject details" },
      { name: ".expression()", type: "function", signature: "expression(expr: string): this", description: "Set facial expression" },
      { name: ".pose()", type: "function", signature: "pose(pose: string): this", description: "Set body pose" },
      { name: ".clothing()", type: "function", signature: "clothing(clothing: string): this", description: "Set clothing" },
    ],
  },
  {
    name: "Image: Environment",
    items: [
      { name: ".environment()", type: "function", signature: "environment(setting | ImageEnv): this", description: "Set environment" },
      { name: ".location()", type: "function", signature: "location(location: string): this", description: "Set location" },
      { name: ".props()", type: "function", signature: "props(props[]): this", description: "Set scene props" },
      { name: ".atmosphere()", type: "function", signature: "atmosphere(atm: string): this", description: "Set atmosphere" },
      { name: ".season()", type: "function", signature: "season(season): this", description: "Set season" },
    ],
  },
  {
    name: "Image: Camera",
    items: [
      { name: ".camera()", type: "function", signature: "camera(settings): this", description: "Set all camera settings" },
      { name: ".shot()", type: "function", signature: "shot(shot: ShotType): this", description: "Set shot type" },
      { name: ".angle()", type: "function", signature: "angle(angle: CameraAngle): this", description: "Set camera angle" },
      { name: ".lens()", type: "function", signature: "lens(lens: LensType): this", description: "Set lens type" },
      { name: ".focus()", type: "function", signature: "focus(focus: FocusType): this", description: "Set focus type" },
      { name: ".aperture()", type: "function", signature: "aperture(aperture: string): this", description: "Set aperture" },
      { name: ".bokeh()", type: "function", signature: "bokeh(style: BokehStyle): this", description: "Set bokeh style" },
      { name: ".filmStock()", type: "function", signature: "filmStock(stock: FilmStock): this", description: "Set film stock" },
    ],
  },
  {
    name: "Image: Lighting",
    items: [
      { name: ".lighting()", type: "function", signature: "lighting(settings): this", description: "Set all lighting" },
      { name: ".lightingType()", type: "function", signature: "lightingType(type): this", description: "Set lighting type(s)" },
      { name: ".timeOfDay()", type: "function", signature: "timeOfDay(time: TimeOfDay): this", description: "Set time of day" },
      { name: ".weather()", type: "function", signature: "weather(weather): this", description: "Set weather" },
      { name: ".lightDirection()", type: "function", signature: "lightDirection(dir): this", description: "Set light direction" },
    ],
  },
  {
    name: "Image: Composition",
    items: [
      { name: ".composition()", type: "function", signature: "composition(settings): this", description: "Set all composition" },
      { name: ".ruleOfThirds()", type: "function", signature: "ruleOfThirds(): this", description: "Enable rule of thirds" },
      { name: ".goldenRatio()", type: "function", signature: "goldenRatio(): this", description: "Enable golden ratio" },
      { name: ".foreground()", type: "function", signature: "foreground(fg: string): this", description: "Set foreground" },
      { name: ".background()", type: "function", signature: "background(bg: string): this", description: "Set background" },
    ],
  },
  {
    name: "Image: Style",
    items: [
      { name: ".style()", type: "function", signature: "style(settings): this", description: "Set all style" },
      { name: ".medium()", type: "function", signature: "medium(medium: ArtStyle): this", description: "Set art medium" },
      { name: ".artist()", type: "function", signature: "artist(artist): this", description: "Reference artist(s)" },
      { name: ".influence()", type: "function", signature: "influence(influences[]): this", description: "Set style influences" },
      { name: ".palette()", type: "function", signature: "palette(palette): this", description: "Set color palette" },
      { name: ".primaryColors()", type: "function", signature: "primaryColors(colors[]): this", description: "Set primary colors" },
      { name: ".colorGrade()", type: "function", signature: "colorGrade(grade: string): this", description: "Set color grade" },
      { name: ".mood()", type: "function", signature: "mood(mood): this", description: "Set mood(s)" },
      { name: ".negative()", type: "function", signature: "negative(items[]): this", description: "Negative prompts" },
      { name: ".build()", type: "function", signature: "build(): BuiltImagePrompt", description: "Build the prompt" },
    ],
  },
  // ============================================================================
  // MEDIA: VIDEO
  // ============================================================================
  {
    name: "Video: Scene",
    items: [
      { name: "video()", type: "function", signature: "video(): VideoPromptBuilder", description: "Create video prompt builder" },
      { name: ".scene()", type: "function", signature: "scene(desc | VideoScene): this", description: "Set scene description" },
      { name: ".setting()", type: "function", signature: "setting(setting: string): this", description: "Set location/setting" },
      { name: ".subject()", type: "function", signature: "subject(main | VideoSubject): this", description: "Set main subject" },
      { name: ".appearance()", type: "function", signature: "appearance(app: string): this", description: "Set appearance" },
      { name: ".clothing()", type: "function", signature: "clothing(clothing: string): this", description: "Set clothing" },
    ],
  },
  {
    name: "Video: Camera",
    items: [
      { name: ".camera()", type: "function", signature: "camera(settings): this", description: "Set all camera settings" },
      { name: ".shot()", type: "function", signature: "shot(shot: ShotType): this", description: "Set shot type" },
      { name: ".angle()", type: "function", signature: "angle(angle: CameraAngle): this", description: "Set camera angle" },
      { name: ".movement()", type: "function", signature: "movement(movement): this", description: "Set camera movement" },
      { name: ".lens()", type: "function", signature: "lens(lens: LensType): this", description: "Set lens type" },
      { name: ".platform()", type: "function", signature: "platform(platform): this", description: "Set camera platform" },
      { name: ".cameraSpeed()", type: "function", signature: "cameraSpeed(speed): this", description: "Set movement speed" },
      { name: ".filmStock()", type: "function", signature: "filmStock(stock): this", description: "Set film stock" },
      { name: ".filmGrain()", type: "function", signature: "filmGrain(grain): this", description: "Set film grain" },
    ],
  },
  {
    name: "Video: Action",
    items: [
      { name: ".action()", type: "function", signature: "action(action, opts?): this", description: "Add single action" },
      { name: ".actions()", type: "function", signature: "actions(actions[]): this", description: "Add multiple actions" },
      { name: ".motion()", type: "function", signature: "motion(settings): this", description: "Set motion settings" },
      { name: ".motionBeats()", type: "function", signature: "motionBeats(beats[]): this", description: "Set motion beats" },
    ],
  },
  {
    name: "Video: Style",
    items: [
      { name: ".style()", type: "function", signature: "style(settings): this", description: "Set all style" },
      { name: ".look()", type: "function", signature: "look(look: ArtStyle): this", description: "Set visual look" },
      { name: ".era()", type: "function", signature: "era(era: string): this", description: "Set era/period" },
      { name: ".reference()", type: "function", signature: "reference(refs[]): this", description: "Set reference films" },
      { name: ".palette()", type: "function", signature: "palette(palette): this", description: "Set color palette" },
      { name: ".colorGrade()", type: "function", signature: "colorGrade(grade: string): this", description: "Set color grade" },
      { name: ".lighting()", type: "function", signature: "lighting(settings): this", description: "Set lighting" },
      { name: ".timeOfDay()", type: "function", signature: "timeOfDay(time): this", description: "Set time of day" },
    ],
  },
  {
    name: "Video: Audio",
    items: [
      { name: ".audio()", type: "function", signature: "audio(settings): this", description: "Set all audio" },
      { name: ".dialogue()", type: "function", signature: "dialogue(dialogue: string): this", description: "Set dialogue" },
      { name: ".ambient()", type: "function", signature: "ambient(ambient: string): this", description: "Set ambient sound" },
      { name: ".diegetic()", type: "function", signature: "diegetic(sounds[]): this", description: "Set diegetic sounds" },
      { name: ".music()", type: "function", signature: "music(music: string): this", description: "Set music" },
    ],
  },
  {
    name: "Video: Technical",
    items: [
      { name: ".duration()", type: "function", signature: "duration(seconds: number): this", description: "Set duration" },
      { name: ".resolution()", type: "function", signature: "resolution(res): this", description: "Set resolution" },
      { name: ".fps()", type: "function", signature: "fps(fps): this", description: "Set frame rate" },
      { name: ".aspectRatio()", type: "function", signature: "aspectRatio(ratio): this", description: "Set aspect ratio" },
      { name: ".mood()", type: "function", signature: "mood(mood): this", description: "Set mood(s)" },
      { name: ".pacing()", type: "function", signature: "pacing(pacing): this", description: "Set pacing" },
      { name: ".build()", type: "function", signature: "build(): BuiltVideoPrompt", description: "Build the prompt" },
    ],
  },
  // ============================================================================
  // MEDIA: AUDIO
  // ============================================================================
  {
    name: "Audio: Genre",
    items: [
      { name: "audio()", type: "function", signature: "audio(): AudioPromptBuilder", description: "Create audio prompt builder" },
      { name: ".genre()", type: "function", signature: "genre(primary: MusicGenre): this", description: "Set primary genre" },
      { name: ".subgenre()", type: "function", signature: "subgenre(sub: string): this", description: "Set subgenre" },
      { name: ".fusion()", type: "function", signature: "fusion(genres[]): this", description: "Blend multiple genres" },
    ],
  },
  {
    name: "Audio: Mood",
    items: [
      { name: ".mood()", type: "function", signature: "mood(primary, ...more): this", description: "Set moods (variadic)" },
      { name: ".energy()", type: "function", signature: "energy(level): this", description: "Set energy level" },
      { name: ".emotion()", type: "function", signature: "emotion(emotion: string): this", description: "Set emotion" },
    ],
  },
  {
    name: "Audio: Tempo",
    items: [
      { name: ".tempo()", type: "function", signature: "tempo(bpm | AudioTempo): this", description: "Set tempo" },
      { name: ".bpm()", type: "function", signature: "bpm(bpm: number): this", description: "Set BPM" },
      { name: ".tempoMarking()", type: "function", signature: "tempoMarking(marking): this", description: "Classical tempo" },
      { name: ".tempoFeel()", type: "function", signature: "tempoFeel(feel): this", description: "Set rhythmic feel" },
    ],
  },
  {
    name: "Audio: Vocals",
    items: [
      { name: ".vocals()", type: "function", signature: "vocals(settings): this", description: "Set all vocal settings" },
      { name: ".vocalStyle()", type: "function", signature: "vocalStyle(style): this", description: "Set vocal style(s)" },
      { name: ".language()", type: "function", signature: "language(lang): this", description: "Set language" },
      { name: ".lyricsTheme()", type: "function", signature: "lyricsTheme(theme: string): this", description: "Set lyrics theme" },
      { name: ".delivery()", type: "function", signature: "delivery(delivery: string): this", description: "Set vocal delivery" },
      { name: ".instrumental()", type: "function", signature: "instrumental(): this", description: "Make instrumental" },
    ],
  },
  {
    name: "Audio: Instruments",
    items: [
      { name: ".instruments()", type: "function", signature: "instruments(instruments[]): this", description: "Set instruments" },
      { name: ".leadInstrument()", type: "function", signature: "leadInstrument(inst): this", description: "Set lead instrument" },
      { name: ".rhythmSection()", type: "function", signature: "rhythmSection(instruments[]): this", description: "Set rhythm section" },
      { name: ".bassInstrument()", type: "function", signature: "bassInstrument(inst): this", description: "Set bass" },
      { name: ".percussion()", type: "function", signature: "percussion(instruments): this", description: "Set percussion" },
      { name: ".pads()", type: "function", signature: "pads(instruments): this", description: "Set pad sounds" },
    ],
  },
  {
    name: "Audio: Structure",
    items: [
      { name: ".structure()", type: "function", signature: "structure(settings): this", description: "Set structure" },
      { name: ".section()", type: "function", signature: "section(type, bars?, desc?): this", description: "Add song section" },
      { name: ".duration()", type: "function", signature: "duration(seconds): this", description: "Set duration" },
    ],
  },
  {
    name: "Audio: Production",
    items: [
      { name: ".production()", type: "function", signature: "production(settings): this", description: "Production settings" },
      { name: ".productionStyle()", type: "function", signature: "productionStyle(style): this", description: "Set production style" },
      { name: ".era()", type: "function", signature: "era(era: Era): this", description: "Set era/decade" },
      { name: ".reference()", type: "function", signature: "reference(artists[]): this", description: "Reference artists" },
      { name: ".texture()", type: "function", signature: "texture(texture: string): this", description: "Set sound texture" },
      { name: ".effects()", type: "function", signature: "effects(effects[]): this", description: "Add audio effects" },
      { name: ".key()", type: "function", signature: "key(key: MusicalKey): this", description: "Set musical key" },
      { name: ".tags()", type: "function", signature: "tags(tags[]): this", description: "Add style tags" },
      { name: ".build()", type: "function", signature: "build(): BuiltAudioPrompt", description: "Build the prompt" },
    ],
  },
  // ============================================================================
  // TYPES
  // ============================================================================
  {
    name: "Chat Types",
    items: [
      { name: "MessageRole", type: "type", description: "'system' | 'user' | 'assistant'" },
      { name: "PersonaTone", type: "type", description: "'professional' | 'casual' | 'technical' | 'friendly' | ..." },
      { name: "PersonaExpertise", type: "type", description: "'coding' | 'writing' | 'analysis' | 'teaching' | ..." },
      { name: "ReasoningStyle", type: "type", description: "'step-by-step' | 'chain-of-thought' | 'tree-of-thought' | ..." },
      { name: "OutputLength", type: "type", description: "'brief' | 'moderate' | 'detailed' | 'comprehensive'" },
      { name: "OutputStyle", type: "type", description: "'prose' | 'bullet-points' | 'numbered-list' | 'table' | ..." },
    ],
  },
  {
    name: "Camera Types",
    items: [
      { name: "ShotType", type: "type", description: "'close-up' | 'medium' | 'wide' | 'extreme-wide' | 'portrait' | ..." },
      { name: "CameraAngle", type: "type", description: "'eye-level' | 'low-angle' | 'high-angle' | 'dutch-angle' | ..." },
      { name: "CameraMovement", type: "type", description: "'static' | 'pan' | 'tilt' | 'dolly' | 'tracking' | 'crane' | ..." },
      { name: "LensType", type: "type", description: "'wide-angle' | '35mm' | '50mm' | '85mm' | 'telephoto' | ..." },
      { name: "FocusType", type: "type", description: "'shallow' | 'deep' | 'soft-focus' | 'bokeh-heavy' | ..." },
      { name: "BokehStyle", type: "type", description: "'smooth' | 'creamy' | 'swirly' | 'soap-bubble' | ..." },
    ],
  },
  {
    name: "Style Types",
    items: [
      { name: "LightingType", type: "type", description: "'natural' | 'studio' | 'dramatic' | 'rim' | 'rembrandt' | ..." },
      { name: "TimeOfDay", type: "type", description: "'dawn' | 'golden-hour' | 'midday' | 'blue-hour' | 'night' | ..." },
      { name: "ArtStyle", type: "type", description: "'photorealistic' | 'cinematic' | 'anime' | 'oil-painting' | ..." },
      { name: "ColorPalette", type: "type", description: "'warm' | 'cool' | 'vibrant' | 'muted' | 'monochrome' | ..." },
      { name: "Mood", type: "type", description: "'serene' | 'dramatic' | 'mysterious' | 'romantic' | 'epic' | ..." },
      { name: "FilmStock", type: "type", description: "'kodak-portra-400' | 'fujifilm-velvia-50' | 'cinestill-800t' | ..." },
    ],
  },
  {
    name: "Audio Types",
    items: [
      { name: "MusicGenre", type: "type", description: "'pop' | 'rock' | 'jazz' | 'electronic' | 'synthwave' | ..." },
      { name: "Instrument", type: "type", description: "'piano' | 'guitar' | 'drums' | 'synthesizer' | '808' | ..." },
      { name: "VocalStyle", type: "type", description: "'male' | 'female' | 'choir' | 'rap' | 'falsetto' | ..." },
      { name: "TempoMarking", type: "type", description: "'largo' | 'adagio' | 'andante' | 'allegro' | 'presto'" },
      { name: "SongSection", type: "type", description: "'intro' | 'verse' | 'chorus' | 'bridge' | 'drop' | 'outro'" },
      { name: "ProductionStyle", type: "type", description: "'lo-fi' | 'vintage' | 'modern' | 'polished' | 'raw' | ..." },
      { name: "MusicalKey", type: "type", description: "'C' | 'Am' | 'G' | 'Em' | 'D' | 'Bm' | ..." },
    ],
  },
  // ============================================================================
  // UTILITIES
  // ============================================================================
  {
    name: "Parser",
    items: [
      { name: "parsePrompt", type: "function", signature: "parse(content, format?): ParsedPrompt", description: "Parse prompt from string (YAML/JSON/MD)" },
      { name: "toYaml", type: "function", signature: "toYaml(prompt): string", description: "Serialize to YAML format" },
      { name: "toJson", type: "function", signature: "toJson(prompt, pretty?): string", description: "Serialize to JSON format" },
      { name: "getSystemPrompt", type: "function", signature: "getSystemPrompt(prompt): string", description: "Extract system message content" },
      { name: "interpolate", type: "function", signature: "interpolate(prompt, values): ParsedPrompt", description: "Fill in {{var}} placeholders" },
    ],
  },
  {
    name: "Variables",
    items: [
      { name: "detectVariables", type: "function", signature: "detectVariables(text): DetectedVariable[]", description: "Find all variable patterns in text" },
      { name: "normalizeVariables", type: "function", signature: "normalize(content): string", description: "Convert all to ${var} format" },
      { name: "extractVariables", type: "function", signature: "extractVariables(text): {name,default?}[]", description: "Extract ${var} variables" },
      { name: "compile", type: "function", signature: "compile(template, values, opts?): string", description: "Fill template with values" },
      { name: "convertToSupportedFormat", type: "function", signature: "convertToSupportedFormat(v): string", description: "Convert single variable" },
      { name: "convertAllVariables", type: "function", signature: "convertAllVariables(text): string", description: "Convert all variables in text" },
    ],
  },
  {
    name: "Quality",
    items: [
      { name: "checkQuality", type: "function", signature: "check(prompt): QualityResult", description: "Check prompt quality (score 0-1)" },
      { name: "validatePrompt", type: "function", signature: "validate(prompt): void", description: "Throw if prompt is invalid" },
      { name: "isValidPrompt", type: "function", signature: "isValid(prompt): boolean", description: "Check if prompt is valid" },
      { name: "getSuggestions", type: "function", signature: "getSuggestions(prompt): string[]", description: "Get improvement suggestions" },
    ],
  },
  {
    name: "Similarity",
    items: [
      { name: "calculateSimilarity", type: "function", signature: "calculate(a, b): number", description: "Get similarity score 0-1" },
      { name: "isSimilarContent", type: "function", signature: "isSimilar(a, b, threshold?): boolean", description: "Check if similar (default 0.85)" },
      { name: "normalizeContent", type: "function", signature: "normalizeContent(text): string", description: "Normalize text for comparison" },
      { name: "getContentFingerprint", type: "function", signature: "getContentFingerprint(text): string", description: "Get content hash for indexing" },
      { name: "findDuplicates", type: "function", signature: "findDuplicates(items, threshold?): T[][]", description: "Find groups of duplicates" },
      { name: "deduplicate", type: "function", signature: "deduplicate(items, threshold?): T[]", description: "Remove duplicates, keep first" },
    ],
  },
];

const DEFAULT_CODE = `import { builder, templates } from 'prompts.chat';

// Create a prompt using the fluent builder API
const prompt = builder()
  .role("Senior TypeScript Developer")
  .context("You are helping review code for a startup")
  .task("Analyze the following code for bugs and improvements")
  .constraints([
    "Be concise and actionable",
    "Focus on critical issues first",
    "Suggest modern TypeScript best practices"
  ])
  .output("JSON with { bugs: [], suggestions: [], rating: number }")
  .variable("code", { required: true, description: "The code to review" })
  .build();

// Or use pre-built templates
const translatePrompt = templates.translation("English", "Spanish").build();

// Export the main prompt
prompt;
`;

const TYPE_DEFINITIONS = `
declare module 'prompts.chat' {
  // ============================================================================
  // BUILDER TYPES
  // ============================================================================
  
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
    role(role: string): this;
    persona(persona: string): this;
    context(context: string): this;
    background(background: string): this;
    task(task: string): this;
    instruction(instruction: string): this;
    constraints(constraints: string[]): this;
    constraint(constraint: string): this;
    rules(rules: string[]): this;
    output(format: string): this;
    format(format: string): this;
    example(input: string, output: string): this;
    examples(examples: Array<{ input: string; output: string }>): this;
    variable(name: string, options?: { description?: string; required?: boolean; defaultValue?: string }): this;
    section(title: string, content: string): this;
    raw(content: string): this;
    build(): BuiltPrompt;
    toString(): string;
  }

  export function builder(): PromptBuilder;
  export function fromPrompt(content: string): PromptBuilder;

  export const templates: {
    codeReview(options?: { language?: string; focus?: string[] }): PromptBuilder;
    translation(from: string, to: string): PromptBuilder;
    summarize(options?: { maxLength?: number; style?: 'bullet' | 'paragraph' }): PromptBuilder;
    qa(context?: string): PromptBuilder;
  };

  // ============================================================================
  // CHAT BUILDER TYPES
  // ============================================================================
  
  export type PersonaTone = 'professional' | 'casual' | 'formal' | 'friendly' | 'academic' | 'technical' | 'creative' | 'empathetic' | 'authoritative' | 'playful' | 'concise' | 'detailed' | 'socratic' | 'coaching' | 'analytical' | 'encouraging' | 'neutral' | 'humorous' | 'serious';
  export type PersonaExpertise = 'general' | 'coding' | 'writing' | 'analysis' | 'research' | 'teaching' | 'counseling' | 'creative' | 'legal' | 'medical' | 'financial' | 'scientific' | 'engineering' | 'design' | 'marketing' | 'business' | 'philosophy' | 'history' | 'languages' | 'mathematics';
  export type ReasoningStyle = 'step-by-step' | 'chain-of-thought' | 'tree-of-thought' | 'direct' | 'analytical' | 'comparative' | 'deductive' | 'inductive' | 'first-principles' | 'analogical' | 'devil-advocate';
  export type OutputLength = 'brief' | 'moderate' | 'detailed' | 'comprehensive' | 'exhaustive';
  export type OutputStyle = 'prose' | 'bullet-points' | 'numbered-list' | 'table' | 'code' | 'mixed' | 'qa' | 'dialogue';
  export type MessageRole = 'system' | 'user' | 'assistant';

  export interface ChatMessage { role: MessageRole; content: string; name?: string; }
  export interface BuiltChatPrompt { messages: ChatMessage[]; systemPrompt: string; userPrompt?: string; metadata: Record<string, unknown>; }

  export class ChatPromptBuilder {
    // Message methods
    system(content: string): this;
    user(content: string, name?: string): this;
    assistant(content: string): this;
    message(role: MessageRole, content: string, name?: string): this;
    messages(messages: ChatMessage[]): this;
    conversation(turns: Array<{ user: string; assistant?: string }>): this;
    // Persona methods
    persona(settings: string | { role?: string; tone?: PersonaTone | PersonaTone[]; expertise?: PersonaExpertise | PersonaExpertise[]; }): this;
    role(role: string): this;
    tone(tone: PersonaTone | PersonaTone[]): this;
    expertise(expertise: PersonaExpertise | PersonaExpertise[]): this;
    personality(traits: string[]): this;
    background(background: string): this;
    speakAs(name: string): this;
    responseLanguage(language: string): this;
    // Context methods
    context(settings: string | { background?: string; domain?: string; audience?: string; }): this;
    domain(domain: string): this;
    audience(audience: string): this;
    purpose(purpose: string): this;
    constraints(constraints: string[]): this;
    constraint(constraint: string): this;
    assumptions(assumptions: string[]): this;
    knowledge(facts: string[]): this;
    // Task methods
    task(instruction: string): this;
    instruction(instruction: string): this;
    steps(steps: string[]): this;
    deliverables(deliverables: string[]): this;
    criteria(criteria: string[]): this;
    avoid(antiPatterns: string[]): this;
    priority(priority: 'accuracy' | 'speed' | 'creativity' | 'thoroughness'): this;
    // Example methods
    example(input: string, output: string, explanation?: string): this;
    examples(examples: Array<{ input: string; output: string; explanation?: string }>): this;
    fewShot(examples: Array<{ input: string; output: string }>): this;
    // Output methods
    outputFormat(format: 'text' | 'json' | 'markdown' | 'code' | 'table'): this;
    json(schema?: { name: string; schema: Record<string, unknown> }): this;
    jsonSchema(name: string, schema: Record<string, unknown>, description?: string): this;
    markdown(): this;
    code(language?: string): this;
    table(): this;
    length(length: OutputLength): this;
    style(style: OutputStyle): this;
    brief(): this;
    moderate(): this;
    detailed(): this;
    comprehensive(): this;
    exhaustive(): this;
    withExamples(): this;
    withExplanation(): this;
    withSources(): this;
    withConfidence(): this;
    // Reasoning methods
    reasoningStyle(style: ReasoningStyle): this;
    stepByStep(): this;
    chainOfThought(): this;
    treeOfThought(): this;
    firstPrinciples(): this;
    devilsAdvocate(): this;
    showWork(): this;
    verifyAnswer(): this;
    considerAlternatives(): this;
    // Build
    build(): BuiltChatPrompt;
  }

  export function chat(): ChatPromptBuilder;
  export const chatPresets: Record<string, () => ChatPromptBuilder>;

  // ============================================================================
  // VIDEO BUILDER TYPES
  // ============================================================================
  
  export type ShotType = 'extreme-close-up' | 'close-up' | 'medium-close-up' | 'medium' | 'medium-wide' | 'wide' | 'extreme-wide' | 'establishing' | 'full-body' | 'portrait' | 'headshot';
  export type CameraAngle = 'eye-level' | 'low-angle' | 'high-angle' | 'dutch-angle' | 'birds-eye' | 'worms-eye' | 'over-the-shoulder' | 'point-of-view' | 'aerial' | 'drone' | 'ground-level';
  export type CameraMovement = 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'pedestal' | 'zoom' | 'handheld' | 'steadicam' | 'crane' | 'drone' | 'tracking' | 'arc' | 'whip-pan' | 'roll' | 'boom' | 'jib' | 'snorricam' | 'vertigo-effect' | 'crash-zoom' | 'slow-push' | 'slow-pull';
  export type LensType = 'wide-angle' | 'ultra-wide' | 'standard' | 'telephoto' | 'macro' | 'fisheye' | '14mm' | '24mm' | '35mm' | '50mm' | '85mm' | '100mm' | '135mm' | '200mm' | 'tilt-shift' | 'anamorphic' | 'spherical' | 'prime' | 'zoom';
  export type LightingType = 'natural' | 'studio' | 'dramatic' | 'soft' | 'hard' | 'diffused' | 'key' | 'fill' | 'rim' | 'backlit' | 'silhouette' | 'rembrandt' | 'split' | 'butterfly' | 'loop' | 'broad' | 'short' | 'chiaroscuro' | 'high-key' | 'low-key' | 'three-point' | 'practical' | 'motivated';
  export type TimeOfDay = 'dawn' | 'sunrise' | 'golden-hour' | 'morning' | 'midday' | 'afternoon' | 'blue-hour' | 'sunset' | 'dusk' | 'twilight' | 'night' | 'midnight';
  export type ArtStyle = 'photorealistic' | 'hyperrealistic' | 'cinematic' | 'documentary' | 'editorial' | 'fashion' | 'portrait' | 'landscape' | 'street' | 'fine-art' | 'conceptual' | 'surreal' | 'abstract' | 'minimalist' | 'vintage' | 'retro' | 'noir' | 'gothic' | 'romantic' | 'cyberpunk' | 'steampunk' | 'fantasy' | 'sci-fi' | 'anime' | 'manga' | 'comic-book' | 'illustration' | 'digital-art' | 'oil-painting' | 'watercolor' | 'sketch' | '3d-render';
  export type ColorPalette = 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted' | 'pastel' | 'neon' | 'monochrome' | 'sepia' | 'desaturated' | 'high-contrast' | 'low-contrast' | 'earthy' | 'oceanic' | 'forest' | 'sunset' | 'midnight' | 'golden';
  export type Mood = 'serene' | 'peaceful' | 'melancholic' | 'dramatic' | 'tense' | 'mysterious' | 'romantic' | 'nostalgic' | 'hopeful' | 'joyful' | 'energetic' | 'chaotic' | 'ethereal' | 'dark' | 'light' | 'whimsical' | 'eerie' | 'epic' | 'intimate';
  export type FilmStock = 'kodak-portra-400' | 'kodak-portra-800' | 'kodak-ektar-100' | 'kodak-tri-x-400' | 'kodak-vision3-500t' | 'fujifilm-pro-400h' | 'fujifilm-velvia-50' | 'ilford-hp5-plus' | 'cinestill-800t' | 'cinestill-50d';
  export type FocusType = 'shallow' | 'deep' | 'soft-focus' | 'tilt-shift' | 'rack-focus' | 'split-diopter' | 'selective' | 'bokeh-heavy' | 'tack-sharp';
  export type BokehStyle = 'smooth' | 'creamy' | 'swirly' | 'busy' | 'soap-bubble' | 'cat-eye' | 'oval-anamorphic';
  export type FilterType = 'uv' | 'polarizer' | 'nd' | 'nd-graduated' | 'black-pro-mist' | 'white-pro-mist' | 'glimmer-glass' | 'classic-soft' | 'diffusion' | 'infrared' | 'warming' | 'cooling' | 'vintage-look';
  export type VideoPacing = 'slow' | 'medium' | 'fast' | 'variable' | 'building' | 'frenetic' | 'contemplative';
  export type VideoTransition = 'cut' | 'fade' | 'dissolve' | 'wipe' | 'morph' | 'match-cut' | 'jump-cut' | 'cross-dissolve' | 'iris' | 'push' | 'slide';
  
  export interface BuiltVideoPrompt { prompt: string; structure: Record<string, unknown>; }

  export class VideoPromptBuilder {
    // Scene methods
    scene(description: string | { description: string; setting?: string; timeOfDay?: TimeOfDay; weather?: string; atmosphere?: string }): this;
    setting(setting: string): this;
    // Subject methods
    subject(main: string | { main: string; appearance?: string; clothing?: string; age?: string; count?: string }): this;
    appearance(appearance: string): this;
    clothing(clothing: string): this;
    // Camera methods
    camera(settings: { shot?: ShotType; angle?: CameraAngle; movement?: CameraMovement; lens?: LensType }): this;
    shot(shot: ShotType): this;
    angle(angle: CameraAngle): this;
    movement(movement: CameraMovement): this;
    lens(lens: LensType): this;
    platform(platform: 'handheld' | 'steadicam' | 'tripod' | 'drone' | 'crane' | 'gimbal' | 'slider' | 'dolly' | 'technocrane' | 'russian-arm' | 'fpv-drone'): this;
    cameraSpeed(speed: 'slow' | 'medium' | 'fast'): this;
    movementDirection(direction: 'left' | 'right' | 'forward' | 'backward' | 'up' | 'down' | 'arc-left' | 'arc-right'): this;
    rig(rig: string): this;
    gimbal(gimbal: string): this;
    cameraBrand(brand: string): this;
    cameraModel(model: string): this;
    sensor(sensor: string): this;
    lensModel(model: string): this;
    lensBrand(brand: string): this;
    focalLength(length: string): this;
    anamorphic(ratio?: '1.33x' | '1.5x' | '1.8x' | '2x'): this;
    aperture(aperture: string): this;
    frameRate(fps: 24 | 25 | 30 | 48 | 60 | 120 | 240): this;
    slowMotion(enabled?: boolean): this;
    shutterAngle(angle: number): this;
    filter(filter: FilterType | FilterType[]): this;
    filmStock(stock: FilmStock): this;
    filmGrain(grain: 'none' | 'subtle' | 'moderate' | 'heavy'): this;
    halation(enabled?: boolean): this;
    // Lighting methods
    lighting(settings: { type?: LightingType | LightingType[]; time?: TimeOfDay; direction?: string; intensity?: string }): this;
    lightingType(type: LightingType | LightingType[]): this;
    timeOfDay(time: TimeOfDay): this;
    weather(weather: 'sunny' | 'cloudy' | 'overcast' | 'foggy' | 'misty' | 'rainy' | 'stormy' | 'snowy' | 'hazy'): this;
    // Action methods
    action(action: string, options?: { duration?: number; timing?: 'start' | 'middle' | 'end' }): this;
    actions(actions: string[]): this;
    motion(settings: { subject?: string; type?: string; direction?: string; speed?: string; beats?: string[] }): this;
    motionBeats(beats: string[]): this;
    // Style methods
    style(settings: { format?: string; era?: string; look?: ArtStyle | ArtStyle[]; reference?: string[] }): this;
    format(format: string): this;
    era(era: string): this;
    styleFilmStock(stock: string): this;
    look(look: ArtStyle | ArtStyle[]): this;
    reference(references: string[]): this;
    // Color methods
    color(settings: { palette?: ColorPalette | ColorPalette[]; anchors?: string[]; grade?: string }): this;
    palette(palette: ColorPalette | ColorPalette[]): this;
    colorAnchors(anchors: string[]): this;
    colorGrade(grade: string): this;
    // Audio methods
    audio(settings: { ambient?: string; diegetic?: string[]; music?: string; dialogue?: string; soundEffects?: string[] }): this;
    dialogue(dialogue: string): this;
    ambient(ambient: string): this;
    diegetic(sounds: string[]): this;
    soundEffects(effects: string[]): this;
    music(music: string): this;
    // Technical methods
    technical(settings: { duration?: number; resolution?: string; fps?: number; aspectRatio?: string }): this;
    duration(seconds: number): this;
    resolution(res: '480p' | '720p' | '1080p' | '4K'): this;
    fps(fps: 24 | 30 | 60): this;
    aspectRatio(ratio: '16:9' | '21:9' | '4:3' | '1:1' | '9:16'): this;
    // Mood and pacing
    mood(mood: Mood | Mood[]): this;
    pacing(pacing: VideoPacing): this;
    transition(transition: VideoTransition): this;
    transitions(transitions: VideoTransition[]): this;
    custom(text: string): this;
    build(): BuiltVideoPrompt;
  }

  export function video(): VideoPromptBuilder;

  // ============================================================================
  // AUDIO BUILDER TYPES
  // ============================================================================
  
  export type MusicGenre = 'pop' | 'rock' | 'jazz' | 'classical' | 'electronic' | 'hip-hop' | 'r&b' | 'country' | 'folk' | 'blues' | 'metal' | 'punk' | 'indie' | 'alternative' | 'ambient' | 'lo-fi' | 'synthwave' | 'orchestral' | 'cinematic' | 'world' | 'latin' | 'reggae' | 'soul' | 'funk' | 'disco' | 'house' | 'techno' | 'edm' | 'trap' | 'drill' | 'k-pop' | 'j-pop' | 'bossa-nova' | 'gospel' | 'grunge' | 'shoegaze' | 'post-rock' | 'prog-rock' | 'psychedelic' | 'chillwave' | 'vaporwave' | 'drum-and-bass' | 'dubstep' | 'trance' | 'hardcore';
  export type Instrument = 'piano' | 'guitar' | 'acoustic-guitar' | 'electric-guitar' | 'bass' | 'drums' | 'violin' | 'cello' | 'viola' | 'flute' | 'saxophone' | 'trumpet' | 'trombone' | 'synthesizer' | 'organ' | 'harp' | 'percussion' | 'strings' | 'brass' | 'woodwinds' | 'choir' | 'vocals' | 'beatbox' | 'turntables' | 'harmonica' | 'banjo' | 'ukulele' | 'mandolin' | 'accordion' | 'marimba' | 'vibraphone' | 'xylophone' | 'timpani' | 'congas' | 'bongos' | 'djembe' | 'tabla' | 'sitar' | '808' | '909' | 'moog' | 'rhodes' | 'wurlitzer' | 'mellotron' | 'theremin';
  export type VocalStyle = 'male' | 'female' | 'duet' | 'choir' | 'a-cappella' | 'spoken-word' | 'rap' | 'falsetto' | 'belting' | 'whisper' | 'growl' | 'melodic' | 'harmonized' | 'auto-tuned' | 'operatic' | 'soul' | 'breathy' | 'nasal' | 'raspy' | 'clear';
  export type VocalLanguage = 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'portuguese' | 'japanese' | 'korean' | 'chinese' | 'arabic' | 'hindi' | 'russian' | 'turkish' | 'instrumental';
  export type TempoMarking = 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'vivace' | 'presto';
  export type TimeSignature = '4/4' | '3/4' | '6/8' | '2/4' | '5/4' | '7/8' | '12/8';
  export type MusicalKey = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B' | 'Cm' | 'C#m' | 'Dm' | 'D#m' | 'Ebm' | 'Em' | 'Fm' | 'F#m' | 'Gm' | 'G#m' | 'Am' | 'A#m' | 'Bbm' | 'Bm';
  export type SongSection = 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'breakdown' | 'drop' | 'build-up' | 'outro' | 'solo' | 'interlude' | 'hook';
  export type ProductionStyle = 'lo-fi' | 'hi-fi' | 'vintage' | 'modern' | 'polished' | 'raw' | 'organic' | 'synthetic' | 'acoustic' | 'electric' | 'hybrid' | 'minimalist' | 'maximalist' | 'layered' | 'sparse' | 'dense' | 'atmospheric' | 'punchy' | 'warm' | 'bright';
  export type Era = '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s' | 'retro' | 'vintage' | 'classic' | 'modern' | 'futuristic';
  
  export interface BuiltAudioPrompt { prompt: string; structure: Record<string, unknown>; }

  export class AudioPromptBuilder {
    // Genre methods
    genre(primary: MusicGenre | { primary: MusicGenre; secondary?: MusicGenre[]; subgenre?: string }): this;
    subgenre(subgenre: string): this;
    fusion(genres: MusicGenre[]): this;
    // Mood methods
    mood(primary: string, ...secondary: string[]): this;
    energy(level: 'low' | 'medium' | 'high' | 'building' | 'dynamic'): this;
    emotion(emotion: string): this;
    // Tempo methods
    tempo(bpmOrSettings: number | { bpm?: number; marking?: string; feel?: string }): this;
    bpm(bpm: number): this;
    tempoMarking(marking: 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'vivace' | 'presto'): this;
    tempoFeel(feel: 'steady' | 'driving' | 'relaxed' | 'swinging' | 'syncopated'): this;
    // Vocal methods
    vocals(settings: { style?: VocalStyle | VocalStyle[]; language?: string; theme?: string; delivery?: string }): this;
    vocalStyle(style: VocalStyle | VocalStyle[]): this;
    language(language: string): this;
    lyrics(lyrics: string): this;
    lyricsTheme(theme: string): this;
    delivery(delivery: string): this;
    instrumental(): this;
    // Instrumentation methods
    instruments(instruments: Instrument[]): this;
    instrumentation(settings: { lead?: Instrument | Instrument[]; rhythm?: Instrument[]; bass?: Instrument }): this;
    leadInstrument(instrument: Instrument | Instrument[]): this;
    rhythmSection(instruments: Instrument[]): this;
    bassInstrument(instrument: Instrument): this;
    percussion(instruments: Instrument | Instrument[]): this;
    pads(instruments: Instrument | Instrument[]): this;
    featuredInstrument(instrument: Instrument): this;
    // Structure methods
    structure(settings: { sections?: Array<{ type: string; bars?: number; description?: string }>; duration?: number }): this;
    section(type: 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'drop' | 'outro', bars?: number, description?: string): this;
    form(form: string): this;
    duration(seconds: number): this;
    // Production methods
    production(settings: { style?: string | string[]; era?: string; reference?: string[] }): this;
    productionStyle(style: string | string[]): this;
    era(era: string): this;
    reference(artists: string[]): this;
    texture(texture: string): this;
    effects(effects: string[]): this;
    // Technical methods
    key(key: string): this;
    timeSignature(sig: '4/4' | '3/4' | '6/8' | '5/4' | '7/8'): this;
    // Tags
    tag(tag: string): this;
    tags(tags: string[]): this;
    custom(text: string): this;
    build(): BuiltAudioPrompt;
  }

  export function audio(): AudioPromptBuilder;

  // ============================================================================
  // IMAGE BUILDER TYPES
  // ============================================================================
  
  export interface BuiltImagePrompt { prompt: string; structure: Record<string, unknown>; }

  export class ImagePromptBuilder {
    // Subject methods
    subject(main: string | { main: string; details?: string[]; expression?: string; pose?: string }): this;
    subjectDetails(details: string[]): this;
    expression(expression: string): this;
    pose(pose: string): this;
    action(action: string): this;
    clothing(clothing: string): this;
    accessories(accessories: string[]): this;
    subjectCount(count: number | 'single' | 'couple' | 'group' | 'crowd'): this;
    // Environment methods
    environment(setting: string | { setting: string; location?: string; atmosphere?: string; season?: string }): this;
    location(location: string): this;
    props(props: string[]): this;
    atmosphere(atmosphere: string): this;
    season(season: 'spring' | 'summer' | 'autumn' | 'winter'): this;
    // Camera methods
    camera(settings: { angle?: CameraAngle; shot?: ShotType; lens?: LensType; focus?: FocusType }): this;
    angle(angle: CameraAngle): this;
    shot(shot: ShotType): this;
    lens(lens: LensType): this;
    focus(focus: FocusType): this;
    aperture(aperture: string): this;
    filmStock(filmStock: FilmStock): this;
    filmFormat(format: string): this;
    cameraBrand(brand: string): this;
    cameraModel(model: string): this;
    sensor(sensor: string): this;
    lensModel(model: string): this;
    lensBrand(brand: string): this;
    focalLength(length: string): this;
    bokeh(style: BokehStyle): this;
    filter(filter: FilterType | FilterType[]): this;
    iso(iso: number): this;
    shutterSpeed(speed: string): this;
    whiteBalance(wb: 'daylight' | 'cloudy' | 'tungsten' | 'fluorescent' | 'flash' | 'custom'): this;
    colorProfile(profile: string): this;
    // Lighting methods
    lighting(settings: { type?: LightingType | LightingType[]; time?: TimeOfDay; direction?: string; intensity?: string }): this;
    lightingType(type: LightingType | LightingType[]): this;
    timeOfDay(time: TimeOfDay): this;
    weather(weather: 'sunny' | 'cloudy' | 'overcast' | 'foggy' | 'misty' | 'rainy' | 'stormy' | 'snowy' | 'hazy'): this;
    lightDirection(direction: 'front' | 'side' | 'back' | 'top' | 'bottom' | 'three-quarter'): this;
    lightIntensity(intensity: 'soft' | 'medium' | 'hard' | 'dramatic'): this;
    // Composition methods
    composition(settings: { ruleOfThirds?: boolean; goldenRatio?: boolean; symmetry?: string }): this;
    ruleOfThirds(): this;
    goldenRatio(): this;
    symmetry(type: 'none' | 'horizontal' | 'vertical' | 'radial'): this;
    foreground(fg: string): this;
    midground(mg: string): this;
    background(bg: string): this;
    // Style methods
    style(settings: { medium?: ArtStyle | ArtStyle[]; artist?: string | string[] }): this;
    medium(medium: ArtStyle | ArtStyle[]): this;
    artist(artist: string | string[]): this;
    influence(influences: string[]): this;
    // Color methods
    color(settings: { palette?: ColorPalette | ColorPalette[]; primary?: string[]; accent?: string[] }): this;
    palette(palette: ColorPalette | ColorPalette[]): this;
    primaryColors(colors: string[]): this;
    accentColors(colors: string[]): this;
    colorGrade(grade: string): this;
    // Technical methods
    technical(settings: { aspectRatio?: string; resolution?: string; quality?: string }): this;
    aspectRatio(ratio: '1:1' | '4:3' | '3:2' | '16:9' | '21:9' | '9:16'): this;
    resolution(resolution: string): this;
    quality(quality: 'draft' | 'standard' | 'high' | 'ultra' | 'masterpiece'): this;
    // Mood and misc
    mood(mood: string | string[]): this;
    negative(items: string[]): this;
    custom(text: string): this;
    build(): BuiltImagePrompt;
  }

  export function image(): ImagePromptBuilder;

  // ============================================================================
  // UTILITY MODULES
  // ============================================================================

  export namespace variables {
    export function detect(text: string): Array<{ name: string; pattern: string }>;
    export function normalize(text: string): string;
    export function extractVariables(text: string): Array<{ name: string; defaultValue?: string }>;
    export function compile(text: string, values: Record<string, string>): string;
  }

  export namespace similarity {
    export function calculate(content1: string, content2: string): number;
    export function isDuplicate(content1: string, content2: string, threshold?: number): boolean;
    export function findDuplicates(prompts: string[], threshold?: number): string[][];
    export function deduplicate(prompts: string[], threshold?: number): string[];
  }

  export namespace quality {
    export function check(content: string): { score: number; issues: Array<{ type: string; message: string }> };
    export function validate(content: string): boolean;
    export function getSuggestions(content: string): string[];
  }

  export namespace parser {
    export function parse(content: string): { type: string; content: unknown };
    export function toYaml(obj: unknown): string;
    export function toJson(obj: unknown): string;
  }
}
`;

function ApiDocsSidebar({ selectedItem, onSelectItem }: { selectedItem: ApiItem | null; onSelectItem: (item: ApiItem | null) => void }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Builder", "PromptBuilder Methods"]));
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (name: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const getTypeColor = (type: ApiItem["type"]) => {
    switch (type) {
      case "function": return "text-blue-500 dark:text-blue-400";
      case "class": return "text-yellow-500 dark:text-yellow-400";
      case "interface": return "text-green-500 dark:text-green-400";
      case "type": return "text-purple-500 dark:text-purple-400";
      case "const": return "text-orange-500 dark:text-orange-400";
      default: return "text-muted-foreground";
    }
  };

  const getTypeLabel = (type: ApiItem["type"]) => {
    switch (type) {
      case "function": return "fn";
      case "class": return "class";
      case "interface": return "interface";
      case "type": return "type";
      case "const": return "const";
      default: return type;
    }
  };

  // Filter sections and items based on search query
  const filteredDocs = searchQuery.trim()
    ? API_DOCS.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.signature?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : API_DOCS;

  // When searching, expand all sections with matches
  const effectiveExpandedSections = searchQuery.trim()
    ? new Set(filteredDocs.map(s => s.name))
    : expandedSections;

  return (
    <div className="w-64 border-r flex flex-col bg-muted/20 overflow-hidden">
      <div className="px-2 py-2 border-b bg-muted/30 shrink-0 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Book className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">API Docs</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 h-0">
        <div className="p-2">
          {filteredDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
          ) : (
            filteredDocs.map((section) => (
              <div key={section.name} className="mb-1">
                <button
                  onClick={() => toggleSection(section.name)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                >
                  {effectiveExpandedSections.has(section.name) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {section.name}
                  {searchQuery && (
                    <span className="ml-auto text-xs text-muted-foreground">{section.items.length}</span>
                  )}
                </button>
                {effectiveExpandedSections.has(section.name) && (
                  <div className="ml-3 border-l pl-2 space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => onSelectItem(selectedItem?.name === item.name ? null : item)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 text-sm rounded transition-colors group",
                          selectedItem?.name === item.name ? "bg-accent" : "hover:bg-accent/50"
                        )}
                        title={item.signature || item.description}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono text-xs", getTypeColor(item.type))}>
                            {getTypeLabel(item.type)}
                          </span>
                          <span className="font-mono truncate">{item.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ApiDetailsPanel({ item, onClose }: { item: ApiItem; onClose: () => void }) {
  const getTypeColor = (type: ApiItem["type"]) => {
    switch (type) {
      case "function": return "text-blue-500 dark:text-blue-400";
      case "class": return "text-yellow-500 dark:text-yellow-400";
      case "interface": return "text-green-500 dark:text-green-400";
      case "type": return "text-purple-500 dark:text-purple-400";
      case "const": return "text-orange-500 dark:text-orange-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background border-t shadow-lg max-h-48 overflow-auto">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-mono", getTypeColor(item.type))}>{item.type}</span>
              <code className="text-sm font-semibold">{item.name}</code>
            </div>
            {item.signature && (
              <code className="text-xs text-muted-foreground block mt-1">{item.signature}</code>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
        )}
        {item.params && item.params.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium mb-1">Parameters:</p>
            <div className="space-y-1">
              {item.params.map((p) => (
                <div key={p.name} className="text-xs">
                  <code className="text-blue-500">{p.name}</code>
                  <span className="text-muted-foreground">: {p.type}</span>
                  <span className="text-muted-foreground"> — {p.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {item.returns && (
          <p className="text-xs"><span className="font-medium">Returns:</span> <code className="text-green-500">{item.returns}</code></p>
        )}
        {item.example && (
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">Example:</p>
            <pre className="text-xs bg-muted p-2 rounded font-mono overflow-x-auto">{item.example}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function PromptIde() {
  const t = useTranslations("ide");
  const { theme } = useTheme();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("json");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedApiItem, setSelectedApiItem] = useState<ApiItem | null>(null);

  const runCode = useCallback(() => {
    setIsRunning(true);
    setError(null);

    try {
      // Transform code: strip imports and handle the module-style code
      let transformedCode = code
        // Remove import statements
        .replace(/^import\s+.*?from\s+['"]prompts\.chat['"];?\s*$/gm, '')
        .replace(/^import\s+.*?from\s+['"]prompts\.chat\/.*?['"];?\s*$/gm, '')
        // Remove export statements but keep the content
        .replace(/^export\s+/gm, '')
        .trim();
      
      // Find the last expression (standalone identifier or expression) and return it
      const lines = transformedCode.split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      // If the last line is a simple identifier or expression (not a statement), wrap it in return
      if (lastLine && !lastLine.endsWith(';') && !lastLine.startsWith('//') && !lastLine.startsWith('/*')) {
        lines[lines.length - 1] = `return ${lastLine}`;
        transformedCode = lines.join('\n');
      } else if (lastLine.endsWith(';') && !lastLine.includes('=') && !lastLine.startsWith('const ') && !lastLine.startsWith('let ') && !lastLine.startsWith('var ')) {
        // Last line is an expression statement like "prompt;" - convert to return
        lines[lines.length - 1] = `return ${lastLine.slice(0, -1)}`;
        transformedCode = lines.join('\n');
      }
      
      // Wrap the code to capture the result
      const wrappedCode = `
        ${transformedCode}
      `;

      // Execute the code with the actual prompts.chat library
      const fn = new Function(
        'builder', 'fromPrompt', 'templates', 
        'video', 'audio', 'image', 'chat', 'chatPresets',
        'variables', 'similarity', 'quality', 'parser',
        wrappedCode
      );
      const result = fn(
        builder, fromPrompt, templates,
        video, audio, image, chat, chatPresets,
        variables, similarity, quality, parser
      );

      // Format output based on selected format
      formatOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setOutput("");
    } finally {
      setIsRunning(false);
    }
  }, [code, outputFormat]);

  const formatOutput = useCallback((result: unknown) => {
    if (!result) {
      setOutput("");
      return;
    }

    try {
      switch (outputFormat) {
        case "json":
          setOutput(JSON.stringify(result, null, 2));
          break;
        case "yaml":
          setOutput(toYaml(result));
          break;
        case "markdown":
          if (typeof result === 'string') {
            setOutput(result);
          } else if (typeof result === 'object' && result !== null) {
            // Try common prompt result properties
            if ('content' in result) {
              setOutput((result as { content: string }).content);
            } else if ('prompt' in result) {
              setOutput((result as { prompt: string }).prompt);
            } else if ('systemPrompt' in result) {
              setOutput((result as { systemPrompt: string }).systemPrompt);
            } else {
              // Fallback to JSON for objects without known text properties
              setOutput(JSON.stringify(result, null, 2));
            }
          } else {
            setOutput(String(result));
          }
          break;
      }
    } catch {
      setError("Failed to format output");
    }
  }, [outputFormat]);

  // Simple YAML serializer
  const toYaml = (obj: unknown, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj === 'string') {
      if (obj.includes('\n')) {
        return `|\n${obj.split('\n').map(line => spaces + '  ' + line).join('\n')}`;
      }
      return obj.includes(':') || obj.includes('#') ? `"${obj.replace(/"/g, '\\"')}"` : obj;
    }
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          const inner = toYaml(item, indent + 1);
          const lines = inner.split('\n');
          return `${spaces}- ${lines[0]}\n${lines.slice(1).map(l => spaces + '  ' + l).join('\n')}`.trim();
        }
        return `${spaces}- ${toYaml(item, indent)}`;
      }).join('\n');
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
      if (entries.length === 0) return '{}';
      return entries.map(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
        }
        if (Array.isArray(value)) {
          return `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
        }
        return `${spaces}${key}: ${toYaml(value, indent)}`;
      }).join('\n');
    }
    
    return String(obj);
  };

  // Re-run when output format changes
  useEffect(() => {
    if (output || error) {
      runCode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputFormat]);

  const handleEditorMount = useCallback((_editor: unknown, monaco: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = monaco as any;
    
    // Add custom type definitions for prompts.chat
    m.languages?.typescript?.typescriptDefaults?.addExtraLib(
      TYPE_DEFINITIONS,
      'prompts.chat.d.ts'
    );

    // Configure TypeScript compiler options
    m.languages?.typescript?.typescriptDefaults?.setCompilerOptions({
      target: 99, // ESNext
      allowNonTsExtensions: true,
      moduleResolution: 2, // NodeJs
      module: 99, // ESNext
      noEmit: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
    });
  }, []);

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output);
    toast.success(t("copied"));
  }, [output, t]);

  const resetCode = useCallback(() => {
    setCode(DEFAULT_CODE);
    setOutput("");
    setError(null);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
        <div className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">{t("title")}</h1>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCode}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("reset")}
          </Button>
          <Button
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {t("run")}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* API Docs sidebar */}
        <div className="relative flex flex-col">
          <ApiDocsSidebar selectedItem={selectedApiItem} onSelectItem={setSelectedApiItem} />
          {selectedApiItem && (
            <ApiDetailsPanel item={selectedApiItem} onClose={() => setSelectedApiItem(null)} />
          )}
        </div>

        {/* Editor panel */}
        <div className="flex-1 flex flex-col border-r">
          <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t("editor")}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_VIDEO)}
              >
                <Video className="h-3 w-3" />
                Video
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_AUDIO)}
              >
                <Music className="h-3 w-3" />
                Audio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_IMAGE)}
              >
                <Image className="h-3 w-3" />
                Image
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setCode(EXAMPLE_CHAT)}
              >
                <MessageSquare className="h-3 w-3" />
                Chat
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme={theme === "dark" ? "vs-dark" : "light"}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex-1 flex flex-col">
          <div className="h-10 px-4 border-b bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t("preview")}</span>
            <div className="flex items-center gap-2">
              <Tabs value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                <TabsList className="h-8">
                  <TabsTrigger value="json" className="text-xs gap-1 px-2 h-6">
                    <FileJson className="h-3 w-3" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="yaml" className="text-xs gap-1 px-2 h-6">
                    <FileText className="h-3 w-3" />
                    YAML
                  </TabsTrigger>
                  <TabsTrigger value="markdown" className="text-xs gap-1 px-2 h-6">
                    <FileText className="h-3 w-3" />
                    MD
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {output && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={copyOutput}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {error ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md m-4">
                <p className="text-sm text-destructive font-mono">{error}</p>
              </div>
            ) : output ? (
              <Editor
                height="100%"
                language={outputFormat === "json" ? "json" : outputFormat === "yaml" ? "yaml" : "markdown"}
                value={output}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  folding: true,
                  renderLineHighlight: "none",
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Play className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">{t("runToPreview")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
