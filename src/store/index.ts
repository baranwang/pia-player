import React from 'react';
import { GlobalStore } from './global';
import { PlaylistStore } from './playlist';

export const storesContext = React.createContext({
  globalStore: new GlobalStore(),
  playlistStore: new PlaylistStore(),
});

export const useStores = () => {
  return React.useContext(storesContext);
};
