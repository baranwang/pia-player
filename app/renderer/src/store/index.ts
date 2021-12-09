import { createContext, useContext } from 'react';
import { GlobalStore } from './global';
import { PlaylistStore } from './playlist';

export const storesContext = createContext({
  globalStore: new GlobalStore(),
  playlistStore: new PlaylistStore(),
});

export const useStores = () => {
  return useContext(storesContext);
};
