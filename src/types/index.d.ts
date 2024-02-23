declare namespace XJ {
  interface SearchResponse {
    hint: string;
    items: SearchItem[];
    scroll_id: string;
  }

  interface SearchItem {
    id: number;
    name: string;
    photo: string;
    desc: string;
    author: string;
    pia_user_count: string;
    estimated_time: string;
    label: { color: string; text: string }[];
    top_style: number;
    pia: {
      is_host: boolean;
      is_checked: boolean;
    };
    stick: boolean;
    bgImageUrl: string;
    tag: number[];
  }
}
