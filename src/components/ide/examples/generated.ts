// Auto-generated from example .ts files - DO NOT EDIT MANUALLY
// Run: npm run generate:examples to regenerate

export const EXAMPLE_VIDEO = `import { video } from 'prompts.chat';

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

export default {
  json: prompt.structure,
  yaml: prompt.structure,
  markdown: prompt.prompt,
};
`;

export const EXAMPLE_AUDIO = `import { audio } from 'prompts.chat';

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

export default {
  json: prompt.structure,
  yaml: prompt.structure,
  markdown: prompt.prompt,
};
`;

export const EXAMPLE_IMAGE = `import { image } from 'prompts.chat';

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

export default {
  json: prompt.structure,
  yaml: prompt.structure,
  markdown: prompt.prompt,
};
`;

export const EXAMPLE_CHAT = `import { chat } from 'prompts.chat';

// Create a chat prompt for conversational AI
const prompt = chat()
  // Define the AI's role and expertise
  .role("senior software architect")
  .tone("professional")
  .expertise(["coding", "engineering"])
  
  // Set the main task
  .task("Review code and provide architectural feedback")
  
  // Configure reasoning style
  .stepByStep()
  
  // Output format
  .json()
  
  // Response length
  .detailed()
  
  .build();

export default {
  json: prompt.messages,
  yaml: prompt.messages,
  markdown: prompt.systemPrompt,
};
`;

export const DEFAULT_CODE = `import { builder, templates } from 'prompts.chat';

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

export default {
  json: prompt,
  yaml: prompt,
  markdown: prompt.content,
};
`;
