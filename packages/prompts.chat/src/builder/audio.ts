/**
 * Audio/Music Prompt Builder - Comprehensive music generation prompt builder
 * 
 * Based on Suno, Udio, and other music generation best practices.
 * 
 * @example
 * ```ts
 * import { audio } from 'prompts.chat/builder';
 * 
 * const prompt = audio()
 *   .genre("synthwave")
 *   .mood("nostalgic", "dreamy")
 *   .tempo(110)
 *   .instruments(["synthesizer", "drums", "bass"])
 *   .structure({ intro: 8, verse: 16, chorus: 16 })
 *   .build();
 * ```
 */

import type { Mood, OutputFormat } from './media';

// ============================================================================
// AUDIO-SPECIFIC TYPES
// ============================================================================

export type MusicGenre = 
  | 'pop' | 'rock' | 'jazz' | 'classical' | 'electronic' | 'hip-hop' | 'r&b'
  | 'country' | 'folk' | 'blues' | 'metal' | 'punk' | 'indie' | 'alternative'
  | 'ambient' | 'lo-fi' | 'synthwave' | 'orchestral' | 'cinematic' | 'world'
  | 'latin' | 'reggae' | 'soul' | 'funk' | 'disco' | 'house' | 'techno' | 'edm'
  | 'trap' | 'drill' | 'k-pop' | 'j-pop' | 'bossa-nova' | 'gospel' | 'grunge'
  | 'shoegaze' | 'post-rock' | 'prog-rock' | 'psychedelic' | 'chillwave'
  | 'vaporwave' | 'drum-and-bass' | 'dubstep' | 'trance' | 'hardcore';

export type Instrument = 
  | 'piano' | 'guitar' | 'acoustic-guitar' | 'electric-guitar' | 'bass' | 'drums'
  | 'violin' | 'cello' | 'viola' | 'flute' | 'saxophone' | 'trumpet' | 'trombone'
  | 'synthesizer' | 'organ' | 'harp' | 'percussion' | 'strings' | 'brass' | 'woodwinds'
  | 'choir' | 'vocals' | 'beatbox' | 'turntables' | 'harmonica' | 'banjo' | 'ukulele'
  | 'mandolin' | 'accordion' | 'marimba' | 'vibraphone' | 'xylophone' | 'timpani'
  | 'congas' | 'bongos' | 'djembe' | 'tabla' | 'sitar' | 'erhu' | 'koto'
  | '808' | '909' | 'moog' | 'rhodes' | 'wurlitzer' | 'mellotron' | 'theremin';

export type VocalStyle = 
  | 'male' | 'female' | 'duet' | 'choir' | 'a-cappella' | 'spoken-word' | 'rap'
  | 'falsetto' | 'belting' | 'whisper' | 'growl' | 'melodic' | 'harmonized'
  | 'auto-tuned' | 'operatic' | 'soul' | 'breathy' | 'nasal' | 'raspy' | 'clear';

export type VocalLanguage =
  | 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'portuguese'
  | 'japanese' | 'korean' | 'chinese' | 'arabic' | 'hindi' | 'russian' | 'turkish'
  | 'instrumental';

export type TempoMarking = 
  | 'largo' | 'adagio' | 'andante' | 'moderato' | 'allegro' | 'vivace' | 'presto';

export type TimeSignature = '4/4' | '3/4' | '6/8' | '2/4' | '5/4' | '7/8' | '12/8';

export type MusicalKey = 
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' 
  | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'
  | 'Cm' | 'C#m' | 'Dm' | 'D#m' | 'Ebm' | 'Em' | 'Fm' | 'F#m' 
  | 'Gm' | 'G#m' | 'Am' | 'A#m' | 'Bbm' | 'Bm';

export type SongSection = 
  | 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'breakdown'
  | 'drop' | 'build-up' | 'outro' | 'solo' | 'interlude' | 'hook';

export type ProductionStyle =
  | 'lo-fi' | 'hi-fi' | 'vintage' | 'modern' | 'polished' | 'raw' | 'organic'
  | 'synthetic' | 'acoustic' | 'electric' | 'hybrid' | 'minimalist' | 'maximalist'
  | 'layered' | 'sparse' | 'dense' | 'atmospheric' | 'punchy' | 'warm' | 'bright';

export type Era =
  | '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s'
  | 'retro' | 'vintage' | 'classic' | 'modern' | 'futuristic';

// ============================================================================
// AUDIO INTERFACES
// ============================================================================

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

// ============================================================================
// AUDIO PROMPT BUILDER
// ============================================================================

