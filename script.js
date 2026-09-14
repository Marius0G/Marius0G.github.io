// Progressive enhancement only: the page is complete without this file.
(() => {
  const root = document.documentElement;

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

  // Scroll reveal: a short fade-up the first time a block enters the viewport
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const blocks = document.querySelectorAll('[data-reveal]');

  if (!reduceMotion && 'IntersectionObserver' in window && blocks.length) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

    // Anything already on screen at load stays put instead of animating in.
    // Read every position first, then write, so the browser lays out once.
    const onScreen = [...blocks].map((block) => block.getBoundingClientRect().top < window.innerHeight);
    blocks.forEach((block, i) => {
      if (onScreen[i]) block.classList.add('is-in');
      else observer.observe(block);
    });
    root.classList.add('reveal-ready');
  }
})();
