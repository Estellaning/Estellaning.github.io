(() => {
  const dialog = document.querySelector('#lightbox');
  const image = dialog.querySelector('img');
  const zoom = document.querySelector('#zoom');
  const viewport = dialog.querySelector('.lightbox-scroll');
  let trigger;
  let drag = null;
  const endDrag = () => {
    const pointerId = drag?.id;
    drag = null;
    if (pointerId !== undefined && viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
    viewport.classList.remove('dragging');
  };
  const toggleZoom = () => {
    endDrag();
    const zoomed = dialog.classList.toggle('zoomed');
    zoom.textContent = zoomed ? 'Fit to screen −' : 'Zoom in +';
    zoom.setAttribute('aria-pressed', String(zoomed));
    if (!zoomed) viewport.scrollTo(0, 0);
  };
  viewport.addEventListener('pointerdown', event => {
    // Touch keeps native scrolling and pinch gestures; mouse/pen can grab the image.
    if (!dialog.classList.contains('zoomed') || event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary) return;
    if (event.target !== image) return;
    event.preventDefault();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    viewport.scrollLeft = drag.left + drag.x - event.clientX;
    viewport.scrollTop = drag.top + drag.y - event.clientY;
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => {
    viewport.addEventListener(type, endDrag);
  });
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
      viewport.scrollTo(0, 0);
      document.querySelector('#close').focus();
    });
  });
  zoom.addEventListener('click', toggleZoom);
  image.addEventListener('click', () => {
    // A click after panning must not unexpectedly shrink the image.
    if (!dialog.classList.contains('zoomed')) toggleZoom();
  });
  document.querySelector('#close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    endDrag();
    document.body.style.overflow = '';
    image.removeAttribute('src');
    trigger?.focus();
  });
})();
