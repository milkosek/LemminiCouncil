// Night is the default theme. Apply a saved "day" choice before the page paints.
// Loaded as a small blocking file (not inline) so the Content-Security-Policy can stay strict.
try {
  if (localStorage.getItem('lc-theme') === 'day') {
    document.documentElement.dataset.theme = 'day';
  }
} catch {
  // Storage unavailable (private mode, blocked site data): stay on night.
}
