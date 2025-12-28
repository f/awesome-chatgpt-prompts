import { video } from 'prompts.chat';

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
