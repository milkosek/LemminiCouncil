// Starts Pagefind's search UI on /search/. Pagefind's files only exist after `pnpm build`.
window.addEventListener('DOMContentLoaded', () => {
  if (typeof window.PagefindUI === 'function') {
    new window.PagefindUI({ element: '#search', showSubResults: true, showImages: false });
  } else {
    document.getElementById('search-unavailable').hidden = false;
  }
});
