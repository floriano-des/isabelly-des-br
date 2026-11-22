import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

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
