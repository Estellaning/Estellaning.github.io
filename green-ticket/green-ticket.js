(() => {
  const dialog = document.querySelector('#lightbox');
  const image = dialog.querySelector('img');
  const zoomIn = document.querySelector('#zoom-in');
  const zoomOut = document.querySelector('#zoom-out');
  const zoomRange = document.querySelector('#zoom-range');
  const zoomValue = document.querySelector('#zoom-value');
  const viewport = dialog.querySelector('.lightbox-scroll');
  const minScale = 1, maxScale = 6;
  let scale = minScale;
  let aspect = 2800 / 750;
  let trigger;
  let drag = null;
  const endDrag = () => {
    const pointerId = drag?.id;
    drag = null;
    if (pointerId !== undefined && viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
    viewport.classList.remove('dragging');
  };
  const setScale = (next, clientX, clientY) => {
    endDrag();
    const bounds = viewport.getBoundingClientRect();
    const anchorX = clientX ?? bounds.left + viewport.clientWidth / 2;
    const anchorY = clientY ?? bounds.top + viewport.clientHeight / 2;
    const before = image.getBoundingClientRect();
    const x = before.width ? Math.max(0, Math.min(1, (anchorX - before.left) / before.width)) : .5;
    const y = before.height ? Math.max(0, Math.min(1, (anchorY - before.top) / before.height)) : .5;
    scale = Math.max(minScale, Math.min(maxScale, next));
    const fittedWidth = Math.min(viewport.clientWidth, viewport.clientHeight * aspect);
    image.style.width = `${fittedWidth * scale}px`;
    dialog.classList.toggle('zoomed', scale > minScale);
    const percent = Math.round(scale * 100);
    zoomRange.value = String(percent);
    zoomRange.setAttribute('aria-valuetext', `${percent}%`);
    zoomValue.value = `${percent}%`;
    zoomOut.disabled = scale <= minScale;
    zoomIn.disabled = scale >= maxScale;
    if (scale === minScale) {
      viewport.scrollTo(0, 0);
    } else {
      const after = image.getBoundingClientRect();
      viewport.scrollLeft += after.left + x * after.width - anchorX;
      viewport.scrollTop += after.top + y * after.height - anchorY;
    }
  };
  viewport.addEventListener('wheel', event => {
    if (!event.deltaY) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    const delta = Math.max(-100, Math.min(100, event.deltaY * unit));
    setScale(scale * Math.exp(-delta * .002), event.clientX, event.clientY);
  }, { passive: false });
  zoomIn.addEventListener('click', () => setScale(scale + .25));
  zoomOut.addEventListener('click', () => setScale(scale - .25));
  zoomRange.addEventListener('input', () => setScale(Number(zoomRange.value) / 100));
  document.querySelector('#zoom-fit').addEventListener('click', () => setScale(minScale));
  window.addEventListener('resize', () => { if (dialog.open) setScale(scale); });
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
      aspect = Number(button.querySelector('img').width) / Number(button.querySelector('img').height);
      scale = minScale;
      image.style.width = '';
      image.onload = () => {
        aspect = image.naturalWidth / image.naturalHeight;
        if (dialog.open) setScale(scale);
      };
      image.src = button.dataset.full;
      image.alt = button.querySelector('img').alt;
      document.querySelector('#board-label').textContent = `Portfolio board ${index + 1}`;
      dialog.classList.remove('zoomed');
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      setScale(minScale);
      viewport.scrollTo(0, 0);
      document.querySelector('#close').focus();
    });
  });
  image.addEventListener('click', event => {
    // A click after panning must not unexpectedly shrink the image.
    if (scale === minScale) setScale(2, event.clientX, event.clientY);
  });
  document.querySelector('#close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    endDrag();
    image.onload = null;
    document.body.style.overflow = '';
    image.removeAttribute('src');
    trigger?.focus();
  });
})();
