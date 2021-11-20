interface BGM {
  id: number;
  name: string;
  duration: number;
  size: number;
  url: string;
  hash: string;
  filepath?: string;
}
declare namespace Aipiaxi {
  interface APIResponse<T = any> {
    r: number;
    data: T;
  }

  type Config = Record<
    'authtype' | 'historical' | 'source' | 'tag' | 'type',
    { id: number; text: string }[]
  >;
  interface DramaInfo {
    id: number;
    name: string;
    tag: string;
    role_male: number;
    role_female: number;
    author_id: number;
    source: number;
    type: number;
    authtype: number;
    historical: number;
    length: number;
    visitors: number;
    fav: number;
    like: number;
    desc: string;
    photo?: string;
    ost?: string;
    ost_desc: {
      duration: number;
    };
    created_at: string;
    updated_at: string;
    background: number;
    fish_coin: number;
    gold_coin: number;
    bgm: BGM[];
    is_liked: boolean;
    is_favorite: boolean;
    content: string;
    hot_rank: number;
    app_rank: number;
    tags: {
      color: string;
      text: string;
    }[];
    article_count: number;
    total_length: string;
    nickname: string;
    avatar: string;
    fans_num: number;
    user_creat_at: string;
    is_followed: 0 | 1;
  }

  interface DramaInfoInSearch {
    article_url: string;
    author: string;
    bgm_count: number;
    desc: string;
    has_ost: '0' | '1';
    id: number;
    index_name: string;
    recommend_count: string;
    role_female: number;
    role_male: number;
    subscribe_count: string;
    tags: string;
    thumbnail: string;
    title: string;
    type: string;
    update_timestamp: string;
    word_count: number;
  }
}
