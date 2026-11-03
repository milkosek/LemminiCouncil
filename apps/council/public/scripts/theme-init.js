// Runs before first paint (see BaseLayout.astro): applies the saved theme so the page doesn't
// flash dark before switching. The theme-color values must match --bg in packages/ui tokens.css
// and the toggle script in ThemeToggle.astro.
try {
  if (localStorage.getItem('lc-theme') === 'day') {
    document.documentElement.dataset.theme = 'day';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f4ecdc');
  }
} catch {
  /* stay on night */
}
