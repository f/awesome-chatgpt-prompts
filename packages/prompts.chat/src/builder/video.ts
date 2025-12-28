/**
 * Video Prompt Builder - Comprehensive video generation prompt builder
 * 
 * Based on OpenAI Sora, Runway, and other video generation best practices.
 * 
 * @example
 * ```ts
 * import { video } from 'prompts.chat/builder';
 * 
 * const prompt = video()
 *   .scene("A samurai walks through a bamboo forest")
 *   .camera({ movement: "tracking", angle: "low" })
 *   .lighting({ time: "golden-hour", type: "natural" })
 *   .duration(5)
 *   .build();
 * ```
 */

import type {
  CameraAngle, ShotType, LensType, CameraMovement,
  LightingType, TimeOfDay, WeatherLighting,
  ArtStyle, ColorPalette, Mood, VideoTransition, VideoPacing,
  OutputFormat, CameraBrand, CameraModel, SensorFormat,
  LensBrand, LensModel, CameraRig, GimbalModel, FilterType,
  FilmStock, BokehStyle,
} from './media';

// ============================================================================
// VIDEO-SPECIFIC TYPES
// ============================================================================

export interface VideoScene {
  description: string;
  setting?: string;
  timeOfDay?: TimeOfDay;
  weather?: WeatherLighting;
  atmosphere?: string;
}

export interface VideoSubject {
  main: string;
  appearance?: string;
  clothing?: string;
  age?: string;
  gender?: string;
  count?: number | 'single' | 'couple' | 'group' | 'crowd';
}

export interface VideoCamera {
  // Framing
  shot?: ShotType;
  angle?: CameraAngle;
  
  // Camera Body
  brand?: CameraBrand;
  model?: CameraModel;
  sensor?: SensorFormat;
  
  // Lens
  lens?: LensType;
  lensModel?: LensModel;
  lensBrand?: LensBrand;
  focalLength?: string;
  anamorphic?: boolean;
  anamorphicRatio?: '1.33x' | '1.5x' | '1.8x' | '2x';
  
  // Focus
  focus?: 'shallow' | 'deep' | 'rack-focus' | 'pull-focus' | 'split-diopter';
  aperture?: string;
  bokeh?: BokehStyle;
  
  // Movement
  movement?: CameraMovement;
  movementSpeed?: 'slow' | 'medium' | 'fast';
  movementDirection?: 'left' | 'right' | 'forward' | 'backward' | 'up' | 'down' | 'arc-left' | 'arc-right';
  
  // Rig & Stabilization
  rig?: CameraRig;
  gimbal?: GimbalModel;
  platform?: 'handheld' | 'steadicam' | 'tripod' | 'drone' | 'crane' | 'gimbal' | 'slider' | 'dolly' | 'technocrane' | 'russian-arm' | 'fpv-drone';
  
  // Technical
  shutterAngle?: number;
  frameRate?: 24 | 25 | 30 | 48 | 60 | 120 | 240;
  slowMotion?: boolean;
  filter?: FilterType | FilterType[];
  
  // Film Look
  filmStock?: FilmStock;
  filmGrain?: 'none' | 'subtle' | 'moderate' | 'heavy';
  halation?: boolean;
}

export interface VideoLighting {
  type?: LightingType | LightingType[];
  time?: TimeOfDay;
  weather?: WeatherLighting;
  direction?: 'front' | 'side' | 'back' | 'top' | 'three-quarter';
  intensity?: 'soft' | 'medium' | 'hard' | 'dramatic';
  sources?: string[];
  color?: string;
}

export interface VideoAction {
  beat: number;
  action: string;
  duration?: number;
  timing?: 'start' | 'middle' | 'end';
}

export interface VideoMotion {
  subject?: string;
  type?: 'walk' | 'run' | 'gesture' | 'turn' | 'look' | 'reach' | 'sit' | 'stand' | 'custom';
  direction?: 'left' | 'right' | 'forward' | 'backward' | 'up' | 'down';
  speed?: 'slow' | 'normal' | 'fast';
  beats?: string[];
}

export interface VideoStyle {
  format?: string;
  era?: string;
  filmStock?: string;
  look?: ArtStyle | ArtStyle[];
  grade?: string;
  reference?: string[];
}

