/**
 * Auto-generated type definitions for prompts.chat
 * Generated from TypeScript source files via reflection
 * DO NOT EDIT MANUALLY - run `npm run docs:generate` to regenerate
 */

export const TYPE_DEFINITIONS = `
declare module 'prompts.chat' {

  // BUILDER TYPES
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

  // CHAT BUILDER TYPES
  export type MessageRole = 'system' | 'user' | 'assistant';
  export type ResponseFormatType = 'text' | 'json' | 'markdown' | 'code' | 'table';
  export type PersonaTone = | 'professional' | 'casual' | 'formal' | 'friendly' | 'academic'
  | 'technical' | 'creative' | 'empathetic' | 'authoritative' | 'playful'
  | 'concise' | 'detailed' | 'socratic' | 'coaching' | 'analytical'
  | 'encouraging' | 'neutral' | 'humorous' | 'serious';
  export type PersonaExpertise = | 'general' | 'coding' | 'writing' | 'analysis' | 'research'
  | 'teaching' | 'counseling' | 'creative' | 'legal' | 'medical'
  | 'financial' | 'scientific' | 'engineering' | 'design' | 'marketing'
  | 'business' | 'philosophy' | 'history' | 'languages' | 'mathematics';
  export type ReasoningStyle = | 'step-by-step' | 'chain-of-thought' | 'tree-of-thought' 
  | 'direct' | 'analytical' | 'comparative' | 'deductive' | 'inductive'
  | 'first-principles' | 'analogical' | 'devil-advocate';
  export type OutputLength = 'brief' | 'moderate' | 'detailed' | 'comprehensive' | 'exhaustive';
  export type OutputStyle = 'prose' | 'bullet-points' | 'numbered-list' | 'table' | 'code' | 'mixed' | 'qa' | 'dialogue';
  export interface ChatMessage {
    role: MessageRole;
    content: string;
    name?: string;
  }
  export interface JsonSchema {
    name: string;
    description?: string;
    schema: Record<string, unknown>;
  }
  export interface ResponseFormat {
    type: ResponseFormatType;
    jsonSchema?: JsonSchema;
    language?: string;
  }
  export interface ChatPersona {
    name?: string;
    role?: string;
    tone?: PersonaTone | PersonaTone[];
    expertise?: PersonaExpertise | PersonaExpertise[];
    personality?: string[];
    background?: string;
    language?: string;
    verbosity?: OutputLength;
  }
  export interface ChatContext {
    background?: string;
    domain?: string;
    audience?: string;
    purpose?: string;
    constraints?: string[];
    assumptions?: string[];
    knowledge?: string[];
  }
  export interface ChatTask {
    instruction: string;
    steps?: string[];
    deliverables?: string[];
    criteria?: string[];
    antiPatterns?: string[];
    priority?: 'accuracy' | 'speed' | 'creativity' | 'thoroughness';
  }
  export interface ChatOutput {
    format?: ResponseFormat;
    length?: OutputLength;
    style?: OutputStyle;
    language?: string;
    includeExplanation?: boolean;
    includeExamples?: boolean;
    includeSources?: boolean;
    includeConfidence?: boolean;
  }
  export interface ChatReasoning {
    style?: ReasoningStyle;
    showWork?: boolean;
    verifyAnswer?: boolean;
    considerAlternatives?: boolean;
    explainAssumptions?: boolean;
  }
  export interface ChatExample {
    input: string;
    output: string;
    explanation?: string;
  }
  export interface ChatMemory {
    summary?: string;
    facts?: string[];
    preferences?: string[];
    history?: ChatMessage[];
  }
  export interface BuiltChatPrompt {
    messages: ChatMessage[];
    systemPrompt: string;
    userPrompt?: string;
    metadata: {
    persona?: ChatPersona;
    context?: ChatContext;
    task?: ChatTask;
    output?: ChatOutput;
    reasoning?: ChatReasoning;
    examples?: ChatExample[];
  };
  }
  export class ChatPromptBuilder {
    system(content: string): this;
    user(content: string, name?: string): this;
    assistant(content: string): this;
    message(role: MessageRole, content: string, name?: string): this;
    messages(messages: ChatMessage[]): this;
    conversation(turns: Array<{ user: string; assistant?: string }>): this;
    persona(settings: ChatPersona | string): this;
    role(role: string): this;
    tone(tone: PersonaTone | PersonaTone[]): this;
    expertise(expertise: PersonaExpertise | PersonaExpertise[]): this;
    personality(traits: string[]): this;
    background(background: string): this;
    speakAs(name: string): this;
    responseLanguage(language: string): this;
    context(settings: ChatContext | string): this;
    domain(domain: string): this;
    audience(audience: string): this;
    purpose(purpose: string): this;
    constraints(constraints: string[]): this;
    constraint(constraint: string): this;
    assumptions(assumptions: string[]): this;
    knowledge(facts: string[]): this;
    task(instruction: string | ChatTask): this;
    instruction(instruction: string): this;
    steps(steps: string[]): this;
    deliverables(deliverables: string[]): this;
    criteria(criteria: string[]): this;
    avoid(antiPatterns: string[]): this;
    priority(priority: ChatTask['priority']): this;
    example(input: string, output: string, explanation?: string): this;
    examples(examples: ChatExample[]): this;
    fewShot(examples: Array<{ input: string; output: string }>): this;
    output(settings: ChatOutput): this;
    outputFormat(format: ResponseFormatType): this;
    json(schema?: JsonSchema): this;
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
    reasoning(settings: ChatReasoning): this;
    reasoningStyle(style: ReasoningStyle): this;
    stepByStep(): this;
    chainOfThought(): this;
    treeOfThought(): this;
    firstPrinciples(): this;
    devilsAdvocate(): this;
    showWork(show?: any): this;
    verifyAnswer(verify?: any): this;
    considerAlternatives(consider?: any): this;
    explainAssumptions(explain?: any): this;
    memory(memory: ChatMemory): this;
    remember(facts: string[]): this;
    preferences(prefs: string[]): this;
    history(messages: ChatMessage[]): this;
    summarizeHistory(summary: string): this;
    addSystemPart(part: string): this;
    raw(content: string): this;
    build(): BuiltChatPrompt;
    toString(): string;
    toSystemPrompt(): string;
    toMessages(): ChatMessage[];
    toJSON(): string;
    toYAML(): string;
    toMarkdown(): string;
  }
  export function chat(): ChatPromptBuilder;

  // AUDIO BUILDER TYPES
  export type MusicGenre = | 'pop' | 'rock' | 'jazz' | 'classical' | 'electronic' | 'hip-hop' | 'r&b'
  | 'country' | 'folk' | 'blues' | 'metal' | 'punk' | 'indie' | 'alternative'
  | 'ambient' | 'lo-fi' | 'synthwave' | 'orchestral' | 'cinematic' | 'world'
  | 'latin' | 'reggae' | 'soul' | 'funk' | 'disco' | 'house' | 'techno' | 'edm'
  | 'trap' | 'drill' | 'k-pop' | 'j-pop' | 'bossa-nova' | 'gospel' | 'grunge'
  | 'shoegaze' | 'post-rock' | 'prog-rock' | 'psychedelic' | 'chillwave'
  | 'vaporwave' | 'drum-and-bass' | 'dubstep' | 'trance' | 'hardcore';
  export type Instrument = | 'piano' | 'guitar' | 'acoustic-guitar' | 'electric-guitar' | 'bass' | 'drums'
  | 'violin' | 'cello' | 'viola' | 'flute' | 'saxophone' | 'trumpet' | 'trombone'
  | 'synthesizer' | 'organ' | 'harp' | 'percussion' | 'strings' | 'brass' | 'woodwinds'
  | 'choir' | 'vocals' | 'beatbox' | 'turntables' | 'harmonica' | 'banjo' | 'ukulele'
  | 'mandolin' | 'accordion' | 'marimba' | 'vibraphone' | 'xylophone' | 'timpani'
  | 'congas' | 'bongos' | 'djembe' | 'tabla' | 'sitar' | 'erhu' | 'koto'
  | '808' | '909' | 'moog' | 'rhodes' | 'wurlitzer' | 'mellotron' | 'theremin';
  export type VocalStyle = | 'male' | 'female' | 'duet' | 'choir' | 'a-cappella' | 'spoken-word' | 'rap'
  | 'falsetto' | 'belting' | 'whisper' | 'growl' | 'melodic' | 'harmonized'
  | 'auto-tuned' | 'operatic' | 'soul' | 'breathy' | 'nasal' | 'raspy' | 'clear';
  export type VocalLanguage = | 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'portuguese'
  | 'japanese' | 'korean' | 'chinese' | 'arabic' | 'hindi' | 'russian' | 'turkish'
  | 'instrumental';
  export type TempoMarking = | 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'vivace' | 'presto';
  export type TimeSignature = '4/4' | '3/4' | '6/8' | '2/4' | '5/4' | '7/8' | '12/8';
  export type MusicalKey = | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' 
  | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'
  | 'Cm' | 'C#m' | 'Dm' | 'D#m' | 'Ebm' | 'Em' | 'Fm' | 'F#m' 
  | 'Gm' | 'G#m' | 'Am' | 'A#m' | 'Bbm' | 'Bm';
  export type SongSection = | 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'breakdown'
  | 'drop' | 'build-up' | 'outro' | 'solo' | 'interlude' | 'hook';
  export type ProductionStyle = | 'lo-fi' | 'hi-fi' | 'vintage' | 'modern' | 'polished' | 'raw' | 'organic'
  | 'synthetic' | 'acoustic' | 'electric' | 'hybrid' | 'minimalist' | 'maximalist'
  | 'layered' | 'sparse' | 'dense' | 'atmospheric' | 'punchy' | 'warm' | 'bright';
  export type Era = | '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s'
  | 'retro' | 'vintage' | 'classic' | 'modern' | 'futuristic';
  export interface AudioGenre {
    primary: MusicGenre;
    secondary?: MusicGenre[];
    subgenre?: string;
    fusion?: string[];
  }
  export interface AudioMood {
    primary: Mood | string;
    secondary?: (Mood | string)[];
    energy?: 'low' | 'medium' | 'high' | 'building' | 'fluctuating';
    emotion?: string;
  }
  export interface AudioTempo {
    bpm?: number;
    marking?: TempoMarking;
    feel?: 'steady' | 'swung' | 'shuffled' | 'syncopated' | 'rubato' | 'driving';
    variation?: boolean;
  }
  export interface AudioVocals {
    style?: VocalStyle | VocalStyle[];
    language?: VocalLanguage;
    lyrics?: string;
    theme?: string;
    delivery?: string;
    harmonies?: boolean;
    adlibs?: boolean;
  }
  export interface AudioInstrumentation {
    lead?: Instrument | Instrument[];
    rhythm?: Instrument | Instrument[];
    bass?: Instrument;
    percussion?: Instrument | Instrument[];
    pads?: Instrument | Instrument[];
    effects?: string[];
    featured?: Instrument;
  }
  export interface AudioStructure {
    sections?: Array<{
    type: SongSection;
    bars?: number;
    description?: string;
  }>;
    intro?: number;
    verse?: number;
    chorus?: number;
    bridge?: number;
    outro?: number;
    form?: string;
    duration?: number;
  }
  export interface AudioProduction {
    style?: ProductionStyle | ProductionStyle[];
    era?: Era;
    reference?: string[];
    mix?: string;
    mastering?: string;
    effects?: string[];
    texture?: string;
  }
  export interface AudioTechnical {
    key?: MusicalKey;
    timeSignature?: TimeSignature;
    duration?: number;
    format?: 'song' | 'instrumental' | 'jingle' | 'loop' | 'soundtrack';
  }
  export interface BuiltAudioPrompt {
    prompt: string;
    stylePrompt: string;
    lyricsPrompt?: string;
    structure: {
    genre?: AudioGenre;
    mood?: AudioMood;
    tempo?: AudioTempo;
    vocals?: AudioVocals;
    instrumentation?: AudioInstrumentation;
    structure?: AudioStructure;
    production?: AudioProduction;
    technical?: AudioTechnical;
    tags?: string[];
  };
  }
  export class AudioPromptBuilder {
    genre(primary: MusicGenre | AudioGenre): this;
    subgenre(subgenre: string): this;
    fusion(genres: MusicGenre[]): this;
    mood(primary: Mood | string, ...secondary: (Mood | string)[]): this;
    energy(level: AudioMood['energy']): this;
    emotion(emotion: string): this;
    tempo(bpmOrSettings: number | AudioTempo): this;
    bpm(bpm: number): this;
    tempoMarking(marking: TempoMarking): this;
    tempoFeel(feel: AudioTempo['feel']): this;
    vocals(settings: AudioVocals): this;
    vocalStyle(style: VocalStyle | VocalStyle[]): this;
    language(language: VocalLanguage): this;
    lyrics(lyrics: string): this;
    lyricsTheme(theme: string): this;
    delivery(delivery: string): this;
    instrumental(): this;
    instruments(instruments: Instrument[]): this;
    instrumentation(settings: AudioInstrumentation): this;
    leadInstrument(instrument: Instrument | Instrument[]): this;
    rhythmSection(instruments: Instrument[]): this;
    bassInstrument(instrument: Instrument): this;
    percussion(instruments: Instrument | Instrument[]): this;
    pads(instruments: Instrument | Instrument[]): this;
    featuredInstrument(instrument: Instrument): this;
    structure(settings: AudioStructure | { [key in SongSection]?: number }): this;
    section(type: SongSection, bars?: number, description?: string): this;
    form(form: string): this;
    duration(seconds: number): this;
    production(settings: AudioProduction): this;
    productionStyle(style: ProductionStyle | ProductionStyle[]): this;
    era(era: Era): this;
    reference(artists: string[]): this;
    texture(texture: string): this;
    effects(effects: string[]): this;
    technical(settings: AudioTechnical): this;
    key(key: MusicalKey): this;
    timeSignature(sig: TimeSignature): this;
    formatType(format: AudioTechnical['format']): this;
    tag(tag: string): this;
    tags(tags: string[]): this;
    custom(text: string): this;
    build(): BuiltAudioPrompt;
    toString(): string;
    toStyleString(): string;
    toJSON(): string;
    toYAML(): string;
    toMarkdown(): string;
    outputFormat(fmt: OutputFormat): string;
  }
  export function audio(): AudioPromptBuilder;

  // VIDEO BUILDER TYPES
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
    shot?: ShotType;
    angle?: CameraAngle;
    brand?: CameraBrand;
    model?: CameraModel;
    sensor?: SensorFormat;
    lens?: LensType;
    lensModel?: LensModel;
    lensBrand?: LensBrand;
    focalLength?: string;
    anamorphic?: boolean;
    anamorphicRatio?: '1.33x' | '1.5x' | '1.8x' | '2x';
    focus?: 'shallow' | 'deep' | 'rack-focus' | 'pull-focus' | 'split-diopter';
    aperture?: string;
    bokeh?: BokehStyle;
    movement?: CameraMovement;
    movementSpeed?: 'slow' | 'medium' | 'fast';
    movementDirection?: 'left' | 'right' | 'forward' | 'backward' | 'up' | 'down' | 'arc-left' | 'arc-right';
    rig?: CameraRig;
    gimbal?: GimbalModel;
    platform?: 'handheld' | 'steadicam' | 'tripod' | 'drone' | 'crane' | 'gimbal' | 'slider' | 'dolly' | 'technocrane' | 'russian-arm' | 'fpv-drone';
    shutterAngle?: number;
    frameRate?: 24 | 25 | 30 | 48 | 60 | 120 | 240;
    slowMotion?: boolean;
    filter?: FilterType | FilterType[];
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
  export class VideoPromptBuilder {
    scene(description: string | VideoScene): this;
    setting(setting: string): this;
    subject(main: string | VideoSubject): this;
    appearance(appearance: string): this;
    clothing(clothing: string): this;
    camera(settings: VideoCamera): this;
    shot(shot: ShotType): this;
    angle(angle: CameraAngle): this;
    movement(movement: CameraMovement): this;
    lens(lens: LensType): this;
    platform(platform: VideoCamera['platform']): this;
    cameraSpeed(speed: VideoCamera['movementSpeed']): this;
    movementDirection(direction: VideoCamera['movementDirection']): this;
    rig(rig: CameraRig): this;
    gimbal(gimbal: GimbalModel): this;
    cameraBrand(brand: CameraBrand): this;
    cameraModel(model: CameraModel): this;
    sensor(sensor: SensorFormat): this;
    lensModel(model: LensModel): this;
    lensBrand(brand: LensBrand): this;
    focalLength(length: string): this;
    anamorphic(ratio?: VideoCamera['anamorphicRatio']): this;
    aperture(aperture: string): this;
    frameRate(fps: VideoCamera['frameRate']): this;
    slowMotion(enabled?: any): this;
    shutterAngle(angle: number): this;
    filter(filter: FilterType | FilterType[]): this;
    filmStock(stock: FilmStock): this;
    filmGrain(grain: VideoCamera['filmGrain']): this;
    halation(enabled?: any): this;
    lighting(settings: VideoLighting): this;
    lightingType(type: LightingType | LightingType[]): this;
    timeOfDay(time: TimeOfDay): this;
    weather(weather: WeatherLighting): this;
    action(action: string, options?: Partial<Omit<VideoAction, 'action'>>): this;
    actions(actions: string[]): this;
    motion(settings: VideoMotion): this;
    motionBeats(beats: string[]): this;
    style(settings: VideoStyle): this;
    format(format: string): this;
    era(era: string): this;
    styleFilmStock(stock: string): this;
    look(look: ArtStyle | ArtStyle[]): this;
    reference(references: string[]): this;
    color(settings: VideoColor): this;
    palette(palette: ColorPalette | ColorPalette[]): this;
    colorAnchors(anchors: string[]): this;
    colorGrade(grade: string): this;
    audio(settings: VideoAudio): this;
    dialogue(dialogue: string): this;
    ambient(ambient: string): this;
    diegetic(sounds: string[]): this;
    soundEffects(effects: string[]): this;
    music(music: string): this;
    technical(settings: VideoTechnical): this;
    duration(seconds: number): this;
    resolution(res: VideoTechnical['resolution']): this;
    fps(fps: VideoTechnical['fps']): this;
    aspectRatio(ratio: VideoTechnical['aspectRatio']): this;
    addShot(shot: VideoShot): this;
    shotList(shots: VideoShot[]): this;
    mood(mood: Mood | Mood[]): this;
    pacing(pacing: VideoPacing): this;
    transition(transition: VideoTransition): this;
    transitions(transitions: VideoTransition[]): this;
    custom(text: string): this;
    build(): BuiltVideoPrompt;
    toString(): string;
    toJSON(): string;
    toYAML(): string;
    toMarkdown(): string;
    outputFormat(fmt: OutputFormat): string;
  }
  export function video(): VideoPromptBuilder;

  // IMAGE BUILDER TYPES
  export type OutputFormat = 'text' | 'json' | 'yaml' | 'markdown';
  export type CameraBrand = | 'sony' | 'canon' | 'nikon' | 'fujifilm' | 'leica' | 'hasselblad' | 'phase-one'
  | 'panasonic' | 'olympus' | 'pentax' | 'red' | 'arri' | 'blackmagic' | 'panavision';
  export type CameraModel = | 'sony-a7iv' | 'sony-a7riv' | 'sony-a7siii' | 'sony-a1' | 'sony-fx3' | 'sony-fx6'
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
  export type SensorFormat = | 'full-frame' | 'aps-c' | 'micro-four-thirds' | 'medium-format' | 'large-format'
  | 'super-35' | 'vista-vision' | 'imax' | '65mm' | '35mm-film' | '16mm-film' | '8mm-film';
  export type FilmFormat = | '35mm' | '120-medium-format' | '4x5-large-format' | '8x10-large-format'
  | '110-film' | 'instant-film' | 'super-8' | '16mm' | '65mm-imax';
  export type CameraAngle = | 'eye-level' | 'low-angle' | 'high-angle' | 'dutch-angle' | 'birds-eye' 
  | 'worms-eye' | 'over-the-shoulder' | 'point-of-view' | 'aerial' | 'drone'
  | 'canted' | 'oblique' | 'hip-level' | 'knee-level' | 'ground-level';
  export type ShotType = | 'extreme-close-up' | 'close-up' | 'medium-close-up' | 'medium' | 'medium-wide'
  | 'wide' | 'extreme-wide' | 'establishing' | 'full-body' | 'portrait' | 'headshot';
  export type LensType = | 'wide-angle' | 'ultra-wide' | 'standard' | 'telephoto' | 'macro' | 'fisheye'
  | '14mm' | '24mm' | '35mm' | '50mm' | '85mm' | '100mm' | '135mm' | '200mm' | '400mm'
  | '600mm' | '800mm' | 'tilt-shift' | 'anamorphic' | 'spherical' | 'prime' | 'zoom';
  export type LensBrand = | 'zeiss' | 'leica' | 'canon' | 'nikon' | 'sony' | 'sigma' | 'tamron' | 'voigtlander'
  | 'fujifilm' | 'samyang' | 'rokinon' | 'tokina' | 'cooke' | 'arri' | 'panavision'
  | 'angenieux' | 'red' | 'atlas' | 'sirui';
  export type LensModel = | 'zeiss-otus-55' | 'zeiss-batis-85' | 'zeiss-milvus-35' | 'zeiss-supreme-prime'
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
  export type FocusType = | 'shallow' | 'deep' | 'soft-focus' | 'tilt-shift' | 'rack-focus' | 'split-diopter'
  | 'zone-focus' | 'hyperfocal' | 'selective' | 'bokeh-heavy' | 'tack-sharp';
  export type BokehStyle = | 'smooth' | 'creamy' | 'swirly' | 'busy' | 'soap-bubble' | 'cat-eye' | 'oval-anamorphic';
  export type FilterType = | 'uv' | 'polarizer' | 'nd' | 'nd-graduated' | 'black-pro-mist' | 'white-pro-mist'
  | 'glimmer-glass' | 'classic-soft' | 'streak' | 'starburst' | 'diffusion'
  | 'infrared' | 'color-gel' | 'warming' | 'cooling' | 'vintage-look';
  export type CameraMovement = | 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'pedestal' | 'zoom' 
  | 'handheld' | 'steadicam' | 'crane' | 'drone' | 'tracking' | 'arc' | 'whip-pan'
  | 'roll' | 'boom' | 'jib' | 'cable-cam' | 'motion-control' | 'snorricam'
  | 'dutch-roll' | 'vertigo-effect' | 'crash-zoom' | 'slow-push' | 'slow-pull';
  export type CameraRig = | 'tripod' | 'monopod' | 'gimbal' | 'steadicam' | 'easyrig' | 'shoulder-rig'
  | 'slider' | 'dolly' | 'jib' | 'crane' | 'technocrane' | 'russian-arm'
  | 'cable-cam' | 'drone' | 'fpv-drone' | 'motion-control' | 'handheld';
  export type GimbalModel = | 'dji-ronin-4d' | 'dji-ronin-rs3-pro' | 'dji-ronin-rs4' | 'moza-air-2'
  | 'zhiyun-crane-3s' | 'freefly-movi-pro' | 'tilta-gravity-g2x';
  export type LightingType = | 'natural' | 'studio' | 'dramatic' | 'soft' | 'hard' | 'diffused'
  | 'key' | 'fill' | 'rim' | 'backlit' | 'silhouette' | 'rembrandt'
  | 'split' | 'butterfly' | 'loop' | 'broad' | 'short' | 'chiaroscuro'
  | 'high-key' | 'low-key' | 'three-point' | 'practical' | 'motivated';
  export type TimeOfDay = | 'dawn' | 'sunrise' | 'golden-hour' | 'morning' | 'midday' | 'afternoon'
  | 'blue-hour' | 'sunset' | 'dusk' | 'twilight' | 'night' | 'midnight';
  export type WeatherLighting = | 'sunny' | 'cloudy' | 'overcast' | 'foggy' | 'misty' | 'rainy' 
  | 'stormy' | 'snowy' | 'hazy';
  export type ArtStyle = | 'photorealistic' | 'hyperrealistic' | 'cinematic' | 'documentary'
  | 'editorial' | 'fashion' | 'portrait' | 'landscape' | 'street'
  | 'fine-art' | 'conceptual' | 'surreal' | 'abstract' | 'minimalist'
  | 'maximalist' | 'vintage' | 'retro' | 'noir' | 'gothic' | 'romantic'
  | 'impressionist' | 'expressionist' | 'pop-art' | 'art-nouveau' | 'art-deco'
  | 'cyberpunk' | 'steampunk' | 'fantasy' | 'sci-fi' | 'anime' | 'manga'
  | 'comic-book' | 'illustration' | 'digital-art' | 'oil-painting' | 'watercolor'
  | 'sketch' | 'pencil-drawing' | 'charcoal' | 'pastel' | '3d-render';
  export type FilmStock = | 'kodak-portra-160' | 'kodak-portra-400' | 'kodak-portra-800' 
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
  export type AspectRatio = | '1:1' | '4:3' | '3:2' | '16:9' | '21:9' | '9:16' | '2:3' | '4:5' | '5:4';
  export type ColorPalette = | 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted' | 'pastel' | 'neon'
  | 'monochrome' | 'sepia' | 'desaturated' | 'high-contrast' | 'low-contrast'
  | 'earthy' | 'oceanic' | 'forest' | 'sunset' | 'midnight' | 'golden';
  export type Mood = | 'serene' | 'peaceful' | 'melancholic' | 'dramatic' | 'tense' | 'mysterious'
  | 'romantic' | 'nostalgic' | 'hopeful' | 'joyful' | 'energetic' | 'chaotic'
  | 'ethereal' | 'dark' | 'light' | 'whimsical' | 'eerie' | 'epic' | 'intimate';
  export type VideoTransition = | 'cut' | 'fade' | 'dissolve' | 'wipe' | 'morph' | 'match-cut' | 'jump-cut'
  | 'cross-dissolve' | 'iris' | 'push' | 'slide';
  export type VideoPacing = | 'slow' | 'medium' | 'fast' | 'variable' | 'building' | 'frenetic' | 'contemplative';
  export type Tempo = | 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'vivace' | 'presto'
  | number;
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
    angle?: CameraAngle;
    shot?: ShotType;
    brand?: CameraBrand;
    model?: CameraModel;
    sensor?: SensorFormat;
    lens?: LensType;
    lensModel?: LensModel;
    lensBrand?: LensBrand;
    focalLength?: string;
    focus?: FocusType;
    aperture?: string;
    bokeh?: BokehStyle;
    focusDistance?: string;
    iso?: number;
    shutterSpeed?: string;
    exposureCompensation?: string;
    filmStock?: FilmStock;
    filmFormat?: FilmFormat;
    filter?: FilterType | FilterType[];
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
    subject(main: string | ImageSubject): this;
    subjectDetails(details: string[]): this;
    expression(expression: string): this;
    pose(pose: string): this;
    action(action: string): this;
    clothing(clothing: string): this;
    accessories(accessories: string[]): this;
    subjectCount(count: ImageSubject['count']): this;
    camera(settings: ImageCamera): this;
    angle(angle: CameraAngle): this;
    shot(shot: ShotType): this;
    lens(lens: LensType): this;
    focus(focus: FocusType): this;
    aperture(aperture: string): this;
    filmStock(filmStock: FilmStock): this;
    filmFormat(format: FilmFormat): this;
    cameraBrand(brand: CameraBrand): this;
    cameraModel(model: CameraModel): this;
    sensor(sensor: SensorFormat): this;
    lensModel(model: LensModel): this;
    lensBrand(brand: LensBrand): this;
    focalLength(length: string): this;
    bokeh(style: BokehStyle): this;
    filter(filter: FilterType | FilterType[]): this;
    iso(iso: number): this;
    shutterSpeed(speed: string): this;
    whiteBalance(wb: ImageCamera['whiteBalance']): this;
    colorProfile(profile: string): this;
    lighting(settings: ImageLighting): this;
    lightingType(type: LightingType | LightingType[]): this;
    timeOfDay(time: TimeOfDay): this;
    weather(weather: WeatherLighting): this;
    lightDirection(direction: ImageLighting['direction']): this;
    lightIntensity(intensity: ImageLighting['intensity']): this;
    composition(settings: ImageComposition): this;
    ruleOfThirds(): this;
    goldenRatio(): this;
    symmetry(type: ImageComposition['symmetry']): this;
    foreground(fg: string): this;
    midground(mg: string): this;
    background(bg: string): this;
    environment(setting: string | ImageEnvironment): this;
    location(location: string): this;
    props(props: string[]): this;
    atmosphere(atmosphere: string): this;
    season(season: ImageEnvironment['season']): this;
    style(settings: ImageStyle): this;
    medium(medium: ArtStyle | ArtStyle[]): this;
    artist(artist: string | string[]): this;
    influence(influences: string[]): this;
    color(settings: ImageColor): this;
    palette(palette: ColorPalette | ColorPalette[]): this;
    primaryColors(colors: string[]): this;
    accentColors(colors: string[]): this;
    colorGrade(grade: string): this;
    technical(settings: ImageTechnical): this;
    aspectRatio(ratio: AspectRatio): this;
    resolution(resolution: string): this;
    quality(quality: ImageTechnical['quality']): this;
    mood(mood: Mood | Mood[]): this;
    negative(items: string[]): this;
    custom(text: string): this;
    build(): BuiltImagePrompt;
    toString(): string;
    toJSON(): string;
    toYAML(): string;
    toMarkdown(): string;
    format(fmt: OutputFormat): string;
  }
  export function image(): ImagePromptBuilder;

  // TEMPLATES - Pre-built prompt templates
  export const templates: {
    codeReview: (options?: { language?: string; focus?: string[] }) => PromptBuilder;
    translation: (from: string, to: string) => PromptBuilder;
    summarize: (options?: { maxLength?: number; style?: 'bullet' | 'paragraph' }) => PromptBuilder;
    qa: (context?: string) => PromptBuilder;
    debug: (options?: { language?: string; errorType?: string }) => PromptBuilder;
    write: (options?: { type?: 'blog' | 'email' | 'essay' | 'story' | 'documentation'; tone?: string }) => PromptBuilder;
    explain: (options?: { level?: 'beginner' | 'intermediate' | 'expert'; useAnalogies?: boolean }) => PromptBuilder;
    extract: (options?: { format?: 'json' | 'csv' | 'table'; fields?: string[] }) => PromptBuilder;
    brainstorm: (options?: { count?: number; creative?: boolean }) => PromptBuilder;
    refactor: (options?: { goal?: 'readability' | 'performance' | 'maintainability' | 'all'; language?: string }) => PromptBuilder;
    apiDocs: (options?: { style?: 'openapi' | 'markdown' | 'jsdoc'; includeExamples?: boolean }) => PromptBuilder;
    unitTest: (options?: { framework?: string; coverage?: 'basic' | 'comprehensive' }) => PromptBuilder;
    commitMessage: (options?: { style?: 'conventional' | 'simple'; includeBody?: boolean }) => PromptBuilder;
    reviewComment: (options?: { tone?: 'constructive' | 'direct'; severity?: boolean }) => PromptBuilder;
    regex: (options?: { flavor?: 'javascript' | 'python' | 'pcre' }) => PromptBuilder;
    sql: (options?: { dialect?: 'postgresql' | 'mysql' | 'sqlite' | 'mssql'; optimize?: boolean }) => PromptBuilder;
  };

  // UTILITY MODULES
  export namespace variables {
    export function detectVariables(text: string): DetectedVariable[];
    export function convertToSupportedFormat(variable: DetectedVariable): string;
    export function convertAllVariables(text: string): string;
    export function getPatternDescription(pattern: VariablePattern): string;
    export function extractVariables(text: string): Array<{ name: string; defaultValue?: string }>;
    export function compile(template: string, values: Record<string, string>, options?: { useDefaults?: boolean }): string;
  }
  export namespace similarity {
    export function normalizeContent(content: string): string;
    export function calculateSimilarity(content1: string, content2: string): number;
    export function isSimilarContent(content1: string, content2: string, threshold?: number): boolean;
    export function getContentFingerprint(content: string): string;
    export function findDuplicates(prompts: T[], threshold?: number): T[][];
    export function deduplicate(prompts: T[], threshold?: number): T[];
  }
  export namespace quality {
    export function check(prompt: string): QualityResult;
    export function validate(prompt: string): void;
    export function isValid(prompt: string): boolean;
    export function getSuggestions(prompt: string): string[];
  }
  export namespace parser {
    export function parse(content: string, format?: 'yaml' | 'json' | 'markdown' | 'text'): ParsedPrompt;
    export function toYaml(prompt: ParsedPrompt): string;
    export function toJson(prompt: ParsedPrompt, pretty?: boolean): string;
    export function getSystemPrompt(prompt: ParsedPrompt): string;
    export function interpolate(prompt: ParsedPrompt, values: Record<string, string>): ParsedPrompt;
  }
}
`;
