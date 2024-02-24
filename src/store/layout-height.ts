import { model } from '@modern-js/runtime/model';

export const layoutHeightModel = model('layout-height').define({
  state: {
    height: 0,
  },
  actions: {
    setHeight(state, height: number) {
      state.height = height;
    },
  },
});