export interface VideoColor {
  palette?: ColorPalette | ColorPalette[];
  anchors?: string[];
  temperature?: 'warm' | 'neutral' | 'cool';
  grade?: string;
}

export interface VideoAudio {
  diegetic?: string[];
  ambient?: string;
  dialogue?: string;
  music?: string;
  soundEffects?: string[];
  mix?: string;
}

export interface VideoTechnical {
  duration?: number;
  resolution?: '480p' | '720p' | '1080p' | '4K';
  fps?: 24 | 30 | 60;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  shutterAngle?: number;
}

export interface VideoShot {
  timestamp?: string;
  name?: string;
  camera: VideoCamera;
  action?: string;
  purpose?: string;
}

export interface BuiltVideoPrompt {
  prompt: string;
  structure: {
    scene?: VideoScene;
    subject?: VideoSubject;
    camera?: VideoCamera;
    lighting?: VideoLighting;
    actions?: VideoAction[];
    motion?: VideoMotion;
    style?: VideoStyle;
    color?: VideoColor;
    audio?: VideoAudio;
    technical?: VideoTechnical;
    shots?: VideoShot[];
    mood?: Mood | Mood[];
    pacing?: VideoPacing;
    transitions?: VideoTransition[];
  };
}

// ============================================================================
// VIDEO PROMPT BUILDER
// ============================================================================

export class VideoPromptBuilder {
  private _scene?: VideoScene;
  private _subject?: VideoSubject;
  private _camera?: VideoCamera;
  private _lighting?: VideoLighting;
  private _actions: VideoAction[] = [];
  private _motion?: VideoMotion;
  private _style?: VideoStyle;
  private _color?: VideoColor;
  private _audio?: VideoAudio;
  private _technical?: VideoTechnical;
  private _shots: VideoShot[] = [];
  private _mood?: Mood | Mood[];
  private _pacing?: VideoPacing;
  private _transitions: VideoTransition[] = [];
  private _custom: string[] = [];

  // --- Scene Methods ---

  scene(description: string | VideoScene): this {
    if (typeof description === 'string') {
      this._scene = { ...(this._scene || { description: '' }), description };
    } else {
      this._scene = { ...(this._scene || { description: '' }), ...description };
    }
    return this;
  }

  setting(setting: string): this {
    this._scene = { ...(this._scene || { description: '' }), setting };
    return this;
  }

  // --- Subject Methods ---

  subject(main: string | VideoSubject): this {
    if (typeof main === 'string') {
      this._subject = { ...(this._subject || { main: '' }), main };
    } else {
      this._subject = { ...(this._subject || { main: '' }), ...main };
    }
    return this;
  }

  appearance(appearance: string): this {
    this._subject = { ...(this._subject || { main: '' }), appearance };
    return this;
  }

  clothing(clothing: string): this {
    this._subject = { ...(this._subject || { main: '' }), clothing };
    return this;
  }

  // --- Camera Methods ---

  camera(settings: VideoCamera): this {
    this._camera = { ...(this._camera || {}), ...settings };
    return this;
  }

  shot(shot: ShotType): this {
    this._camera = { ...(this._camera || {}), shot };
    return this;
  }

  angle(angle: CameraAngle): this {
    this._camera = { ...(this._camera || {}), angle };
    return this;
  }

  movement(movement: CameraMovement): this {
    this._camera = { ...(this._camera || {}), movement };
    return this;
  }

  lens(lens: LensType): this {
    this._camera = { ...(this._camera || {}), lens };
    return this;
  }

  platform(platform: VideoCamera['platform']): this {
    this._camera = { ...(this._camera || {}), platform };
    return this;
  }

  cameraSpeed(speed: VideoCamera['movementSpeed']): this {
    this._camera = { ...(this._camera || {}), movementSpeed: speed };
    return this;
  }

  movementDirection(direction: VideoCamera['movementDirection']): this {
    this._camera = { ...(this._camera || {}), movementDirection: direction };
    return this;
  }

  rig(rig: CameraRig): this {
    this._camera = { ...(this._camera || {}), rig };
    return this;
  }

