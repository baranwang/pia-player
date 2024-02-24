export const formatSecond = (second: number | string) => {
  const s = Math.floor(Number(second));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const ss = s % 60;
  const mm = m % 60;
  return `${h > 0 ? `${h}:` : ''}${mm < 10 ? `0${mm}` : mm}:${ss < 10 ? `0${ss}` : ss}`;
};
