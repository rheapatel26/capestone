import React, { createContext, useEffect, useState, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

type AudioContextType = {
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  SFXenabled: boolean;
  setSFXenabled: React.Dispatch<React.SetStateAction<boolean>>;
  
  
};

export const AudioContext = createContext<AudioContextType>({
  enabled: true,
  setEnabled: () => {},
  SFXenabled: true,
  setSFXenabled: () => {},
});

const playlist = [
  require('../../assets/sound/echoes-in-blue.mp3'),
  require('../../assets/sound/Morning-Routine-Lofi.mp3'),
  // require('../../assets/sound/bg3.mp3'),
];

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState(true);
  const [SFXenabled,setSFXenabled] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);
  const didFinishHandled = useRef(false);

  // create player on initial track
  const player = useAudioPlayer(playlist[trackIndex]);
  const status = useAudioPlayerStatus(player);

  // when enabled toggles, pause/play
  useEffect(() => {
    if (enabled) {
      player.play();
    } else {
      player.pause();
    }
  }, [enabled]);

  // monitor when track ends → advance playlist
  useEffect(() => {
  if (status.didJustFinish && enabled && !didFinishHandled.current) {
    didFinishHandled.current = true;

    // wait briefly to avoid race with replace()
    setTimeout(() => {
        const next = (trackIndex + 1) % playlist.length;
        setTrackIndex(next);
        didFinishHandled.current = false; // reset for next time
      }, 300); // a small debounce buffer
    }
  }, [status.didJustFinish, enabled]);
  
  // when trackIndex changes, replace the audio in player
  useEffect(() => {
    player.replace(playlist[trackIndex]);
    // console.log(playlist[trackIndex]);
    if (enabled) {
      player.play();
    }
  }, [trackIndex]);

  return (
    <AudioContext.Provider value={{ enabled, setEnabled, SFXenabled,setSFXenabled }}>
      {children}
    </AudioContext.Provider>
  );
};
