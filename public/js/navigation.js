document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.nav a[href], .mobile-links a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      const targetId = target.hash.slice(1);
      const destination = targetId ? document.getElementById(targetId) : null;

      if (target.origin !== current.origin || target.pathname !== current.pathname || !destination || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      destination.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.pushState(null, '', target.hash);
    });
  });
});
