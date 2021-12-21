import { createContext, useContext } from 'react';
import { PlaylistStore } from './playlist';

export const storesContext = createContext({
  playlistStore: new PlaylistStore(),
});

export const useStores = () => {
  return useContext(storesContext);
};
