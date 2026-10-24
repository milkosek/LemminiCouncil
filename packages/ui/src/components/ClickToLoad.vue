<script setup lang="ts">
/**
 * Click-to-load facade for third-party players (YouTube, Spotify, ...).
 *
 * Until the visitor clicks, nothing is requested from the provider: the
 * placeholder (passed in as the default slot, usually a self-hosted thumbnail)
 * is a plain link to the provider's page, so it still works without JavaScript.
 * After the click, the real iframe replaces the placeholder.
 *
 * Use it through YouTubeEmbed.astro / SpotifyEmbed.astro rather than directly.
 */
import { computed, nextTick, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Provider name shown to the visitor, e.g. "YouTube". */
    provider: string;
    /** iframe URL to load after the click. */
    src: string;
    /** Accessible title of the content. */
    title: string;
    /** Fallback link to the content on the provider's site. */
    href: string;
    /** CSS aspect-ratio of the player, e.g. "16 / 9". Ignored when height is set. */
    aspectRatio?: string;
    /** Fixed player height in pixels (for audio players). */
    height?: number;
    /** Text on the play button. */
    action?: string;
  }>(),
  {
    aspectRatio: '16 / 9',
    height: undefined,
    action: undefined,
  },
);

const loaded = ref(false);
const frame = ref<HTMLIFrameElement | null>(null);

const boxStyle = computed(() =>
  props.height ? { height: `${props.height}px` } : { aspectRatio: props.aspectRatio },
);

const buttonText = computed(() => props.action ?? `Play on ${props.provider}`);

async function load(event: MouseEvent) {
  // Let modified clicks (new tab, etc.) behave like a normal link.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return;
  }
  event.preventDefault();
  loaded.value = true;
  await nextTick();
  frame.value?.focus();
}
</script>

<template>
  <figure class="ctl">
    <div class="ctl__box" :class="{ 'ctl__box--loaded': loaded }" :style="boxStyle">
      <!-- allow: autoplay (start right after the click), clipboard-write (the players' "copy link"
           buttons; write-only, on click), encrypted-media (Spotify full tracks), fullscreen and
           picture-in-picture. Firefox logs "unsupported feature" warnings for the first three; it
           ignores them harmlessly (it has its own rules), and Chromium browsers need them. -->
      <iframe
        v-if="loaded"
        ref="frame"
        class="ctl__frame"
        :src="src"
        :title="title"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      />
      <a v-else class="ctl__facade" :href="href" rel="noopener" @click="load">
        <span class="ctl__media"><slot /></span>
        <span class="ctl__overlay">
          <span class="ctl__button">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
            {{ buttonText }}
          </span>
          <span class="ctl__title">{{ title }}</span>
        </span>
      </a>
    </div>
    <figcaption v-if="!loaded" class="ctl__notice">
      Playing this connects to {{ provider }}, which may set cookies. Nothing is loaded from
      {{ provider }} until you click.
    </figcaption>
  </figure>
</template>

<style scoped>
.ctl {
  margin: 0 0 var(--space-6, 1.5rem);
}

.ctl__box {
  position: relative;
  width: 100%;
  border-radius: var(--radius, 4px);
  overflow: hidden;
  background: var(--surface);
  /* An inset outline instead of a border, so the frame gets the full height it asks for.
     Spotify switches to its smaller layout when its player is even 1px shorter than 152px. */
  outline: 1px solid var(--border);
  outline-offset: -1px;
}

/* Once the player is loaded, let the provider's own design show: no frame, no fill. */
.ctl__box--loaded {
  outline: none;
  background: transparent;
}

.ctl__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  /* Players don't declare a colour scheme. Matching theirs ("normal") keeps the browser from
     painting an opaque white background behind them on our dark page. */
  color-scheme: normal;
}

.ctl__facade {
  position: absolute;
  inset: 0;
  display: block;
  color: var(--text);
  text-decoration: none;
}

.ctl__media,
.ctl__media :deep(img) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ctl__media :deep(img) {
  filter: saturate(0.85) brightness(0.7);
  transition: filter 0.2s ease;
}

.ctl__facade:hover .ctl__media :deep(img),
.ctl__facade:focus-visible .ctl__media :deep(img) {
  filter: saturate(1) brightness(0.85);
}

.ctl__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: var(--space-2, 0.5rem);
  padding: var(--space-4, 1rem);
  background: linear-gradient(to top, rgb(0 0 0 / 0.7), transparent 70%);
}

.ctl__button {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.45em 0.9em;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--font-ui);
  font-size: var(--text-sm, 0.875rem);
  font-weight: 600;
}

.ctl__title {
  color: #f4ecdc;
  font-family: var(--font-display);
  font-size: var(--text-lg, 1.375rem);
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.6);
}

.ctl__notice {
  margin-top: var(--space-2, 0.5rem);
  color: var(--text-muted);
  font-family: var(--font-ui);
  font-size: var(--text-sm, 0.875rem);
}
</style>
