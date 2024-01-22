import { fetch } from '@tauri-apps/plugin-http';

const request = (url: string, method = 'GET', data?: any) => {
  const uri = new URL(url, url.startsWith('http') ? undefined : 'https://api.aipiaxi.com');
  return fetch(uri, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};

export const getUserInfo = () => {
  return request('user/wallet');
};
