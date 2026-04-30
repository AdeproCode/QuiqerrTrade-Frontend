import { create } from 'zustand';
import { Howl } from 'howler';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage?: string | undefined; // Explicitly allow undefined
  type: 'track' | 'remix';
}

export interface AudioState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  sound: Howl | null;
  queue: AudioTrack[];
  setTrack: (track: AudioTrack | null) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: AudioTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  sound: null,
  queue: [],

  setTrack: (track) => {
    const { sound } = get();
    if (sound) {
      sound.stop();
      sound.unload();
    }

    if (!track) {
      set({ currentTrack: null, sound: null, isPlaying: false });
      return;
    }

    const newSound = new Howl({
      src: [track.audioUrl],
      html5: true,
      volume: get().volume,
      onplay: () => set({ isPlaying: true }),
      onpause: () => set({ isPlaying: false }),
      onstop: () => set({ isPlaying: false, progress: 0 }),
      onend: () => get().playNext(),
      onload: () => set({ duration: newSound.duration() }),
      onseek: () => {
        const soundRef = get().sound;
        if (soundRef) {
          const seek = soundRef.seek();
          const duration = soundRef.duration();
          if (typeof seek === 'number' && typeof duration === 'number') {
            set({ progress: seek / duration });
          }
        }
      },
    });

    set({ currentTrack: track, sound: newSound, progress: 0 });
    newSound.play();
  },

  play: () => {
    const { sound } = get();
    if (sound) sound.play();
  },

  pause: () => {
    const { sound } = get();
    if (sound) sound.pause();
  },

  toggle: () => {
    const { isPlaying, play, pause } = get();
    isPlaying ? pause() : play();
  },

  seek: (position) => {
    const { sound, duration } = get();
    if (sound && duration) {
      const seekPosition = position * duration;
      sound.seek(seekPosition);
      set({ progress: position });
    }
  },

  setVolume: (volume) => {
    const { sound } = get();
    if (sound) sound.volume(volume);
    set({ volume });
  },

  addToQueue: (track) => {
    set((state) => ({ queue: [...state.queue, track] }));
  },

  removeFromQueue: (index) => {
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
    }));
  },

  clearQueue: () => set({ queue: [] }),

  playNext: () => {
    const { queue, setTrack } = get();
    if (queue.length > 0) {
      const nextTrack = queue[0];
      if (nextTrack) {
        set((state) => ({ queue: state.queue.slice(1) }));
        setTrack(nextTrack);
      }
    }
  },

  playPrevious: () => {
    // Implementation for previous track would require history tracking
    // For now, just restart current track
    const { sound } = get();
    if (sound) {
      sound.seek(0);
      sound.play();
    }
  },
}));