export class AudioPromptBuilder {
  private _genre?: AudioGenre;
  private _mood?: AudioMood;
  private _tempo?: AudioTempo;
  private _vocals?: AudioVocals;
  private _instrumentation?: AudioInstrumentation;
  private _structure?: AudioStructure;
  private _production?: AudioProduction;
  private _technical?: AudioTechnical;
  private _tags: string[] = [];
  private _custom: string[] = [];

  // --- Genre Methods ---

  genre(primary: MusicGenre | AudioGenre): this {
    if (typeof primary === 'string') {
      this._genre = { ...(this._genre || { primary: 'pop' }), primary };
    } else {
      this._genre = { ...(this._genre || { primary: 'pop' }), ...primary };
    }
    return this;
  }

  subgenre(subgenre: string): this {
    this._genre = { ...(this._genre || { primary: 'pop' }), subgenre };
    return this;
  }

  fusion(genres: MusicGenre[]): this {
    this._genre = { 
      ...(this._genre || { primary: 'pop' }), 
      secondary: genres,
      fusion: genres as string[],
    };
    return this;
  }

  // --- Mood Methods ---

  mood(primary: Mood | string, ...secondary: (Mood | string)[]): this {
    this._mood = { 
      primary, 
      secondary: secondary.length ? secondary : undefined,
    };
    return this;
  }

  energy(level: AudioMood['energy']): this {
    this._mood = { ...(this._mood || { primary: 'energetic' }), energy: level };
    return this;
  }

  emotion(emotion: string): this {
    this._mood = { ...(this._mood || { primary: 'emotional' }), emotion };
    return this;
  }

  // --- Tempo Methods ---

  tempo(bpmOrSettings: number | AudioTempo): this {
    if (typeof bpmOrSettings === 'number') {
      this._tempo = { ...(this._tempo || {}), bpm: bpmOrSettings };
    } else {
      this._tempo = { ...(this._tempo || {}), ...bpmOrSettings };
    }
    return this;
  }

  bpm(bpm: number): this {
    this._tempo = { ...(this._tempo || {}), bpm };
    return this;
  }

  tempoMarking(marking: TempoMarking): this {
    this._tempo = { ...(this._tempo || {}), marking };
    return this;
  }

  tempoFeel(feel: AudioTempo['feel']): this {
    this._tempo = { ...(this._tempo || {}), feel };
    return this;
  }

  // --- Vocal Methods ---

  vocals(settings: AudioVocals): this {
    this._vocals = { ...(this._vocals || {}), ...settings };
    return this;
  }

  vocalStyle(style: VocalStyle | VocalStyle[]): this {
    this._vocals = { ...(this._vocals || {}), style };
    return this;
  }

  language(language: VocalLanguage): this {
    this._vocals = { ...(this._vocals || {}), language };
    return this;
  }

  lyrics(lyrics: string): this {
    this._vocals = { ...(this._vocals || {}), lyrics };
    return this;
  }

  lyricsTheme(theme: string): this {
    this._vocals = { ...(this._vocals || {}), theme };
    return this;
  }

  delivery(delivery: string): this {
    this._vocals = { ...(this._vocals || {}), delivery };
    return this;
  }

  instrumental(): this {
    this._vocals = { ...(this._vocals || {}), language: 'instrumental' };
    return this;
  }

  // --- Instrumentation Methods ---

  instruments(instruments: Instrument[]): this {
    this._instrumentation = { 
      ...(this._instrumentation || {}), 
      lead: instruments,
    };
    return this;
  }

  instrumentation(settings: AudioInstrumentation): this {
    this._instrumentation = { ...(this._instrumentation || {}), ...settings };
    return this;
  }

  leadInstrument(instrument: Instrument | Instrument[]): this {
    this._instrumentation = { ...(this._instrumentation || {}), lead: instrument };
    return this;
  }

  rhythmSection(instruments: Instrument[]): this {
    this._instrumentation = { ...(this._instrumentation || {}), rhythm: instruments };
    return this;
  }

  bassInstrument(instrument: Instrument): this {
    this._instrumentation = { ...(this._instrumentation || {}), bass: instrument };
    return this;
  }

  percussion(instruments: Instrument | Instrument[]): this {
    this._instrumentation = { ...(this._instrumentation || {}), percussion: instruments };
    return this;
  }

  pads(instruments: Instrument | Instrument[]): this {
    this._instrumentation = { ...(this._instrumentation || {}), pads: instruments };
    return this;
  }

  featuredInstrument(instrument: Instrument): this {
    this._instrumentation = { ...(this._instrumentation || {}), featured: instrument };
    return this;
  }

