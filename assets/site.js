'use strict';

const toc = document.querySelector('#toc');
const desktop = window.matchMedia('(min-width: 961px)');
const syncDirectory = () => { toc.open = desktop.matches; };
syncDirectory();
desktop.addEventListener('change', syncDirectory);

document.querySelectorAll('.toc-link').forEach(link => {
  link.addEventListener('click', () => {
    if (!desktop.matches) toc.open = false;
  });
});

const progress = document.querySelector('#reading-progress');
const topLink = document.querySelector('.back-to-top');
let pending = false;
const updateReading = () => {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${distance > 0 ? Math.min(100, Math.max(0, window.scrollY / distance * 100)) : 0}%`;
  topLink.hidden = window.scrollY < 600;
  pending = false;
};
window.addEventListener('scroll', () => {
  if (!pending) {
    pending = true;
    window.requestAnimationFrame(updateReading);
  }
}, {passive: true});
window.addEventListener('resize', updateReading);
updateReading();

if ('IntersectionObserver' in window) {
  const links = new Map(Array.from(document.querySelectorAll('.toc-link'), link => [link.hash.slice(1), link]));
  const headings = document.querySelectorAll('.prose h2, .prose h3');
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) {
      links.forEach(link => link.removeAttribute('aria-current'));
      links.get(visible[0].target.id)?.setAttribute('aria-current', 'location');
    }
  }, {rootMargin: '-90px 0px -65% 0px'});
  headings.forEach(heading => observer.observe(heading));
}
