import { EK } from '@/eventKeys';
import { ipcRenderer } from 'electron';

document.addEventListener('DOMContentLoaded', () => {
  const popover = document.createElement('div');
  popover.style.position = 'fixed';
  popover.style.backgroundColor = '#fff';
  popover.style.maxWidth = '320px';
  popover.style.padding = '8px';
  popover.style.borderRadius = '4px';
  popover.style.boxShadow = '0px 0px 4px rgba(0, 0, 0, 0.25)';
  popover.style.zIndex = '9999';

  window.addEventListener('mouseup', async () => {
    const selection = getSelection();
    if (selection && selection.toString().length > 0) {
      const pinyin: string[][] = await ipcRenderer.invoke(
        EK.pinyin,
        selection.toString()
      );
      popover.innerText = pinyin.map((p) => p.join('/')).join(' ');
      document.body.appendChild(popover);

      const range = selection.getRangeAt(0);
      const { x, y, width } = range.getBoundingClientRect();
      const { width: popoverWidth, height: popoverHeight } =
        popover.getBoundingClientRect();
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
