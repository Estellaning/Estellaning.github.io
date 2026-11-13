(() => {
  const dialog = document.querySelector('#lightbox');
  const image = dialog.querySelector('img');
  const zoom = document.querySelector('#zoom');
  let trigger;
  const toggleZoom = () => {
    const zoomed = dialog.classList.toggle('zoomed');
    zoom.textContent = zoomed ? 'Fit to screen −' : 'Zoom in +';
    zoom.setAttribute('aria-pressed', String(zoomed));
  };
  document.querySelectorAll('.board').forEach((button, index) => {
    button.addEventListener('click', () => {
      trigger = button;
      image.src = button.dataset.full;
      image.alt = button.querySelector('img').alt;
      document.querySelector('#board-label').textContent = `Portfolio board ${index + 1}`;
      dialog.classList.remove('zoomed');
      zoom.textContent = 'Zoom in +';
      zoom.setAttribute('aria-pressed', 'false');
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      dialog.querySelector('.lightbox-scroll').scrollTo(0, 0);
      document.querySelector('#close').focus();
    });
  });
  zoom.addEventListener('click', toggleZoom);
  image.addEventListener('click', toggleZoom);
  document.querySelector('#close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    image.removeAttribute('src');
    trigger?.focus();
  });
})();
