export const timeFormatter = (time = 0) => {
  const minutes = Math.floor((time / 60) % 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};
