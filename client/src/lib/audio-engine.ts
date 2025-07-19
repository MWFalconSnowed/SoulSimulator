// SoulScript Audio Engine - Advanced sound management system
export interface AudioClip {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  category: 'sfx' | 'music' | 'ambient' | 'voice';
  fadeIn?: number;
  fadeOut?: number;
}

export interface AudioChannel {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  clips: Map<string, HTMLAudioElement>;
}

export class SoulScriptAudioEngine {
  private channels: Map<string, AudioChannel> = new Map();
  private masterVolume: number = 1.0;
  private isInitialized: boolean = false;
  private audioContext: AudioContext | null = null;
  private currentMusic: HTMLAudioElement | null = null;
  private ambientSounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.initializeDefaultChannels();
  }

  private initializeDefaultChannels() {
    // Create default audio channels
    this.channels.set('music', {
      id: 'music',
      name: 'Music',
      volume: 0.7,
      muted: false,
      clips: new Map()
    });

    this.channels.set('sfx', {
      id: 'sfx', 
      name: 'Sound Effects',
      volume: 0.8,
      muted: false,
      clips: new Map()
    });

    this.channels.set('ambient', {
      id: 'ambient',
      name: 'Ambient',
      volume: 0.5,
      muted: false,
      clips: new Map()
    });

    this.channels.set('voice', {
      id: 'voice',
      name: 'Voice',
      volume: 0.9,
      muted: false,
      clips: new Map()
    });
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.audioContext.resume();
      this.isInitialized = true;
      console.log('SoulScript Audio Engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
    }
  }

  // Load audio clip
  async loadAudio(clip: AudioClip): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();

    try {
      const audio = new Audio(clip.url);
      audio.volume = clip.volume;
      audio.loop = clip.loop;
      audio.preload = 'auto';

      return new Promise((resolve) => {
        audio.onloadeddata = () => {
          const channel = this.channels.get(clip.category);
          if (channel) {
            channel.clips.set(clip.id, audio);
          }
          resolve(true);
        };
        audio.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error(`Failed to load audio clip ${clip.id}:`, error);
      return false;
    }
  }

  // Play sound effect
  playSFX(clipId: string, volume: number = 1.0): void {
    const sfxChannel = this.channels.get('sfx');
    if (!sfxChannel || sfxChannel.muted) return;

    const clip = sfxChannel.clips.get(clipId);
    if (clip) {
      clip.volume = volume * sfxChannel.volume * this.masterVolume;
      clip.currentTime = 0;
      clip.play().catch(error => console.warn('Failed to play SFX:', error));
    }
  }

  // Play background music with crossfade
  async playMusic(clipId: string, fadeTime: number = 2.0): Promise<void> {
    const musicChannel = this.channels.get('music');
    if (!musicChannel || musicChannel.muted) return;

    const newMusic = musicChannel.clips.get(clipId);
    if (!newMusic) return;

    // Crossfade from current music
    if (this.currentMusic && this.currentMusic !== newMusic) {
      await this.crossfade(this.currentMusic, newMusic, fadeTime);
    } else {
      newMusic.volume = musicChannel.volume * this.masterVolume;
      await newMusic.play();
      this.currentMusic = newMusic;
    }
  }

  // Stop music with fade out
  async stopMusic(fadeTime: number = 1.0): Promise<void> {
    if (!this.currentMusic) return;

    await this.fadeOut(this.currentMusic, fadeTime);
    this.currentMusic.pause();
    this.currentMusic = null;
  }

  // Play ambient sound
  playAmbient(clipId: string, loop: boolean = true): void {
    const ambientChannel = this.channels.get('ambient');
    if (!ambientChannel || ambientChannel.muted) return;

    const clip = ambientChannel.clips.get(clipId);
    if (clip) {
      clip.loop = loop;
      clip.volume = ambientChannel.volume * this.masterVolume;
      clip.play().catch(error => console.warn('Failed to play ambient:', error));
      this.ambientSounds.set(clipId, clip);
    }
  }

  // Stop ambient sound
  stopAmbient(clipId: string): void {
    const ambient = this.ambientSounds.get(clipId);
    if (ambient) {
      ambient.pause();
      ambient.currentTime = 0;
      this.ambientSounds.delete(clipId);
    }
  }

  // Crossfade between two audio clips
  private async crossfade(from: HTMLAudioElement, to: HTMLAudioElement, duration: number): Promise<void> {
    const steps = 50;
    const stepTime = (duration * 1000) / steps;
    const volumeStep = from.volume / steps;

    // Start the new track at 0 volume
    to.volume = 0;
    await to.play();

    return new Promise((resolve) => {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        
        // Fade out old track
        from.volume = Math.max(0, from.volume - volumeStep);
        
        // Fade in new track
        to.volume = Math.min(this.channels.get('music')!.volume * this.masterVolume, 
                            (step / steps) * this.channels.get('music')!.volume * this.masterVolume);

        if (step >= steps) {
          clearInterval(interval);
          from.pause();
          from.currentTime = 0;
          this.currentMusic = to;
          resolve();
        }
      }, stepTime);
    });
  }

  // Fade out audio
  private async fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    const steps = 50;
    const stepTime = (duration * 1000) / steps;
    const volumeStep = audio.volume / steps;

    return new Promise((resolve) => {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        audio.volume = Math.max(0, audio.volume - volumeStep);

        if (step >= steps || audio.volume <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, stepTime);
    });
  }

  // Set channel volume
  setChannelVolume(channelId: string, volume: number): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.volume = Math.max(0, Math.min(1, volume));
      
      // Update all clips in this channel
      channel.clips.forEach(clip => {
        clip.volume = channel.volume * this.masterVolume;
      });
    }
  }

  // Mute/unmute channel
  muteChannel(channelId: string, muted: boolean): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.muted = muted;
      
      channel.clips.forEach(clip => {
        if (muted) {
          clip.volume = 0;
        } else {
          clip.volume = channel.volume * this.masterVolume;
        }
      });
    }
  }

  // Set master volume
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Update all channels
    this.channels.forEach(channel => {
      if (!channel.muted) {
        channel.clips.forEach(clip => {
          clip.volume = channel.volume * this.masterVolume;
        });
      }
    });
  }

  // Get channel info
  getChannels(): AudioChannel[] {
    return Array.from(this.channels.values());
  }

  // Cleanup
  dispose(): void {
    this.channels.forEach(channel => {
      channel.clips.forEach(clip => {
        clip.pause();
        clip.src = '';
      });
      channel.clips.clear();
    });
    
    this.ambientSounds.clear();
    this.currentMusic = null;
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
  }
}

// Global audio engine instance
export const audioEngine = new SoulScriptAudioEngine();

// Default audio clips for SoulScript
export const DEFAULT_AUDIO_CLIPS: AudioClip[] = [
  {
    id: 'mystic_ambient',
    name: 'Mystical Ambient',
    url: '/audio/mystic_ambient.mp3',
    volume: 0.6,
    loop: true,
    category: 'ambient'
  },
  {
    id: 'spell_cast',
    name: 'Spell Cast',
    url: '/audio/spell_cast.wav',
    volume: 0.8,
    loop: false,
    category: 'sfx'
  },
  {
    id: 'temple_music',
    name: 'Temple Music',
    url: '/audio/temple_music.mp3',
    volume: 0.7,
    loop: true,
    category: 'music',
    fadeIn: 2.0
  },
  {
    id: 'footsteps',
    name: 'Footsteps',
    url: '/audio/footsteps.wav',
    volume: 0.5,
    loop: false,
    category: 'sfx'
  },
  {
    id: 'magic_chime',
    name: 'Magic Chime',
    url: '/audio/magic_chime.wav',
    volume: 0.7,
    loop: false,
    category: 'sfx'
  }
];