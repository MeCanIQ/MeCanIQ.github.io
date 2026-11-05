// MeCanIQ landing page - small progressive-enhancement touches only.
// Nothing here is required for the page to work; every effect degrades to
// a plain static (but fully readable) page with JS disabled.

// Nav gets a border/blur once the hero has scrolled past it.
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Benefit cards fade/rise in as they enter view - same "one orchestrated
// moment, then quiet" restraint as the hero's own load-in animation, just
// triggered by scroll instead of page load. Respects prefers-reduced-motion
// via styles.css (.benefit-card is already visible/untransitioned there),
// so this observer is harmless to still run either way.
const cards = document.querySelectorAll('.benefit-card');
if ('IntersectionObserver' in window && cards.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  cards.forEach((card) => io.observe(card));
} else {
  cards.forEach((card) => card.classList.add('is-visible'));
}
