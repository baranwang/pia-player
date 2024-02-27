const css = document.createElement('style');
css.innerHTML = `
    html, body {
        -webkit-user-select: auto !important;
        user-select: auto !important;
        background-color: transparent !important;
    }

    #app-nav, .player-bar, #authorInfo, .header-info-container .middle, div[class^="real-love-rank-module"], .control-field > .fav-btn, .comment-input, footer[class^="footer-module"] {
        display: none !important;
    }

    .container {
        width: 100% !important;
        padding: 44px 88px;
    }

    .container > .left {
        width: 100% !important;
        border-radius: 8px;
    }

    .pia-player-popover {
        position: fixed;
        z-index: 9999;
        font-size: 14px;
        line-height: 20px;
        max-width: 320px;
        padding: 8px 12px;
        background-color: rgb(255 255 255 / 60%);
        border-radius: 6px;
        box-shadow: 0 0 1px rgb(0 0 0 / 30%), 0 4px 14px rgb(0 0 0 / 10%);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        backdrop-filter: saturate(180%) blur(20px);
    }
`;

(function insetCss() {
  try {
    document.head.appendChild(css);
  } catch (error) {
    setTimeout(insetCss);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const popover = document.createElement('div');
  popover.classList.add('pia-player-popover');
  window.addEventListener('mouseup', async () => {
    const selection = getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      const pinyin = await window.__TAURI_INTERNALS__.invoke('pinyin', { text });
      popover.innerHTML = pinyin;
      document.body.appendChild(popover);

      const range = selection.rangeCount > 0 && selection.getRangeAt(0);
      if (!range) return;
      const rangeRect = range.getBoundingClientRect();
      let popverRect = popover.getBoundingClientRect();
      if (rangeRect.width > popverRect.width) {
        popover.style.maxWidth = `${rangeRect.width}px`;
        popverRect = popover.getBoundingClientRect();
      }
      popover.style.top = `${Math.max(rangeRect.y - popverRect.height - 8, 0)}px`;
      popover.style.left = `${Math.max(rangeRect.x - (popverRect.width - rangeRect.width) / 2, 0)}px`;
    } else {
      popover.remove();
    }
  });
  const app = document.getElementById('app');
  if (app) {
    app.addEventListener('scroll', () => {
      popover.remove();
    });
  }
});
