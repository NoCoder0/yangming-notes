'use strict';

const toc = document.querySelector('#toc');
if (toc) {
  const desktop = window.matchMedia('(min-width: 961px)');
  const syncDirectory = () => { toc.open = desktop.matches; };
  syncDirectory();
  desktop.addEventListener('change', syncDirectory);

  toc.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', () => {
      if (!desktop.matches) toc.open = false;
    });
  });
}

const progress = document.querySelector('#reading-progress');
const topLink = document.querySelector('.back-to-top');
let pending = false;
const updateReading = () => {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) {
    progress.style.width = `${distance > 0 ? Math.min(100, Math.max(0, window.scrollY / distance * 100)) : 0}%`;
  }
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

if (toc && 'IntersectionObserver' in window) {
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

const search = document.querySelector('#lecture-search');
if (search) {
  const groups = Array.from(document.querySelectorAll('.catalog-group'), group => ({
    group,
    rows: Array.from(group.querySelectorAll('[data-lecture]'), row => ({
      row,
      number: Number(row.dataset.lecture),
      terms: row.dataset.search.normalize('NFKC').toLowerCase()
    }))
  }));
  const clear = document.querySelector('#clear-search');
  const count = document.querySelector('#search-count');
  const jumps = document.querySelector('.catalog-jumps');
  const noResults = document.querySelector('.no-results');

  const filterLectures = () => {
    const query = search.value.trim().normalize('NFKC').toLowerCase();
    const lecture = query.match(/^(?:第\s*)?(\d{1,2})\s*讲?$/);
    const words = query ? query.split(/\s+/) : [];
    let total = 0;
    for (const {group, rows} of groups) {
      let visible = 0;
      for (const {row, number, terms} of rows) {
        const matches = lecture ? number === Number(lecture[1]) : words.every(word => terms.includes(word));
        row.hidden = !matches;
        if (matches) visible++;
      }
      group.hidden = visible === 0;
      total += visible;
    }
    jumps.hidden = Boolean(query);
    noResults.hidden = total > 0;
    clear.disabled = search.value.length === 0;
    count.textContent = query ? `找到 ${total} 篇` : `共 ${total} 篇`;
  };

  search.addEventListener('input', filterLectures);
  clear.addEventListener('click', () => {
    search.value = '';
    filterLectures();
    search.focus();
  });
  filterLectures();
  search.closest('.catalog-filter').hidden = false;
}