  gimbal(gimbal: GimbalModel): this {
    this._camera = { ...(this._camera || {}), gimbal };
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

  anamorphic(ratio?: VideoCamera['anamorphicRatio']): this {
    this._camera = { ...(this._camera || {}), anamorphic: true, anamorphicRatio: ratio };
    return this;
  }

  aperture(aperture: string): this {
    this._camera = { ...(this._camera || {}), aperture };
    return this;
  }

  frameRate(fps: VideoCamera['frameRate']): this {
    this._camera = { ...(this._camera || {}), frameRate: fps };
    return this;
  }

  slowMotion(enabled = true): this {
    this._camera = { ...(this._camera || {}), slowMotion: enabled };
    return this;
  }

  shutterAngle(angle: number): this {
    this._camera = { ...(this._camera || {}), shutterAngle: angle };
    return this;
  }

  filter(filter: FilterType | FilterType[]): this {
    this._camera = { ...(this._camera || {}), filter };
    return this;
  }

  filmStock(stock: FilmStock): this {
    this._camera = { ...(this._camera || {}), filmStock: stock };
    return this;
  }

  filmGrain(grain: VideoCamera['filmGrain']): this {
    this._camera = { ...(this._camera || {}), filmGrain: grain };
    return this;
  }

  halation(enabled = true): this {
    this._camera = { ...(this._camera || {}), halation: enabled };
    return this;
  }

  // --- Lighting Methods ---

  lighting(settings: VideoLighting): this {
    this._lighting = { ...(this._lighting || {}), ...settings };
    return this;
  }

  lightingType(type: LightingType | LightingType[]): this {
    this._lighting = { ...(this._lighting || {}), type };
    return this;
  }

  timeOfDay(time: TimeOfDay): this {
    this._lighting = { ...(this._lighting || {}), time };
    this._scene = { ...(this._scene || { description: '' }), timeOfDay: time };
    return this;
  }

  weather(weather: WeatherLighting): this {
    this._lighting = { ...(this._lighting || {}), weather };
    this._scene = { ...(this._scene || { description: '' }), weather };
    return this;
  }

  // --- Action & Motion Methods ---

  action(action: string, options: Partial<Omit<VideoAction, 'action'>> = {}): this {
    this._actions.push({
      beat: this._actions.length + 1,
      action,
      ...options,
    });
    return this;
  }

  actions(actions: string[]): this {
    actions.forEach((a, i) => this._actions.push({ beat: i + 1, action: a }));
    return this;
  }

  motion(settings: VideoMotion): this {
    this._motion = { ...(this._motion || {}), ...settings };
    return this;
  }

  motionBeats(beats: string[]): this {
    this._motion = { ...(this._motion || {}), beats };
    return this;
  }

  // --- Style Methods ---

  style(settings: VideoStyle): this {
    this._style = { ...(this._style || {}), ...settings };
    return this;
  }

  format(format: string): this {
    this._style = { ...(this._style || {}), format };
    return this;
  }

  era(era: string): this {
    this._style = { ...(this._style || {}), era };
    return this;
  }

  styleFilmStock(stock: string): this {
    this._style = { ...(this._style || {}), filmStock: stock };
    return this;
  }

  look(look: ArtStyle | ArtStyle[]): this {
    this._style = { ...(this._style || {}), look };
    return this;
  }

  reference(references: string[]): this {
    this._style = { ...(this._style || {}), reference: references };
    return this;
  }

  // --- Color Methods ---

  color(settings: VideoColor): this {
    this._color = { ...(this._color || {}), ...settings };
    return this;
  }

  palette(palette: ColorPalette | ColorPalette[]): this {
    this._color = { ...(this._color || {}), palette };
    return this;
  }

  colorAnchors(anchors: string[]): this {
    this._color = { ...(this._color || {}), anchors };
    return this;
  }

  colorGrade(grade: string): this {
    this._color = { ...(this._color || {}), grade };
    return this;
  }

  // --- Audio Methods ---

  audio(settings: VideoAudio): this {
    this._audio = { ...(this._audio || {}), ...settings };
    return this;
  }

  dialogue(dialogue: string): this {
    this._audio = { ...(this._audio || {}), dialogue };
    return this;
  }

  ambient(ambient: string): this {
    this._audio = { ...(this._audio || {}), ambient };
    return this;
  }

  diegetic(sounds: string[]): this {
    this._audio = { ...(this._audio || {}), diegetic: sounds };
    return this;
  }

  soundEffects(effects: string[]): this {
    this._audio = { ...(this._audio || {}), soundEffects: effects };
    return this;
  }

  music(music: string): this {
    this._audio = { ...(this._audio || {}), music };
    return this;
  }

  // --- Technical Methods ---

  technical(settings: VideoTechnical): this {
    this._technical = { ...(this._technical || {}), ...settings };
    return this;
  }

  duration(seconds: number): this {
    this._technical = { ...(this._technical || {}), duration: seconds };
    return this;
  }

  resolution(res: VideoTechnical['resolution']): this {
    this._technical = { ...(this._technical || {}), resolution: res };
    return this;
  }

  fps(fps: VideoTechnical['fps']): this {
    this._technical = { ...(this._technical || {}), fps };
    return this;
  }

  aspectRatio(ratio: VideoTechnical['aspectRatio']): this {
    this._technical = { ...(this._technical || {}), aspectRatio: ratio };
    return this;
  }

  // --- Shot List Methods ---

  addShot(shot: VideoShot): this {
    this._shots.push(shot);
    return this;
  }

  shotList(shots: VideoShot[]): this {
    this._shots = [...this._shots, ...shots];
    return this;
  }

  // --- Mood & Pacing ---

  mood(mood: Mood | Mood[]): this {
    this._mood = mood;
    return this;
  }

  pacing(pacing: VideoPacing): this {
    this._pacing = pacing;
    return this;
  }

  transition(transition: VideoTransition): this {
    this._transitions.push(transition);
    return this;
  }

  transitions(transitions: VideoTransition[]): this {
    this._transitions = [...this._transitions, ...transitions];
    return this;
  }

  custom(text: string): this {
    this._custom.push(text);
    return this;
  }

  // --- Build Methods ---

  private buildPromptText(): string {
    const sections: string[] = [];

    // Scene description
    if (this._scene) {
      let sceneText = this._scene.description;
      if (this._scene.setting) sceneText = `${this._scene.setting}. ${sceneText}`;
      if (this._scene.atmosphere) sceneText += `, ${this._scene.atmosphere} atmosphere`;
      sections.push(sceneText);
    }

    // Subject
    if (this._subject) {
      let subjectText = this._subject.main;
      if (this._subject.appearance) subjectText += `, ${this._subject.appearance}`;
      if (this._subject.clothing) subjectText += `, wearing ${this._subject.clothing}`;
      sections.push(subjectText);
    }

    // Camera & Cinematography
    const cinematography: string[] = [];
    if (this._camera) {
      if (this._camera.shot) cinematography.push(`${this._camera.shot} shot`);
      if (this._camera.angle) cinematography.push(this._camera.angle);
      if (this._camera.movement) cinematography.push(`${this._camera.movement} camera`);
      if (this._camera.lens) cinematography.push(`${this._camera.lens} lens`);
      if (this._camera.platform) cinematography.push(this._camera.platform);
      if (this._camera.focus) cinematography.push(`${this._camera.focus} focus`);
    }
    if (cinematography.length) {
      sections.push(`Cinematography: ${cinematography.join(', ')}`);
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
      if (this._lighting.intensity) lightParts.push(`${this._lighting.intensity} light`);
      if (this._lighting.sources?.length) lightParts.push(`light sources: ${this._lighting.sources.join(', ')}`);
      if (lightParts.length) sections.push(`Lighting: ${lightParts.join(', ')}`);
    }

    // Actions
    if (this._actions.length) {
      const actionText = this._actions.map(a => `- ${a.action}`).join('\n');
      sections.push(`Actions:\n${actionText}`);
    }

    // Motion
    if (this._motion?.beats?.length) {
      sections.push(`Motion beats: ${this._motion.beats.join(', ')}`);
    }

    // Style
    if (this._style) {
      const styleParts: string[] = [];
      if (this._style.format) styleParts.push(this._style.format);
      if (this._style.era) styleParts.push(this._style.era);
      if (this._style.filmStock) styleParts.push(`shot on ${this._style.filmStock}`);
      if (this._style.look) {
        const looks = Array.isArray(this._style.look) ? this._style.look : [this._style.look];
        styleParts.push(looks.join(', '));
      }
      if (styleParts.length) sections.push(`Style: ${styleParts.join(', ')}`);
    }

    // Color
    if (this._color) {
      const colorParts: string[] = [];
      if (this._color.palette) {
        const palettes = Array.isArray(this._color.palette) ? this._color.palette : [this._color.palette];
        colorParts.push(`${palettes.join(' and ')} palette`);
      }
      if (this._color.anchors?.length) colorParts.push(`color anchors: ${this._color.anchors.join(', ')}`);
      if (this._color.grade) colorParts.push(this._color.grade);
      if (colorParts.length) sections.push(`Color: ${colorParts.join(', ')}`);
    }

    // Audio
    if (this._audio) {
      const audioParts: string[] = [];
      if (this._audio.dialogue) audioParts.push(`Dialogue: "${this._audio.dialogue}"`);
      if (this._audio.ambient) audioParts.push(`Ambient: ${this._audio.ambient}`);
      if (this._audio.diegetic?.length) audioParts.push(`Diegetic sounds: ${this._audio.diegetic.join(', ')}`);
      if (this._audio.music) audioParts.push(`Music: ${this._audio.music}`);
      if (audioParts.length) sections.push(`Audio:\n${audioParts.join('\n')}`);
    }

    // Mood & Pacing
    if (this._mood) {
      const moods = Array.isArray(this._mood) ? this._mood : [this._mood];
      sections.push(`Mood: ${moods.join(', ')}`);
    }
    if (this._pacing) {
      sections.push(`Pacing: ${this._pacing}`);
    }

    // Custom
    if (this._custom.length) {
      sections.push(this._custom.join('\n'));
    }

    return sections.join('\n\n');
  }

  build(): BuiltVideoPrompt {
    return {
      prompt: this.buildPromptText(),
      structure: {
        scene: this._scene,
        subject: this._subject,
        camera: this._camera,
        lighting: this._lighting,
        actions: this._actions.length ? this._actions : undefined,
        motion: this._motion,
        style: this._style,
        color: this._color,
        audio: this._audio,
        technical: this._technical,
        shots: this._shots.length ? this._shots : undefined,
        mood: this._mood,
        pacing: this._pacing,
        transitions: this._transitions.length ? this._transitions : undefined,
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
    const sections: string[] = ['# Video Prompt\n'];
    
    sections.push('## Prompt\n```\n' + built.prompt + '\n```\n');
    
    if (built.structure.scene) {
      sections.push('## Scene\n' + objectToMarkdownList(built.structure.scene));
    }
    if (built.structure.subject) {
      sections.push('## Subject\n' + objectToMarkdownList(built.structure.subject));
    }
    if (built.structure.camera) {
      sections.push('## Camera\n' + objectToMarkdownList(built.structure.camera));
    }
    if (built.structure.lighting) {
      sections.push('## Lighting\n' + objectToMarkdownList(built.structure.lighting));
    }
    if (built.structure.actions) {
      sections.push('## Actions\n' + built.structure.actions.map(a => `- **Beat ${a.beat}:** ${a.action}`).join('\n'));
    }
    if (built.structure.style) {
      sections.push('## Style\n' + objectToMarkdownList(built.structure.style));
    }
    if (built.structure.audio) {
      sections.push('## Audio\n' + objectToMarkdownList(built.structure.audio));
    }
    if (built.structure.technical) {
      sections.push('## Technical\n' + objectToMarkdownList(built.structure.technical));
    }
    
    return sections.join('\n');
  }

  outputFormat(fmt: OutputFormat): string {
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
          lines.push(objectToYaml(item, indent + 2).replace(/^/gm, '  '));
        } else {
          lines.push(`${spaces}  - ${item}`);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${spaces}${key}:`);
      lines.push(objectToYaml(value, indent + 1));
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
      lines.push(objectToMarkdownList(value, indent + 1));
    } else {
      lines.push(`${spaces}- **${key}:** ${value}`);
    }
  }
  
  return lines.join('\n');
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new video prompt builder
 */
export function video(): VideoPromptBuilder {
  return new VideoPromptBuilder();
}
