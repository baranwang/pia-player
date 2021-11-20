import { getConfig } from '@/api';
import { makeAutoObservable } from 'mobx';

export class GlobalStore {
  config: Aipiaxi.Config | undefined;

  getConfig = async () => {
    if (this.config) return Promise.resolve(this.config);
    const config = await getConfig();
    this.config = config;
    return config;
  };

  constructor() {
    makeAutoObservable(this);
  }
}
