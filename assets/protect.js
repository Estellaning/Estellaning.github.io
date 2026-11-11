// Deterrents only: discourage casual saving and copying of the work shown here.
(() => {
  const stop = (e) => e.preventDefault();
  ['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'].forEach((t) => document.addEventListener(t, stop));
  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && ['s', 'c', 'x', 'u', 'p', 'a'].includes(k)) e.preventDefault();
  });
  document.querySelectorAll('img, video').forEach((el) => el.setAttribute('draggable', 'false'));
})();
