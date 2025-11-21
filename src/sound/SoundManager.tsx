import { useEffect, useRef } from "react";
import { Howl } from "howler";

const soundFiles = {
  laser: "/sounds/laser.mp3",
  explosion: "/sounds/explosion.mp3",
  error: "/sounds/error.mp3",
  music: "/sounds/music.mp3",
};

// Tipos para mejor TypeScript support
type SoundName = keyof typeof soundFiles;

class SoundManagerClass {
  private sounds: { [key: string]: Howl } = {};
  private isMusicPlaying = false;
  private soundEnabled: boolean = true;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.7;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    Object.entries(soundFiles).forEach(([key, path]) => {
      try {
        this.sounds[key] = new Howl({
          src: [path],
          preload: true,
          volume: key === "music" ? this.musicVolume : this.sfxVolume,
          onloaderror: (id, error) => {
            console.warn(`Failed to load sound ${key}:`, error);
          },
          onplayerror: (id, error) => {
            console.warn(`Failed to play sound ${key}:`, error);
          },
        });
      } catch (error) {
        console.error(`Error creating sound ${key}:`, error);
      }
    });
  }

  play(soundName: SoundName) {
    if (!this.soundEnabled) return;

    const sound = this.sounds[soundName];
    if (sound && sound.state() === "loaded") {
      try {
        // Para sonidos rápidos como láser, no usar stop() para evitar corte
        if (soundName === "laser") {
          sound.play();
        } else {
          sound.stop();
          sound.play();
        }
      } catch (error) {
        console.warn(`Error playing sound ${soundName}:`, error);
      }
    } else {
      console.warn(`Sound ${soundName} not loaded yet`);
    }
  }

  playMusic() {
    if (!this.soundEnabled || this.isMusicPlaying) return;

    const music = this.sounds.music;
    if (music && music.state() === "loaded") {
      try {
        music.loop(true);
        music.volume(this.musicVolume);
        music.play();
        this.isMusicPlaying = true;
      } catch (error) {
        console.warn("Error playing music:", error);
      }
    }
  }

  stopMusic() {
    const music = this.sounds.music;
    if (music && this.isMusicPlaying) {
      try {
        music.stop();
        this.isMusicPlaying = false;
      } catch (error) {
        console.warn("Error stopping music:", error);
      }
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    const music = this.sounds.music;
    if (music) {
      music.volume(this.musicVolume);
    }
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    Object.entries(this.sounds).forEach(([key, sound]) => {
      if (key !== "music" && sound) {
        sound.volume(this.sfxVolume);
      }
    });
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  // Método para precargar todos los sonidos
  preloadAll(): Promise<void[]> {
    const loadPromises = Object.values(this.sounds).map((sound) => {
      return new Promise<void>((resolve) => {
        if (sound.state() === "loaded") {
          resolve();
        } else {
          sound.once("load", () => resolve());
          sound.once("loaderror", () => resolve()); // Resolver incluso en error
        }
      });
    });

    return Promise.all(loadPromises);
  }

  // Limpiar recursos
  destroy() {
    Object.values(this.sounds).forEach((sound) => {
      if (sound) {
        sound.unload();
      }
    });
    this.sounds = {};
    this.isMusicPlaying = false;
  }

  // Getters para estado
  getMusicState() {
    return {
      isPlaying: this.isMusicPlaying,
      volume: this.musicVolume,
      enabled: this.soundEnabled,
    };
  }
}

export const SoundManager = new SoundManagerClass();

// Hook mejorado con más funcionalidades
export const useSoundManager = () => {
  const managerRef = useRef(SoundManager);

  useEffect(() => {
    // Precargar sonidos cuando el componente se monta
    managerRef.current
      .preloadAll()
      .then(() => {
        console.log("All sounds loaded successfully");
      })
      .catch((error) => {
        console.warn("Some sounds failed to load:", error);
      });

    // Limpiar al desmontar
    return () => {
      managerRef.current.stopMusic();
    };
  }, []);

  return managerRef.current;
};

// Hook específico para controles de volumen
export const useSoundControls = () => {
  const soundManager = useSoundManager();

  const setMusicVolume = (volume: number) => {
    soundManager.setMusicVolume(volume);
  };

  const setSFXVolume = (volume: number) => {
    soundManager.setSFXVolume(volume);
  };

  const toggleSound = (enabled: boolean) => {
    soundManager.setSoundEnabled(enabled);
  };

  const getSoundState = () => {
    return soundManager.getMusicState();
  };

  return {
    setMusicVolume,
    setSFXVolume,
    toggleSound,
    getSoundState,
  };
};
