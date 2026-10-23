<script setup lang="ts">
/**
 * Switches between "The Chamber at Night" (default) and "The Chamber by Day".
 *
 * The choice is kept in localStorage only (no cookie). The button renders only
 * after hydration, so visitors without JavaScript never see a control that
 * does nothing. The matching pre-paint script lives in the site's <head>.
 */
import { computed, onMounted, ref } from 'vue';

type Theme = 'night' | 'day';

const STORAGE_KEY = 'lc-theme';

const mounted = ref(false);
const theme = ref<Theme>('night');

const label = computed(() =>
  theme.value === 'night' ? 'Switch to the day theme' : 'Switch to the night theme',
);

onMounted(() => {
  theme.value = document.documentElement.dataset.theme === 'day' ? 'day' : 'night';
  mounted.value = true;
});

function toggle() {
  theme.value = theme.value === 'night' ? 'day' : 'night';
  document.documentElement.dataset.theme = theme.value;
  try {
    if (theme.value === 'day') localStorage.setItem(STORAGE_KEY, 'day');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The theme still switches.
  }
}
</script>

<template>
  <button
    v-if="mounted"
    type="button"
    class="theme-toggle"
    :aria-label="label"
    :title="label"
    @click="toggle"
  >
    <!-- Moon for night, sun for day -->
    <svg v-if="theme === 'night'" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path
        d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: transparent;
  color: var(--brass);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.theme-toggle:hover {
  border-color: var(--brass);
  color: var(--text);
}
</style>
