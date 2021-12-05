import { getDrama } from '/@/api';
import { AppDatabase } from '/@/db';
import { makeAutoObservable } from 'mobx';

const db = new AppDatabase();

export class PlaylistStore {
  dramaList: Aipiaxi.DramaInfo[] = [];

  activeDramaId = 0;

  get activeDrama() {
    return this.dramaList?.find((drama) => drama.id === this.activeDramaId);
  }

  get playlist() {
    return this.activeDrama?.bgm
  }

  addDramaToList = async (arg: number | Aipiaxi.DramaInfo) => {
    let drama: Aipiaxi.DramaInfo;
    if (typeof arg === 'number') {
      drama = await getDrama(arg);
    } else {
      drama = arg;
    }
    db.drama.put(drama);

    this.dramaList.push(drama);
    this.activeDramaId = drama.id;
  };

  constructor() {
    makeAutoObservable(this);
  }
}