  // --- Structure Methods ---

  structure(settings: AudioStructure | { [key in SongSection]?: number }): this {
    if ('sections' in settings || 'form' in settings || 'duration' in settings) {
      this._structure = { ...(this._structure || {}), ...settings as AudioStructure };
    } else {
      // Convert shorthand to full structure
      const sections: AudioStructure['sections'] = [];
      for (const [type, bars] of Object.entries(settings)) {
        if (typeof bars === 'number') {
          sections.push({ type: type as SongSection, bars });
        }
      }
      this._structure = { ...(this._structure || {}), sections };
    }
    return this;
  }

  section(type: SongSection, bars?: number, description?: string): this {
    const sections = this._structure?.sections || [];
    sections.push({ type, bars, description });
    this._structure = { ...(this._structure || {}), sections };
    return this;
  }

  form(form: string): this {
    this._structure = { ...(this._structure || {}), form };
    return this;
  }

  duration(seconds: number): this {
    this._structure = { ...(this._structure || {}), duration: seconds };
    return this;
  }

  // --- Production Methods ---

  production(settings: AudioProduction): this {
    this._production = { ...(this._production || {}), ...settings };
    return this;
  }

  productionStyle(style: ProductionStyle | ProductionStyle[]): this {
    this._production = { ...(this._production || {}), style };
    return this;
  }

  era(era: Era): this {
    this._production = { ...(this._production || {}), era };
    return this;
  }

  reference(artists: string[]): this {
    this._production = { ...(this._production || {}), reference: artists };
    return this;
  }

  texture(texture: string): this {
    this._production = { ...(this._production || {}), texture };
    return this;
  }

  effects(effects: string[]): this {
    this._production = { ...(this._production || {}), effects };
    return this;
  }

  // --- Technical Methods ---

  technical(settings: AudioTechnical): this {
    this._technical = { ...(this._technical || {}), ...settings };
    return this;
  }

  key(key: MusicalKey): this {
    this._technical = { ...(this._technical || {}), key };
    return this;
  }

  timeSignature(sig: TimeSignature): this {
    this._technical = { ...(this._technical || {}), timeSignature: sig };
    return this;
  }

  formatType(format: AudioTechnical['format']): this {
    this._technical = { ...(this._technical || {}), format };
    return this;
  }

  // --- Tags & Custom ---

  tag(tag: string): this {
    this._tags.push(tag);
    return this;
  }

  tags(tags: string[]): this {
    this._tags = [...this._tags, ...tags];
    return this;
  }

  custom(text: string): this {
    this._custom.push(text);
    return this;
  }

  // --- Build Methods ---

  private buildStylePrompt(): string {
    const parts: string[] = [];

    // Genre
    if (this._genre) {
      let genreText: string = this._genre.primary;
      if (this._genre.subgenre) genreText = `${this._genre.subgenre} ${genreText}`;
      if (this._genre.secondary?.length) {
        genreText += ` with ${this._genre.secondary.join(' and ')} influences`;
      }
      parts.push(genreText);
    }

    // Mood
    if (this._mood) {
      let moodText = String(this._mood.primary);
      if (this._mood.secondary?.length) {
        moodText += `, ${this._mood.secondary.join(', ')}`;
      }
      if (this._mood.energy) moodText += `, ${this._mood.energy} energy`;
      parts.push(moodText);
    }

    // Tempo
    if (this._tempo) {
      const tempoParts: string[] = [];
      if (this._tempo.bpm) tempoParts.push(`${this._tempo.bpm} BPM`);
      if (this._tempo.marking) tempoParts.push(this._tempo.marking);
      if (this._tempo.feel) tempoParts.push(`${this._tempo.feel} feel`);
      if (tempoParts.length) parts.push(tempoParts.join(', '));
    }

    // Instrumentation
    if (this._instrumentation) {
      const instrParts: string[] = [];
      if (this._instrumentation.lead) {
        const leads = Array.isArray(this._instrumentation.lead) 
          ? this._instrumentation.lead : [this._instrumentation.lead];
        instrParts.push(leads.join(', '));
      }
      if (this._instrumentation.featured) {
        instrParts.push(`featuring ${this._instrumentation.featured}`);
      }
      if (instrParts.length) parts.push(instrParts.join(', '));
    }

    // Vocals
    if (this._vocals) {
      const vocalParts: string[] = [];
      if (this._vocals.language === 'instrumental') {
        vocalParts.push('instrumental');
      } else {
        if (this._vocals.style) {
          const styles = Array.isArray(this._vocals.style) 
            ? this._vocals.style : [this._vocals.style];
          vocalParts.push(`${styles.join(' and ')} vocals`);
        }
        if (this._vocals.language && this._vocals.language !== 'english') {
          vocalParts.push(`in ${this._vocals.language}`);
        }
      }
      if (vocalParts.length) parts.push(vocalParts.join(' '));
    }

    // Production
    if (this._production) {
      const prodParts: string[] = [];
      if (this._production.style) {
        const styles = Array.isArray(this._production.style) 
          ? this._production.style : [this._production.style];
        prodParts.push(`${styles.join(', ')} production`);
      }
      if (this._production.era) prodParts.push(`${this._production.era} sound`);
      if (this._production.texture) prodParts.push(this._production.texture);
      if (prodParts.length) parts.push(prodParts.join(', '));
    }

    // Technical
    if (this._technical) {
      const techParts: string[] = [];
      if (this._technical.key) techParts.push(`in the key of ${this._technical.key}`);
      if (this._technical.timeSignature && this._technical.timeSignature !== '4/4') {
        techParts.push(`${this._technical.timeSignature} time`);
      }
      if (techParts.length) parts.push(techParts.join(', '));
    }

    // Tags
    if (this._tags.length) {
      parts.push(this._tags.join(', '));
    }

    // Custom
    if (this._custom.length) {
      parts.push(this._custom.join(', '));
    }

    return parts.join(', ');
  }

