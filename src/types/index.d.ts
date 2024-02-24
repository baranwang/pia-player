declare namespace XJ {
  type ConfigV1 = Record<'authtype' | 'historical' | 'source' | 'tag' | 'type', { id: number; text: string }[]>;

  interface UserInfo {
    id: number;
    avatar: string;
    nickname: string;
  }

  interface SearchRequest {
    page?: string;
    page_size?: string;
    q?: string;
  }

  interface SearchResponse {
    data: {
      count: number;
      page: number;
      page_size: number;
      list: SearchItem[];
    };
  }

  interface SearchItem {
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
    style?: 1 | 2 | 3;
  }

  interface DetailInfo {
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

  interface BGM {
    duration: number;
    hash: string;
    id: number;
    name: string;
    size: number;
    url: string;
  }

  interface CollectionItem {
    article_cnt: number;
    id: number;
    created_at: string;
    fav_cnt: number;
    title: string;
    photo: string;
    is_default: 0 | 1;
    type: number;
    intro: string;
  }

  interface CollectionListResponse {
    count: number;
    list: CollectionItem[];
  }

  interface CollectionDetail {
    nickname: string;
    uid: number;
    id: number;
    fav_cnt: number;
    photo: string;
    tags: {
      id: string;
      name: string;
    }[];
    intro: string;
    article_cnt: number;
    created_at: string;
    type: number;
    title: string;
    is_default: 0 | 1;
    is_followed: 0 | 1;
    is_fav: 0 | 1;
  }

  interface CollectionArticleListResponse {
    list: CollectionArticleItem[];
  }

  interface CollectionArticleItem {
    article_id: number;
    title: string;
    author_name: string;
    tag: string[];
    role_female: number;
    role_male: number;
    length: number;
    ost: string;
    has_ost: number;
    has_bgm: 0 | 1;
    photo: string;
  }
}
