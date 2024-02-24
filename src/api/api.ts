import { fetch } from '@tauri-apps/plugin-http';

import type { CollectionType } from '@/constant';

const request = <T>(url: string, method = 'GET', data?: any) => {
  const uri = new URL(url, url.startsWith('http') ? undefined : 'https://api.aipiaxi.com');
  const headers = new Headers();
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', token);
  }
  return fetch(uri, {
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers,
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

export const getUserInfoById = (id: number) => {
  return request<{ data: XJ.UserInfo }>(`/user/info/${id}`).then(res => res.data);
};

export const getUserInfo = () => {
  return request<{ uid: number }>('user/wallet').then(res => getUserInfoById(res.uid));
};

export const search = (query: XJ.SearchRequest) => {
  const params = new URLSearchParams(query as any);
  return request<XJ.SearchResponse>(`/discover/article/search?${params.toString()}`);
};

export const getConfigV1 = () => {
  return request<{ data: XJ.ConfigV1 }>('/article/v1/config');
};

export const getDetail = (id: number) => {
  return request<{ data: XJ.DetailInfo }>(`/article/v1/web/${id}/detail`);
};

export const getWechatQrCode = () => {
  return request<{ data: { ticket: string; url: string } }>('/wechat/loginQRcode').then(res => res.data);
};

export const getWechatLoginStatus = (ticket: string) => {
  return request<{ data: { scanned: 0 } | { token: string } }>(`/wechat/loginQRcode/${ticket}`).then(res => res.data);
};

export const getCollectionList = (userId: number, type: CollectionType, page = 1) => {
  return request<{ data: XJ.CollectionListResponse }>(
    `/user/article/album_list/web/${userId}?type=${type}&page=${page}`,
  ).then(res => res.data);
};

export const getCollectionDetail = (id: number | string) => {
  return request<{ data: XJ.CollectionDetail }>(`/user/article/album_detail/${id}`);
};

export const getCollectionArticleList = (id: number | string, page = 1) => {
  return request<{ data: XJ.CollectionArticleListResponse }>(
    `/user/article/album_article_list/web/${id}?page=${page}`,
  ).then(res => res.data);
};
