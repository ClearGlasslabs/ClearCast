(() => {
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const pageKey = pageName.replace('.html', '');

  document.querySelectorAll('.site-nav a[data-page]').forEach((link) => {
    if (link.dataset.page === pageKey) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const next = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', next);
      menuToggle.setAttribute('aria-expanded', String(next));
    });
  }

  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');
  const modalCaption = document.getElementById('modal-caption');
  const closeButton = document.getElementById('modal-close');
  const openers = Array.from(document.querySelectorAll('[data-modal-image]'));

  if (modal && modalImage && modalCaption && closeButton && openers.length) {
    let lastFocus = null;

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      modalImage.src = '';
      modalCaption.textContent = '';
      document.body.style.overflow = '';
      if (lastFocus) {
        lastFocus.focus();
        lastFocus = null;
      }
    };

    const openModal = (trigger) => {
      const src = trigger.getAttribute('data-modal-image');
      const caption = trigger.getAttribute('data-modal-caption') || '';
      if (!src) return;

      lastFocus = document.activeElement;
      modalImage.src = src;
      modalImage.alt = caption || 'Expanded image';
      modalCaption.textContent = caption;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    };

    openers.forEach((el) => {
      el.addEventListener('click', () => openModal(el));
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openModal(el);
        }
      });
    });

    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }
})();
