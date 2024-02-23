import { fetch } from '@tauri-apps/plugin-http';

const request = <T>(url: string, method = 'GET', data?: any) => {
  const uri = new URL(url, url.startsWith('http') ? undefined : 'https://api.aipiaxi.com');
  return fetch(uri, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  })
    .then(res => {
      if (res.ok) {
        return res.json() as Promise<T>;
      }
      throw new Error(res.statusText);
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
};

export const getUserInfo = () => {
  return request('user/wallet');
};

export const search = (
  {
    keyword: search,
    ...rest
  }: {
    keyword: string;
    [key: string]: any;
  },
  scrollId?: string,
) => {
  const params = new URLSearchParams({
    q: Object.entries({ search, ...rest })
      .map(([key, value]) => `${key}:${value}`)
      .join('|'),
  });
  if (scrollId) {
    params.append('scroll_id', scrollId);
  }
  return request<XJ.SearchResponse>(`/api/v2/public/article/search?${params.toString()}`);
};
