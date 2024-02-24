import { handleEffect, model } from '@modern-js/runtime/model';

import { api } from '@/api';

export const userInfoModel = model('userInfo').define({
  state: {
    userInfo: null as XJ.UserInfo | null,
    loading: false,
    error: null,
  },
  actions: {
    refresh: handleEffect({ result: 'userInfo' }),
  },
  effects: {
    async refresh() {
      return api.getUserInfo();
    },
  },
});