  private buildLyricsPrompt(): string | undefined {
    if (!this._vocals?.lyrics && !this._vocals?.theme) return undefined;

    const parts: string[] = [];

    if (this._vocals.theme) {
      parts.push(`Theme: ${this._vocals.theme}`);
    }

    if (this._vocals.lyrics) {
      parts.push(this._vocals.lyrics);
    }

    return parts.join('\n\n');
  }

  private buildFullPrompt(): string {
    const sections: string[] = [];

    sections.push(`Style: ${this.buildStylePrompt()}`);

    if (this._structure?.sections?.length) {
      const structureText = this._structure.sections
        .map(s => `[${s.type.toUpperCase()}]${s.description ? ` ${s.description}` : ''}`)
        .join('\n');
      sections.push(`Structure:\n${structureText}`);
    }

    const lyrics = this.buildLyricsPrompt();
    if (lyrics) {
      sections.push(`Lyrics:\n${lyrics}`);
    }

    return sections.join('\n\n');
  }

  build(): BuiltAudioPrompt {
    return {
      prompt: this.buildFullPrompt(),
      stylePrompt: this.buildStylePrompt(),
      lyricsPrompt: this.buildLyricsPrompt(),
      structure: {
        genre: this._genre,
        mood: this._mood,
        tempo: this._tempo,
        vocals: this._vocals,
        instrumentation: this._instrumentation,
        structure: this._structure,
        production: this._production,
        technical: this._technical,
        tags: this._tags.length ? this._tags : undefined,
      },
    };
  }

  toString(): string {
    return this.build().prompt;
  }

  toStyleString(): string {
    return this.build().stylePrompt;
  }

  toJSON(): string {
    return JSON.stringify(this.build().structure, null, 2);
  }

  toYAML(): string {
    return objectToYaml(this.build().structure);
  }

  toMarkdown(): string {
    const built = this.build();
    const sections: string[] = ['# Audio Prompt\n'];
    
    sections.push('## Style Prompt\n```\n' + built.stylePrompt + '\n```\n');
    
    if (built.lyricsPrompt) {
      sections.push('## Lyrics\n```\n' + built.lyricsPrompt + '\n```\n');
    }
    
    if (built.structure.genre) {
      sections.push('## Genre\n' + objectToMarkdownList(built.structure.genre));
    }
    if (built.structure.mood) {
      sections.push('## Mood\n' + objectToMarkdownList(built.structure.mood));
    }
    if (built.structure.tempo) {
      sections.push('## Tempo\n' + objectToMarkdownList(built.structure.tempo));
    }
    if (built.structure.vocals) {
      sections.push('## Vocals\n' + objectToMarkdownList(built.structure.vocals));
    }
    if (built.structure.instrumentation) {
      sections.push('## Instrumentation\n' + objectToMarkdownList(built.structure.instrumentation));
    }
    if (built.structure.production) {
      sections.push('## Production\n' + objectToMarkdownList(built.structure.production));
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
 * Create a new audio/music prompt builder
 */
export function audio(): AudioPromptBuilder {
  return new AudioPromptBuilder();
}
