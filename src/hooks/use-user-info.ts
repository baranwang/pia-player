import { useModel } from '@modern-js/runtime/model';
import { useEffect } from 'react';

import { userInfoModel } from '@/store/user-info';

export const useUserInfo = () => {
  const [state, actions] = useModel(userInfoModel);

  useEffect(() => {
    if (!state.userInfo) {
      actions.refresh();
    }
  }, []);

  return {
    userInfo: state.userInfo,
    refreshUserInfo: actions.refresh,
  };
};
