import { handleEffect, model } from '@modern-js/runtime/model';

import { api } from '@/api';

export const configModel = model('config').define({
  state: {
    config: null as XJ.ConfigV1 | null,
    loading: false,
  },
  actions: {
    load: handleEffect({ result: 'config' }),
  },
  computed: {
    configMap(state) {
      if (!state.config) {
        return null;
      }
      return Object.entries(state.config).reduce((acc, [key, value]) => {
        (acc as any)[key] = Object.fromEntries(value.map(item => [item.id.toString(), item.text]));
        return acc;
      }, {} as Record<keyof XJ.ConfigV1, Record<string, string>>);
    },
  },
  effects: {
    async load() {
      return api.getConfigV1().then(res => res.data);
    },
  },
});
