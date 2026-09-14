// Progressive enhancement only: the page is complete without this file.
(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = matchMedia('(min-width: 48em)');

  // Mobile navigation
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      root.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
    matchMedia('(min-width: 60em)').addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  // Underline the nav link of the section in the middle of the screen
  const links = new Map(
    [...document.querySelectorAll('.nav a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a])
  );
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        links.get(entry.target.id)?.classList.toggle('is-current', entry.isIntersecting);
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    for (const id of links.keys()) {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    }
  }

  // Scroll reveals: blocks animate in the first time they enter, staggered per batch
  const blocks = document.querySelectorAll('[data-reveal]');

  if (!reduceMotion && 'IntersectionObserver' in window && blocks.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.style.setProperty('--delay', `${Math.min(order++, 5) * 90}ms`);
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });

    // Anything already on screen at load stays put instead of animating in.
    // Read every position first, then write, so the browser lays out once.
    const onScreen = [...blocks].map((block) => block.getBoundingClientRect().top < window.innerHeight);
    blocks.forEach((block, i) => {
      if (onScreen[i]) block.classList.add('is-in');
      else revealObserver.observe(block);
    });
    root.classList.add('reveal-ready');
  }

  // Colour splash: hovering a photo floods it with colour from the pointer outward.
  // The colour copy reuses the already-loaded image, so it costs no extra download.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    for (const holder of document.querySelectorAll('.photo__frame, .poster, .portrait__clip')) {
      const img = holder.querySelector('img');
      if (!img) continue;
      let splash = null;

      const aim = (event) => {
        const rect = img.getBoundingClientRect();
        splash.style.setProperty('--x', `${event.clientX - rect.left}px`);
        splash.style.setProperty('--y', `${event.clientY - rect.top}px`);
      };

      holder.addEventListener('pointerenter', (event) => {
        if (!splash) {
          splash = img.cloneNode();
          splash.removeAttribute('srcset');
          splash.removeAttribute('loading');
          splash.src = img.currentSrc || img.src;
          splash.alt = '';
          splash.setAttribute('aria-hidden', 'true');
          splash.classList.add('splash');
          aim(event); // start at the pointer, not the centre
          holder.append(splash);
        } else if (splash.getAnimations().length === 0) {
          // Closed and idle: jump the circle to the pointer instead of sliding it there
          splash.classList.add('is-jump');
          aim(event);
          splash.getBoundingClientRect();
          splash.classList.remove('is-jump');
        } else {
          aim(event);
        }
        splash.getBoundingClientRect(); // commit the closed circle before opening it
        holder.classList.add('is-splash');
      });

      holder.addEventListener('pointerleave', (event) => {
        if (!splash) return;
        aim(event);
        holder.classList.remove('is-splash');
      });
    }
  }

  // Scroll-linked: progress bar, header state, and gentle parallax
  const progress = document.querySelector('.progress');
  const bar = document.querySelector('.header-bar');
  const heroMedia = document.querySelector('.hero__media');
  const heroStar = document.querySelector('.hero .portrait__star');
  const band = document.querySelector('.marquee__band');
  const layers = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0,
    offset: 0,
  }));

  bar?.addEventListener('focusin', () => bar.classList.remove('is-hidden'));

  let lastY = window.scrollY;
  let queued = false;

  const update = () => {
    queued = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const motion = !reduceMotion;

    // Read everything first
    const maxScroll = root.scrollHeight - vh;
    const bandRect = motion && band ? band.getBoundingClientRect() : null;
    const layerRects = motion && wide.matches ? layers.map((layer) => layer.el.getBoundingClientRect()) : null;

    // Then write
    progress?.style.setProperty('--progress', maxScroll > 0 ? (y / maxScroll).toFixed(4) : '0');

    if (bar) {
      bar.classList.toggle('is-scrolled', y > 8);
      const keepVisible = root.classList.contains('nav-open') || y < vh * 0.5 || bar.contains(document.activeElement);
      if (keepVisible || y < lastY - 4) bar.classList.remove('is-hidden');
      else if (y > lastY + 4) bar.classList.add('is-hidden');
    }
    lastY = y;

    if (!motion) return;

    if (heroMedia && y < vh * 1.5) {
      heroMedia.style.setProperty('--lift', `${(y * 0.12).toFixed(1)}px`);
      heroStar?.style.setProperty('--spin', `${(y * 0.05).toFixed(2)}deg`);
    }

    if (bandRect && bandRect.bottom > -100 && bandRect.top < vh + 100) {
      const t = (bandRect.top + bandRect.height / 2) / vh - 0.5;
      band.style.setProperty('--shift', `${(-t * vw * 0.08).toFixed(1)}px`);
    }

    if (layerRects) {
      layers.forEach((layer, i) => {
        const rect = layerRects[i];
        const top = rect.top - layer.offset; // position without the current shift
        if (top > vh + 200 || top + rect.height < -200) return;
        layer.offset = (top + rect.height / 2 - vh / 2) * layer.speed;
        layer.el.style.setProperty('--parallax', `${layer.offset.toFixed(1)}px`);
      });
    } else {
      for (const layer of layers) {
        if (!layer.offset) continue;
        layer.offset = 0;
        layer.el.style.removeProperty('--parallax');
      }
    }
  };

  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  toggle?.addEventListener('click', queue);
  update();
})();
