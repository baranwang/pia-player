import { Outlet } from '@modern-js/runtime/router';
import { useEffect } from 'react';

import { BaseLayout } from '@/components/base-layout';
import { PlayerContext, usePlayer } from '@/hooks/use-player';

export default function () {
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      const { body } = document;
      if (e.matches || (e.target as any)?.matches) {
        if (!body.hasAttribute('theme-mode')) {
          body.setAttribute('theme-mode', 'dark');
        }
      } else if (body.hasAttribute('theme-mode')) {
        body.removeAttribute('theme-mode');
      }
    };
    mql.addEventListener('change', listener);
    mql.dispatchEvent(new Event('change'));
    return () => {
      mql.removeEventListener('change', listener);
    };
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
