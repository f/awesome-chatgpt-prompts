import { audio } from 'prompts.chat';

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
