import Dexie from 'dexie';

export class AppDatabase extends Dexie {
  drama: Dexie.Table<Aipiaxi.DramaInfo, number>;

  bgm: Dexie.Table<BGM, string>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      drama: 'id',
      bgm: 'hash',
    });
    this.drama = this.table('drama');
    this.bgm = this.table('bgm');
  }
}
