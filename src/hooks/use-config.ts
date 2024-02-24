import { useModel } from '@modern-js/runtime/model';
import { useEffect } from 'react';

import { configModel } from '@/store/config';

export const useConfig = () => {
  const [state, actions] = useModel(configModel);

  useEffect(() => {
    if (!state.config) {
      actions.load();
    }
  }, [state.config]);

  return state;
};
