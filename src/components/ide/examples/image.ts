import { image } from 'prompts.chat';

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
