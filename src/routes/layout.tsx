import { Outlet } from '@modern-js/runtime/router';
import { getCurrent } from '@tauri-apps/api/window';
import { useEffect } from 'react';

import { BaseLayout } from '@/components/base-layout';
import { PlayerContext, usePlayer } from '@/hooks/use-player';

import type { Theme } from '@tauri-apps/api/window';

const setTheme = (theme: Theme | null) => {
  if (theme === 'dark') {
    document.body.setAttribute('theme-mode', 'dark');
  } else {
    document.body.removeAttribute('theme-mode');
  }
};

export default function () {
  useEffect(() => {
    const currentWindow = getCurrent();
    currentWindow.onThemeChanged(e => setTheme(e.payload));
    currentWindow.theme().then(setTheme);
  }, []);

  const player = usePlayer();
  return (
    <PlayerContext.Provider value={player}>
      <BaseLayout>
        <Outlet />
      </BaseLayout>
    </PlayerContext.Provider>
  );
}
