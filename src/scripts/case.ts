import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

class CaseStrip extends HTMLElement {
  private events?: AbortController;
  private observer?: ResizeObserver;

  connectedCallback() {
    const track = this.querySelector<HTMLElement>('.case-strip-track');
    const nav = this.querySelector<HTMLElement>('.case-strip-nav');
    const prev = this.querySelector<HTMLButtonElement>('[data-prev]');
    const next = this.querySelector<HTMLButtonElement>('[data-next]');
    const counter = this.querySelector<HTMLElement>('[data-counter]');
    const slides = Array.from(track?.querySelectorAll<HTMLElement>('figure') ?? []);
    if (!track || !nav || !prev || !next || !counter || slides.length < 2) return;
    this.events = new AbortController();
    const options = { signal: this.events.signal };
    nav.hidden = false;

    const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
    const index = () => Math.round(track.scrollLeft / Math.max(1, step()));
    const go = (value: number) => track.scrollTo({
      left: Math.max(0, Math.min(value, slides.length - 1)) * step(),
      behavior: reduced.matches ? 'instant' : 'smooth',
    });
    const update = () => {
      counter.textContent = String(index() + 1).padStart(2, '0');
      prev.disabled = track.scrollLeft < 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    prev.addEventListener('click', () => go(index() - 1), options);
    next.addEventListener('click', () => go(index() + 1), options);
    track.addEventListener('scroll', update, { ...options, passive: true });
    track.addEventListener('keydown', e => {
      const focused = slides.indexOf(document.activeElement as HTMLElement);
      const from = focused < 0 ? index() : focused;
      const keys: Record<string, number> = { ArrowLeft: from - 1, ArrowRight: from + 1, Home: 0, End: slides.length - 1 };
      if (!(e.key in keys) || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      const target = Math.max(0, Math.min(keys[e.key], slides.length - 1));
      slides[target].focus({ preventScroll: true });
      go(target);
    }, options);
    let drag: { pointerId: number; x: number; scrollLeft: number } | undefined;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { pointerId: e.pointerId, x: e.clientX, scrollLeft: track.scrollLeft };
      track.setPointerCapture(e.pointerId);
    }, options);
    track.addEventListener('pointermove', e => {
      if (drag?.pointerId !== e.pointerId || !drag) return;
      const delta = e.clientX - drag.x;
      if (Math.abs(delta) > 4) track.classList.add('is-dragging');
      if (track.classList.contains('is-dragging')) track.scrollLeft = drag.scrollLeft - delta;
    }, options);
    const release = () => {
      if (!drag) return;
      const snap = index();
      drag = undefined;
      if (track.classList.contains('is-dragging')) {
        track.classList.remove('is-dragging');
        go(snap);
      }
    };
    track.addEventListener('lostpointercapture', release, options);
    this.observer = new ResizeObserver(update);
    this.observer.observe(track);
    update();
  }

  disconnectedCallback() {
    this.events?.abort();
    this.observer?.disconnect();
  }
}

class CaseReel extends HTMLElement {
  private events?: AbortController;
  private observer?: IntersectionObserver;

  connectedCallback() {
    const video = this.querySelector('video');
    const sound = this.querySelector<HTMLButtonElement>('.case-sound');
    if (!video || !sound) return;
    this.events = new AbortController();
    const options = { signal: this.events.signal };
    let userPaused = false;
    let visible = false;

    const updateSound = () => {
      const audible = !video.muted && video.volume > 0;
      sound.setAttribute('aria-pressed', String(audible));
      sound.textContent = (audible ? sound.dataset.on : sound.dataset.off) ?? '';
    };
    const updatePlayback = () => {
      if (!visible || reduced.matches || document.hidden) {
        video.pause();
        video.muted = true;
      } else if (!userPaused) {
        void video.play().catch(() => { /* Os controles nativos continuam disponíveis. */ });
      }
    };
    sound.hidden = false;
    sound.addEventListener('click', () => {
      const audible = !video.muted && video.volume > 0;
      video.muted = audible;
      if (!audible && video.volume === 0) video.volume = 1;
      if (!audible && video.paused) void video.play().catch(() => {});
    }, options);
    video.addEventListener('volumechange', updateSound, options);
    video.addEventListener('pause', () => {
      if (visible && !document.hidden && !reduced.matches) userPaused = true;
    }, options);
    video.addEventListener('play', () => { userPaused = false; }, options);
    this.observer = new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= .5;
      updatePlayback();
    }, { threshold: [0, .5] });
    this.observer.observe(video);
    reduced.addEventListener('change', updatePlayback, options);
    document.addEventListener('visibilitychange', updatePlayback, options);
    updateSound();
  }

  disconnectedCallback() {
    this.events?.abort();
    this.observer?.disconnect();
    this.querySelector('video')?.pause();
  }
}

if (!customElements.get('case-strip')) customElements.define('case-strip', CaseStrip);
if (!customElements.get('case-reel')) customElements.define('case-reel', CaseReel);

let stopReveals: (() => void) | undefined;
function revealCase() {
  stopReveals?.();
  const article = document.querySelector('.portfolio-case');
  if (!article || reduced.matches) return;
  const animations = new Set<Animation>();
  const phrases = new Set<SplitText>();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (entry.target.hasAttribute('data-phrase')) {
        const split = SplitText.create(entry.target as HTMLElement, { type: 'lines', mask: 'lines' });
        phrases.add(split);
        gsap.from(split.lines, {
          yPercent: 104, stagger: .03, duration: .9, ease: 'power3.out',
          onComplete: () => { split.revert(); phrases.delete(split); },
        });
      } else {
        const effect = entry.target.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], {
          duration: 900, easing: 'cubic-bezier(.22,1,.36,1)',
        });
        animations.add(effect);
        effect.onfinish = () => animations.delete(effect);
      }
    }
  }, { rootMargin: '0px 0px 5% 0px' });
  article.querySelectorAll('[data-case-media], [data-phrase]').forEach(element => observer.observe(element));
  stopReveals = () => {
    observer.disconnect();
    animations.forEach(effect => effect.cancel());
    phrases.forEach(split => { gsap.killTweensOf(split.lines); split.revert(); });
    stopReveals = undefined;
  };
}

document.addEventListener('astro:page-load', revealCase);
document.addEventListener('astro:before-swap', () => stopReveals?.());
reduced.addEventListener('change', revealCase);
