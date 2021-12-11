import { EK } from '/@eventKeys';
import { ipcRenderer, shell } from 'electron';
import viewInsertCSS from './view.css';

document.addEventListener('DOMContentLoaded', () => {
  const insertcss = document.createElement('style');
  insertcss.innerHTML = viewInsertCSS;
  document.body.appendChild(insertcss);

  const popover = document.createElement('div');
  popover.classList.add('pia-player-popover');

  window.addEventListener('mouseup', async () => {
    const selection = getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const pinyin: string[][] = await ipcRenderer.invoke(EK.pinyin, selection.toString());
      popover.innerHTML = pinyin.map((p) => p.join('/')).join(' ');
      document.body.appendChild(popover);

      const range = selection.getRangeAt(0);
      const { x, y, width } = range.getBoundingClientRect();
      let { width: popoverWidth, height: popoverHeight } = popover.getBoundingClientRect();
      if (width > popoverWidth) {
        popover.style.maxWidth = `${width}px`;
        const rect = popover.getBoundingClientRect();
        popoverWidth = rect.width;
        popoverHeight = rect.height;
      }
      popover.style.top = `${Math.max(y - popoverHeight - 8, 0)}px`;
      popover.style.left = `${Math.max(x - (popoverWidth - width) / 2, 0)}px`;
    } else {
      popover.remove();
    }
  });

  document.getElementById('app')?.addEventListener('scroll', () => {
    popover.remove();
  });

  const author = document.querySelector('a.author-name') as HTMLAnchorElement;
  author.href = `https://aipiaxi.com/search/result?q=${encodeURIComponent(
    `default:term:${author.querySelector('span:last-child')?.textContent}`,
  )}`;
  author.target = '_self';

  document.querySelectorAll('#content a').forEach((_a) => {
    const a = _a as HTMLAnchorElement;
    a.addEventListener('click', (e) => {
      try {
        const url = new URL(a.href).href;
        e.preventDefault();
        shell.openExternal(url);
      } catch (error) {
        console.error(error);
      }
    });
  });
});
