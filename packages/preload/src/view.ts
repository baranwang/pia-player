import { EK } from '/@eventKeys';
import { ipcRenderer } from 'electron';
import viewInsertCSS from './view.css'

document.addEventListener('DOMContentLoaded', () => {
  const insertcss = document.createElement('style')
  insertcss.innerHTML = viewInsertCSS
  document.body.appendChild(insertcss)

  const popover = document.createElement('div');
  popover.classList.add('pia-player-popover');

  window.addEventListener('mouseup', async () => {
    const selection = getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const pinyin: string[][] = await ipcRenderer.invoke(
        EK.pinyin,
        selection.toString()
      );
      popover.innerHTML = pinyin.map((p) => p.join('/')).join(' ');
      document.body.appendChild(popover);

      const range = selection.getRangeAt(0);
      const { x, y, width } = range.getBoundingClientRect();
      let { width: popoverWidth, height: popoverHeight } =
        popover.getBoundingClientRect();
      if (width > popoverWidth) {
        popover.style.maxWidth = `${width}px`;
        const rect = popover.getBoundingClientRect();
        popoverWidth = rect.width;
        popoverHeight = rect.height;
      }
      popover.style.top = `${y - popoverHeight - 8}px`;
      popover.style.left = `${x - (popoverWidth - width) / 2}px`;
    } else {
      popover.remove();
    }
  });

  document.getElementById('app')?.addEventListener('scroll', () => {
    popover.remove();
  });
});
