/**
 * Media Prompt Builders - The D3.js of Prompt Building
 * 
 * Comprehensive, structured builders for Image, Video, and Audio generation prompts.
 * Every attribute a professional would consider is available as a chainable method.
 * 
 * @example
 * ```ts
 * import { image, video, audio } from 'prompts.chat/builder';
 * 
 * const imagePrompt = image()
 *   .subject("a lone samurai")
 *   .environment("bamboo forest at dawn")
 *   .camera({ angle: "low", shot: "wide", lens: "35mm" })
 *   .lighting({ type: "rim", time: "golden-hour" })
 *   .style({ artist: "Akira Kurosawa", medium: "cinematic" })
 *   .build();
 * ```
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type OutputFormat = 'text' | 'json' | 'yaml' | 'markdown';

// --- Camera Brands & Models ---
export type CameraBrand = 
  | 'sony' | 'canon' | 'nikon' | 'fujifilm' | 'leica' | 'hasselblad' | 'phase-one'
  | 'panasonic' | 'olympus' | 'pentax' | 'red' | 'arri' | 'blackmagic' | 'panavision';

export type CameraModel = 
  // Sony
  | 'sony-a7iv' | 'sony-a7riv' | 'sony-a7siii' | 'sony-a1' | 'sony-fx3' | 'sony-fx6'
  | 'sony-venice' | 'sony-venice-2' | 'sony-a9ii' | 'sony-zv-e1'
  // Canon
  | 'canon-r5' | 'canon-r6' | 'canon-r3' | 'canon-r8' | 'canon-c70' | 'canon-c300-iii'
  | 'canon-c500-ii' | 'canon-5d-iv' | 'canon-1dx-iii' | 'canon-eos-r5c'
  // Nikon
  | 'nikon-z9' | 'nikon-z8' | 'nikon-z6-iii' | 'nikon-z7-ii' | 'nikon-d850' | 'nikon-d6'
  // Fujifilm
  | 'fujifilm-x-t5' | 'fujifilm-x-h2s' | 'fujifilm-x100vi' | 'fujifilm-gfx100s'
  | 'fujifilm-gfx100-ii' | 'fujifilm-x-pro3'
  // Leica
  | 'leica-m11' | 'leica-sl2' | 'leica-sl2-s' | 'leica-q3' | 'leica-m10-r'
  // Hasselblad
  | 'hasselblad-x2d' | 'hasselblad-907x' | 'hasselblad-h6d-100c'
  // Cinema Cameras
  | 'arri-alexa-35' | 'arri-alexa-mini-lf' | 'arri-alexa-65' | 'arri-amira'
  | 'red-v-raptor' | 'red-komodo' | 'red-gemini' | 'red-monstro'
  | 'blackmagic-ursa-mini-pro' | 'blackmagic-pocket-6k' | 'blackmagic-pocket-4k'
  | 'panavision-dxl2' | 'panavision-millennium-xl2';

export type SensorFormat = 
  | 'full-frame' | 'aps-c' | 'micro-four-thirds' | 'medium-format' | 'large-format'
  | 'super-35' | 'vista-vision' | 'imax' | '65mm' | '35mm-film' | '16mm-film' | '8mm-film';

export type FilmFormat = 
  | '35mm' | '120-medium-format' | '4x5-large-format' | '8x10-large-format'
  | '110-film' | 'instant-film' | 'super-8' | '16mm' | '65mm-imax';

// --- Camera & Shot Types ---
export type CameraAngle = 
  | 'eye-level' | 'low-angle' | 'high-angle' | 'dutch-angle' | 'birds-eye' 
  | 'worms-eye' | 'over-the-shoulder' | 'point-of-view' | 'aerial' | 'drone'
  | 'canted' | 'oblique' | 'hip-level' | 'knee-level' | 'ground-level';

export type ShotType = 
  | 'extreme-close-up' | 'close-up' | 'medium-close-up' | 'medium' | 'medium-wide'
  | 'wide' | 'extreme-wide' | 'establishing' | 'full-body' | 'portrait' | 'headshot';

export type LensType = 
  | 'wide-angle' | 'ultra-wide' | 'standard' | 'telephoto' | 'macro' | 'fisheye'
  | '14mm' | '24mm' | '35mm' | '50mm' | '85mm' | '100mm' | '135mm' | '200mm' | '400mm'
  | '600mm' | '800mm' | 'tilt-shift' | 'anamorphic' | 'spherical' | 'prime' | 'zoom';

export type LensBrand = 
  | 'zeiss' | 'leica' | 'canon' | 'nikon' | 'sony' | 'sigma' | 'tamron' | 'voigtlander'
  | 'fujifilm' | 'samyang' | 'rokinon' | 'tokina' | 'cooke' | 'arri' | 'panavision'
  | 'angenieux' | 'red' | 'atlas' | 'sirui';

export type LensModel = 
  // Zeiss
  | 'zeiss-otus-55' | 'zeiss-batis-85' | 'zeiss-milvus-35' | 'zeiss-supreme-prime'
  // Leica
  | 'leica-summilux-50' | 'leica-summicron-35' | 'leica-noctilux-50' | 'leica-apo-summicron'
  // Canon
  | 'canon-rf-50-1.2' | 'canon-rf-85-1.2' | 'canon-rf-28-70-f2' | 'canon-rf-100-500'
  // Sony
  | 'sony-gm-24-70' | 'sony-gm-70-200' | 'sony-gm-50-1.2' | 'sony-gm-85-1.4'
  // Sigma Art
  | 'sigma-art-35' | 'sigma-art-50' | 'sigma-art-85' | 'sigma-art-105-macro'
  // Cinema
  | 'cooke-s7i' | 'cooke-anamorphic' | 'arri-signature-prime' | 'arri-ultra-prime'
  | 'panavision-primo' | 'panavision-anamorphic' | 'atlas-orion-anamorphic'
  // Vintage
  | 'helios-44-2' | 'canon-fd-55' | 'minolta-rokkor-58' | 'pentax-takumar-50';

export type FocusType = 
  | 'shallow' | 'deep' | 'soft-focus' | 'tilt-shift' | 'rack-focus' | 'split-diopter'
  | 'zone-focus' | 'hyperfocal' | 'selective' | 'bokeh-heavy' | 'tack-sharp';

export type BokehStyle = 
  | 'smooth' | 'creamy' | 'swirly' | 'busy' | 'soap-bubble' | 'cat-eye' | 'oval-anamorphic';

export type FilterType = 
  | 'uv' | 'polarizer' | 'nd' | 'nd-graduated' | 'black-pro-mist' | 'white-pro-mist'
  | 'glimmer-glass' | 'classic-soft' | 'streak' | 'starburst' | 'diffusion'
  | 'infrared' | 'color-gel' | 'warming' | 'cooling' | 'vintage-look';

export type CameraMovement = 
  | 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'pedestal' | 'zoom' 
  | 'handheld' | 'steadicam' | 'crane' | 'drone' | 'tracking' | 'arc' | 'whip-pan'
  | 'roll' | 'boom' | 'jib' | 'cable-cam' | 'motion-control' | 'snorricam'
  | 'dutch-roll' | 'vertigo-effect' | 'crash-zoom' | 'slow-push' | 'slow-pull';

export type CameraRig = 
  | 'tripod' | 'monopod' | 'gimbal' | 'steadicam' | 'easyrig' | 'shoulder-rig'
  | 'slider' | 'dolly' | 'jib' | 'crane' | 'technocrane' | 'russian-arm'
  | 'cable-cam' | 'drone' | 'fpv-drone' | 'motion-control' | 'handheld';

export type GimbalModel = 
  | 'dji-ronin-4d' | 'dji-ronin-rs3-pro' | 'dji-ronin-rs4' | 'moza-air-2'
  | 'zhiyun-crane-3s' | 'freefly-movi-pro' | 'tilta-gravity-g2x';

// --- Lighting Types ---
export type LightingType = 
  | 'natural' | 'studio' | 'dramatic' | 'soft' | 'hard' | 'diffused'
  | 'key' | 'fill' | 'rim' | 'backlit' | 'silhouette' | 'rembrandt'
  | 'split' | 'butterfly' | 'loop' | 'broad' | 'short' | 'chiaroscuro'
  | 'high-key' | 'low-key' | 'three-point' | 'practical' | 'motivated';

export type TimeOfDay = 
  | 'dawn' | 'sunrise' | 'golden-hour' | 'morning' | 'midday' | 'afternoon'
  | 'blue-hour' | 'sunset' | 'dusk' | 'twilight' | 'night' | 'midnight';

export type WeatherLighting = 
  | 'sunny' | 'cloudy' | 'overcast' | 'foggy' | 'misty' | 'rainy' 
  | 'stormy' | 'snowy' | 'hazy';

// --- Style Types ---
export type ArtStyle = 
  | 'photorealistic' | 'hyperrealistic' | 'cinematic' | 'documentary'
  | 'editorial' | 'fashion' | 'portrait' | 'landscape' | 'street'
  | 'fine-art' | 'conceptual' | 'surreal' | 'abstract' | 'minimalist'
  | 'maximalist' | 'vintage' | 'retro' | 'noir' | 'gothic' | 'romantic'
  | 'impressionist' | 'expressionist' | 'pop-art' | 'art-nouveau' | 'art-deco'
  | 'cyberpunk' | 'steampunk' | 'fantasy' | 'sci-fi' | 'anime' | 'manga'
  | 'comic-book' | 'illustration' | 'digital-art' | 'oil-painting' | 'watercolor'
  | 'sketch' | 'pencil-drawing' | 'charcoal' | 'pastel' | '3d-render';

export type FilmStock = 
  // Kodak Color Negative
  | 'kodak-portra-160' | 'kodak-portra-400' | 'kodak-portra-800' 
  | 'kodak-ektar-100' | 'kodak-gold-200' | 'kodak-ultramax-400' | 'kodak-colorplus-200'
  // Kodak Black & White
  | 'kodak-tri-x-400' | 'kodak-tmax-100' | 'kodak-tmax-400' | 'kodak-tmax-3200'
  // Kodak Slide
  | 'kodak-ektachrome-e100' | 'kodachrome-64' | 'kodachrome-200'
  // Kodak Cinema
  | 'kodak-vision3-50d' | 'kodak-vision3-200t' | 'kodak-vision3-250d' | 'kodak-vision3-500t'
  // Fujifilm
  | 'fujifilm-pro-400h' | 'fujifilm-superia-400' | 'fujifilm-c200'
  | 'fujifilm-velvia-50' | 'fujifilm-velvia-100' | 'fujifilm-provia-100f'
  | 'fujifilm-acros-100' | 'fujifilm-neopan-400' | 'fujifilm-eterna-500t'
  // Ilford
  | 'ilford-hp5-plus' | 'ilford-delta-100' | 'ilford-delta-400' | 'ilford-delta-3200'
  | 'ilford-fp4-plus' | 'ilford-pan-f-plus' | 'ilford-xp2-super'
  // CineStill
  | 'cinestill-50d' | 'cinestill-800t' | 'cinestill-400d' | 'cinestill-bwxx'
  // Lomography
  | 'lomography-100' | 'lomography-400' | 'lomography-800'
  | 'lomochrome-purple' | 'lomochrome-metropolis' | 'lomochrome-turquoise'
  // Instant
  | 'polaroid-sx-70' | 'polaroid-600' | 'polaroid-i-type' | 'polaroid-spectra'
  | 'instax-mini' | 'instax-wide' | 'instax-square'
  // Vintage/Discontinued
  | 'agfa-vista-400' | 'agfa-apx-100' | 'fomapan-100' | 'fomapan-400'
  | 'bergger-pancro-400' | 'jch-streetpan-400';

export type AspectRatio = 
  | '1:1' | '4:3' | '3:2' | '16:9' | '21:9' | '9:16' | '2:3' | '4:5' | '5:4';

// --- Color & Mood ---
export type ColorPalette = 
  | 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted' | 'pastel' | 'neon'
  | 'monochrome' | 'sepia' | 'desaturated' | 'high-contrast' | 'low-contrast'
  | 'earthy' | 'oceanic' | 'forest' | 'sunset' | 'midnight' | 'golden';

export type Mood = 
  | 'serene' | 'peaceful' | 'melancholic' | 'dramatic' | 'tense' | 'mysterious'
  | 'romantic' | 'nostalgic' | 'hopeful' | 'joyful' | 'energetic' | 'chaotic'
  | 'ethereal' | 'dark' | 'light' | 'whimsical' | 'eerie' | 'epic' | 'intimate';

// --- Video Specific ---
export type VideoTransition = 
  | 'cut' | 'fade' | 'dissolve' | 'wipe' | 'morph' | 'match-cut' | 'jump-cut'
  | 'cross-dissolve' | 'iris' | 'push' | 'slide';

export type VideoPacing = 
  | 'slow' | 'medium' | 'fast' | 'variable' | 'building' | 'frenetic' | 'contemplative';

// --- Audio/Music Specific ---
export type MusicGenre = 
  | 'pop' | 'rock' | 'jazz' | 'classical' | 'electronic' | 'hip-hop' | 'r&b'
  | 'country' | 'folk' | 'blues' | 'metal' | 'punk' | 'indie' | 'alternative'
  | 'ambient' | 'lo-fi' | 'synthwave' | 'orchestral' | 'cinematic' | 'world'
  | 'latin' | 'reggae' | 'soul' | 'funk' | 'disco' | 'house' | 'techno' | 'edm';

export type Instrument = 
  | 'piano' | 'guitar' | 'acoustic-guitar' | 'electric-guitar' | 'bass' | 'drums'
  | 'violin' | 'cello' | 'viola' | 'flute' | 'saxophone' | 'trumpet' | 'trombone'
  | 'synthesizer' | 'organ' | 'harp' | 'percussion' | 'strings' | 'brass' | 'woodwinds'
  | 'choir' | 'vocals' | 'beatbox' | 'turntables' | 'harmonica' | 'banjo' | 'ukulele';

export type VocalStyle = 
  | 'male' | 'female' | 'duet' | 'choir' | 'a-cappella' | 'spoken-word' | 'rap'
  | 'falsetto' | 'belting' | 'whisper' | 'growl' | 'melodic' | 'harmonized';

export type Tempo = 
  | 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'vivace' | 'presto'
  | number; // BPM

// ============================================================================
// IMAGE PROMPT BUILDER
// ============================================================================

export interface ImageSubject {
  main: string;
  details?: string[];
  expression?: string;
  pose?: string;
  action?: string;
  clothing?: string;
  accessories?: string[];
  age?: string;
  ethnicity?: string;
  gender?: string;
  count?: number | 'single' | 'couple' | 'group' | 'crowd';
}

export interface ImageCamera {
  // Framing
  angle?: CameraAngle;
  shot?: ShotType;
  
  // Camera Body
  brand?: CameraBrand;
  model?: CameraModel;
  sensor?: SensorFormat;
  
  // Lens
  lens?: LensType;
  lensModel?: LensModel;
  lensBrand?: LensBrand;
  focalLength?: string;
  
  // Focus & Depth
  focus?: FocusType;
  aperture?: string;
  bokeh?: BokehStyle;
  focusDistance?: string;
  
  // Exposure
  iso?: number;
  shutterSpeed?: string;
  exposureCompensation?: string;
  
  // Film/Digital
  filmStock?: FilmStock;
  filmFormat?: FilmFormat;
  
  // Filters & Accessories
  filter?: FilterType | FilterType[];
  
  // Camera Settings
  whiteBalance?: 'daylight' | 'cloudy' | 'tungsten' | 'fluorescent' | 'flash' | 'custom';
  colorProfile?: string;
  pictureProfile?: string;
}

export interface ImageLighting {
  type?: LightingType | LightingType[];
  time?: TimeOfDay;
  weather?: WeatherLighting;
  direction?: 'front' | 'side' | 'back' | 'top' | 'bottom' | 'three-quarter';
  intensity?: 'soft' | 'medium' | 'hard' | 'dramatic';
  color?: string;
  sources?: string[];
}

export interface ImageComposition {
  ruleOfThirds?: boolean;
  goldenRatio?: boolean;
  symmetry?: 'none' | 'horizontal' | 'vertical' | 'radial';
  leadingLines?: boolean;
  framing?: string;
  negativeSpace?: boolean;
  layers?: string[];
  foreground?: string;
  midground?: string;
  background?: string;
}

export interface ImageStyle {
  medium?: ArtStyle | ArtStyle[];
  artist?: string | string[];
  era?: string;
  influence?: string[];
  quality?: string[];
  render?: string;
}

export interface ImageColor {
  palette?: ColorPalette | ColorPalette[];
  primary?: string[];
  accent?: string[];
  grade?: string;
  temperature?: 'warm' | 'neutral' | 'cool';
  saturation?: 'desaturated' | 'natural' | 'vibrant' | 'hyper-saturated';
  contrast?: 'low' | 'medium' | 'high';
}

export interface ImageEnvironment {
  setting: string;
  location?: string;
  terrain?: string;
  architecture?: string;
  props?: string[];
  atmosphere?: string;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  era?: string;
}

export interface ImageTechnical {
  aspectRatio?: AspectRatio;
  resolution?: string;
  quality?: 'draft' | 'standard' | 'high' | 'ultra' | 'masterpiece';
  detail?: 'low' | 'medium' | 'high' | 'extreme';
  noise?: 'none' | 'subtle' | 'filmic' | 'grainy';
  sharpness?: 'soft' | 'natural' | 'sharp' | 'crisp';
}

export interface BuiltImagePrompt {
  prompt: string;
  structure: {
    subject?: ImageSubject;
    camera?: ImageCamera;
    lighting?: ImageLighting;
    composition?: ImageComposition;
    style?: ImageStyle;
    color?: ImageColor;
    environment?: ImageEnvironment;
    technical?: ImageTechnical;
    mood?: Mood | Mood[];
    negative?: string[];
  };
}

export class ImagePromptBuilder {
  private _subject?: ImageSubject;
  private _camera?: ImageCamera;
  private _lighting?: ImageLighting;
  private _composition?: ImageComposition;
  private _style?: ImageStyle;
  private _color?: ImageColor;
  private _environment?: ImageEnvironment;
  private _technical?: ImageTechnical;
  private _mood?: Mood | Mood[];
  private _negative: string[] = [];
  private _custom: string[] = [];

  // --- Subject Methods ---
  
  subject(main: string | ImageSubject): this {
    if (typeof main === 'string') {
      this._subject = { ...(this._subject || {}), main };
    } else {
      this._subject = { ...(this._subject || {}), ...main };
    }
    return this;
  }

  subjectDetails(details: string[]): this {
    this._subject = { ...(this._subject || { main: '' }), details };
    return this;
  }

  expression(expression: string): this {
    this._subject = { ...(this._subject || { main: '' }), expression };
    return this;
  }

  pose(pose: string): this {
    this._subject = { ...(this._subject || { main: '' }), pose };
    return this;
  }

  action(action: string): this {
    this._subject = { ...(this._subject || { main: '' }), action };
    return this;
  }

  clothing(clothing: string): this {
    this._subject = { ...(this._subject || { main: '' }), clothing };
    return this;
  }

  accessories(accessories: string[]): this {
    this._subject = { ...(this._subject || { main: '' }), accessories };
    return this;
  }

  subjectCount(count: ImageSubject['count']): this {
    this._subject = { ...(this._subject || { main: '' }), count };
    return this;
  }

  // --- Camera Methods ---

  camera(settings: ImageCamera): this {
    this._camera = { ...(this._camera || {}), ...settings };
    return this;
  }

  angle(angle: CameraAngle): this {
    this._camera = { ...(this._camera || {}), angle };
    return this;
  }

  shot(shot: ShotType): this {
    this._camera = { ...(this._camera || {}), shot };
    return this;
  }

  lens(lens: LensType): this {
    this._camera = { ...(this._camera || {}), lens };
    return this;
  }

  focus(focus: FocusType): this {
    this._camera = { ...(this._camera || {}), focus };
    return this;
  }

  aperture(aperture: string): this {
    this._camera = { ...(this._camera || {}), aperture };
    return this;
  }

  filmStock(filmStock: FilmStock): this {
    this._camera = { ...(this._camera || {}), filmStock };
    return this;
  }

  filmFormat(format: FilmFormat): this {
    this._camera = { ...(this._camera || {}), filmFormat: format };
    return this;
  }

  cameraBrand(brand: CameraBrand): this {
    this._camera = { ...(this._camera || {}), brand };
    return this;
  }

  cameraModel(model: CameraModel): this {
    this._camera = { ...(this._camera || {}), model };
    return this;
  }

  sensor(sensor: SensorFormat): this {
    this._camera = { ...(this._camera || {}), sensor };
    return this;
  }

  lensModel(model: LensModel): this {
    this._camera = { ...(this._camera || {}), lensModel: model };
    return this;
  }

  lensBrand(brand: LensBrand): this {
    this._camera = { ...(this._camera || {}), lensBrand: brand };
    return this;
  }

  focalLength(length: string): this {
    this._camera = { ...(this._camera || {}), focalLength: length };
    return this;
  }

  bokeh(style: BokehStyle): this {
    this._camera = { ...(this._camera || {}), bokeh: style };
    return this;
  }

  filter(filter: FilterType | FilterType[]): this {
    this._camera = { ...(this._camera || {}), filter };
    return this;
  }

  iso(iso: number): this {
    this._camera = { ...(this._camera || {}), iso };
    return this;
  }

  shutterSpeed(speed: string): this {
    this._camera = { ...(this._camera || {}), shutterSpeed: speed };
    return this;
  }

  whiteBalance(wb: ImageCamera['whiteBalance']): this {
    this._camera = { ...(this._camera || {}), whiteBalance: wb };
    return this;
  }

  colorProfile(profile: string): this {
    this._camera = { ...(this._camera || {}), colorProfile: profile };
    return this;
  }

  // --- Lighting Methods ---

  lighting(settings: ImageLighting): this {
    this._lighting = { ...(this._lighting || {}), ...settings };
    return this;
  }

  lightingType(type: LightingType | LightingType[]): this {
    this._lighting = { ...(this._lighting || {}), type };
    return this;
  }

  timeOfDay(time: TimeOfDay): this {
    this._lighting = { ...(this._lighting || {}), time };
    return this;
  }

  weather(weather: WeatherLighting): this {
    this._lighting = { ...(this._lighting || {}), weather };
    return this;
  }

  lightDirection(direction: ImageLighting['direction']): this {
    this._lighting = { ...(this._lighting || {}), direction };
    return this;
  }

  lightIntensity(intensity: ImageLighting['intensity']): this {
    this._lighting = { ...(this._lighting || {}), intensity };
    return this;
  }

  // --- Composition Methods ---

  composition(settings: ImageComposition): this {
    this._composition = { ...(this._composition || {}), ...settings };
    return this;
  }

  ruleOfThirds(): this {
    this._composition = { ...(this._composition || {}), ruleOfThirds: true };
    return this;
  }

  goldenRatio(): this {
    this._composition = { ...(this._composition || {}), goldenRatio: true };
    return this;
  }

  symmetry(type: ImageComposition['symmetry']): this {
    this._composition = { ...(this._composition || {}), symmetry: type };
    return this;
  }

  foreground(fg: string): this {
    this._composition = { ...(this._composition || {}), foreground: fg };
    return this;
  }

  midground(mg: string): this {
    this._composition = { ...(this._composition || {}), midground: mg };
    return this;
  }

  background(bg: string): this {
    this._composition = { ...(this._composition || {}), background: bg };
    return this;
  }

  // --- Environment Methods ---

  environment(setting: string | ImageEnvironment): this {
    if (typeof setting === 'string') {
      this._environment = { ...(this._environment || { setting: '' }), setting };
    } else {
      this._environment = { ...(this._environment || { setting: '' }), ...setting };
    }
    return this;
  }

  location(location: string): this {
    this._environment = { ...(this._environment || { setting: '' }), location };
    return this;
  }

  props(props: string[]): this {
    this._environment = { ...(this._environment || { setting: '' }), props };
    return this;
  }

  atmosphere(atmosphere: string): this {
    this._environment = { ...(this._environment || { setting: '' }), atmosphere };
    return this;
  }

  season(season: ImageEnvironment['season']): this {
    this._environment = { ...(this._environment || { setting: '' }), season };
    return this;
  }

  // --- Style Methods ---

  style(settings: ImageStyle): this {
    this._style = { ...(this._style || {}), ...settings };
    return this;
  }

  medium(medium: ArtStyle | ArtStyle[]): this {
    this._style = { ...(this._style || {}), medium };
    return this;
  }

  artist(artist: string | string[]): this {
    this._style = { ...(this._style || {}), artist };
    return this;
  }

  influence(influences: string[]): this {
    this._style = { ...(this._style || {}), influence: influences };
    return this;
  }

  // --- Color Methods ---

  color(settings: ImageColor): this {
    this._color = { ...(this._color || {}), ...settings };
    return this;
  }

  palette(palette: ColorPalette | ColorPalette[]): this {
    this._color = { ...(this._color || {}), palette };
    return this;
  }

  primaryColors(colors: string[]): this {
    this._color = { ...(this._color || {}), primary: colors };
    return this;
  }

  accentColors(colors: string[]): this {
    this._color = { ...(this._color || {}), accent: colors };
    return this;
  }

  colorGrade(grade: string): this {
    this._color = { ...(this._color || {}), grade };
    return this;
  }

  // --- Technical Methods ---

  technical(settings: ImageTechnical): this {
    this._technical = { ...(this._technical || {}), ...settings };
    return this;
  }

  aspectRatio(ratio: AspectRatio): this {
    this._technical = { ...(this._technical || {}), aspectRatio: ratio };
    return this;
  }

  resolution(resolution: string): this {
    this._technical = { ...(this._technical || {}), resolution };
    return this;
  }

  quality(quality: ImageTechnical['quality']): this {
    this._technical = { ...(this._technical || {}), quality };
    return this;
  }

  // --- Mood & Misc ---

  mood(mood: Mood | Mood[]): this {
    this._mood = mood;
    return this;
  }

  negative(items: string[]): this {
    this._negative = [...this._negative, ...items];
    return this;
  }

  custom(text: string): this {
    this._custom.push(text);
    return this;
  }

  // --- Build Methods ---

  private buildPromptText(): string {
    const parts: string[] = [];

    // Subject
    if (this._subject) {
      let subjectText = this._subject.main;
      if (this._subject.count && this._subject.count !== 'single') {
        subjectText = `${this._subject.count} ${subjectText}`;
      }
      if (this._subject.expression) subjectText += `, ${this._subject.expression} expression`;
      if (this._subject.pose) subjectText += `, ${this._subject.pose}`;
      if (this._subject.action) subjectText += `, ${this._subject.action}`;
      if (this._subject.clothing) subjectText += `, wearing ${this._subject.clothing}`;
      if (this._subject.accessories?.length) subjectText += `, with ${this._subject.accessories.join(', ')}`;
      if (this._subject.details?.length) subjectText += `, ${this._subject.details.join(', ')}`;
      parts.push(subjectText);
    }

    // Environment
    if (this._environment) {
      let envText = this._environment.setting;
      if (this._environment.location) envText += ` in ${this._environment.location}`;
      if (this._environment.atmosphere) envText += `, ${this._environment.atmosphere} atmosphere`;
      if (this._environment.season) envText += `, ${this._environment.season}`;
      if (this._environment.props?.length) envText += `, with ${this._environment.props.join(', ')}`;
      parts.push(envText);
    }

    // Composition
    if (this._composition) {
      const compParts: string[] = [];
      if (this._composition.foreground) compParts.push(`foreground: ${this._composition.foreground}`);
      if (this._composition.midground) compParts.push(`midground: ${this._composition.midground}`);
      if (this._composition.background) compParts.push(`background: ${this._composition.background}`);
      if (this._composition.ruleOfThirds) compParts.push('rule of thirds composition');
      if (this._composition.goldenRatio) compParts.push('golden ratio composition');
      if (this._composition.symmetry && this._composition.symmetry !== 'none') {
        compParts.push(`${this._composition.symmetry} symmetry`);
      }
      if (compParts.length) parts.push(compParts.join(', '));
    }

    // Camera
    if (this._camera) {
      const camParts: string[] = [];
      if (this._camera.shot) camParts.push(`${this._camera.shot} shot`);
      if (this._camera.angle) camParts.push(`${this._camera.angle}`);
      if (this._camera.lens) camParts.push(`${this._camera.lens} lens`);
      if (this._camera.focus) camParts.push(`${this._camera.focus} depth of field`);
      if (this._camera.aperture) camParts.push(`f/${this._camera.aperture}`);
      if (this._camera.filmStock) camParts.push(`shot on ${this._camera.filmStock}`);
      if (this._camera.brand) camParts.push(`${this._camera.brand}`);
      if (camParts.length) parts.push(camParts.join(', '));
    }

    // Lighting
    if (this._lighting) {
      const lightParts: string[] = [];
      if (this._lighting.type) {
        const types = Array.isArray(this._lighting.type) ? this._lighting.type : [this._lighting.type];
        lightParts.push(`${types.join(' and ')} lighting`);
      }
      if (this._lighting.time) lightParts.push(this._lighting.time);
      if (this._lighting.weather) lightParts.push(`${this._lighting.weather} weather`);
      if (this._lighting.direction) lightParts.push(`light from ${this._lighting.direction}`);
      if (this._lighting.intensity) lightParts.push(`${this._lighting.intensity} light`);
      if (lightParts.length) parts.push(lightParts.join(', '));
    }

    // Style
    if (this._style) {
      const styleParts: string[] = [];
      if (this._style.medium) {
        const mediums = Array.isArray(this._style.medium) ? this._style.medium : [this._style.medium];
        styleParts.push(mediums.join(', '));
      }
      if (this._style.artist) {
        const artists = Array.isArray(this._style.artist) ? this._style.artist : [this._style.artist];
        styleParts.push(`in the style of ${artists.join(' and ')}`);
      }
      if (this._style.era) styleParts.push(this._style.era);
      if (this._style.influence?.length) styleParts.push(`influenced by ${this._style.influence.join(', ')}`);
      if (this._style.quality?.length) styleParts.push(this._style.quality.join(', '));
      if (styleParts.length) parts.push(styleParts.join(', '));
    }

    // Color
    if (this._color) {
      const colorParts: string[] = [];
      if (this._color.palette) {
        const palettes = Array.isArray(this._color.palette) ? this._color.palette : [this._color.palette];
        colorParts.push(`${palettes.join(' and ')} color palette`);
      }
      if (this._color.primary?.length) colorParts.push(`primary colors: ${this._color.primary.join(', ')}`);
      if (this._color.accent?.length) colorParts.push(`accent colors: ${this._color.accent.join(', ')}`);
      if (this._color.grade) colorParts.push(`${this._color.grade} color grade`);
      if (this._color.temperature) colorParts.push(`${this._color.temperature} tones`);
      if (colorParts.length) parts.push(colorParts.join(', '));
    }

    // Mood
    if (this._mood) {
      const moods = Array.isArray(this._mood) ? this._mood : [this._mood];
      parts.push(`${moods.join(', ')} mood`);
    }

    // Technical
    if (this._technical) {
      const techParts: string[] = [];
      if (this._technical.quality) techParts.push(`${this._technical.quality} quality`);
      if (this._technical.detail) techParts.push(`${this._technical.detail} detail`);
      if (this._technical.resolution) techParts.push(this._technical.resolution);
      if (techParts.length) parts.push(techParts.join(', '));
    }

    // Custom
    if (this._custom.length) {
      parts.push(this._custom.join(', '));
    }

    let prompt = parts.join(', ');

    // Negative prompts
    if (this._negative.length) {
      prompt += ` --no ${this._negative.join(', ')}`;
    }

    // Aspect ratio
    if (this._technical?.aspectRatio) {
      prompt += ` --ar ${this._technical.aspectRatio}`;
    }

    return prompt;
  }

  build(): BuiltImagePrompt {
    return {
      prompt: this.buildPromptText(),
      structure: {
        subject: this._subject,
        camera: this._camera,
        lighting: this._lighting,
        composition: this._composition,
        style: this._style,
        color: this._color,
        environment: this._environment,
        technical: this._technical,
        mood: this._mood,
        negative: this._negative.length ? this._negative : undefined,
      },
    };
  }

  toString(): string {
    return this.build().prompt;
  }

  toJSON(): string {
    return JSON.stringify(this.build().structure, null, 2);
  }

  toYAML(): string {
    return objectToYaml(this.build().structure);
  }

  toMarkdown(): string {
    const built = this.build();
    const sections: string[] = ['# Image Prompt\n'];
    
    sections.push('## Prompt\n```\n' + built.prompt + '\n```\n');
    
    if (built.structure.subject) {
      sections.push('## Subject\n' + objectToMarkdownList(built.structure.subject));
    }
    if (built.structure.environment) {
      sections.push('## Environment\n' + objectToMarkdownList(built.structure.environment));
    }
    if (built.structure.camera) {
      sections.push('## Camera\n' + objectToMarkdownList(built.structure.camera));
    }
    if (built.structure.lighting) {
      sections.push('## Lighting\n' + objectToMarkdownList(built.structure.lighting));
    }
    if (built.structure.composition) {
      sections.push('## Composition\n' + objectToMarkdownList(built.structure.composition));
    }
    if (built.structure.style) {
      sections.push('## Style\n' + objectToMarkdownList(built.structure.style));
    }
    if (built.structure.color) {
      sections.push('## Color\n' + objectToMarkdownList(built.structure.color));
    }
    if (built.structure.technical) {
      sections.push('## Technical\n' + objectToMarkdownList(built.structure.technical));
    }
    
    return sections.join('\n');
  }

  format(fmt: OutputFormat): string {
    switch (fmt) {
      case 'json': return this.toJSON();
      case 'yaml': return this.toYAML();
      case 'markdown': return this.toMarkdown();
      default: return this.toString();
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function objectToYaml(obj: object, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      lines.push(`${spaces}${key}:`);
      for (const item of value) {
        if (typeof item === 'object') {
          lines.push(`${spaces}  -`);
          lines.push(objectToYaml(item as Record<string, unknown>, indent + 2).replace(/^/gm, '  '));
        } else {
          lines.push(`${spaces}  - ${item}`);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${spaces}${key}:`);
      lines.push(objectToYaml(value as Record<string, unknown>, indent + 1));
    } else {
      lines.push(`${spaces}${key}: ${value}`);
    }
  }
  
  return lines.join('\n');
}

function objectToMarkdownList(obj: object, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      lines.push(`${spaces}- **${key}:** ${value.join(', ')}`);
    } else if (typeof value === 'object') {
      lines.push(`${spaces}- **${key}:**`);
      lines.push(objectToMarkdownList(value as Record<string, unknown>, indent + 1));
    } else {
      lines.push(`${spaces}- **${key}:** ${value}`);
    }
  }
  
  return lines.join('\n');
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new image prompt builder
 */
export function image(): ImagePromptBuilder {
  return new ImagePromptBuilder();
}
