import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
let release: (() => void) | undefined;

function setupHome() {
  release?.();
  const root = document.querySelector<HTMLElement>('[data-isa-home]');
  if (!root) return;
  const hero = root.querySelector<HTMLElement>('.home-hero')!;
  const gallery = root.querySelector<HTMLElement>('[data-home-frame]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const animation = gsap.matchMedia();
  let slides = Array.from(gallery.querySelectorAll<HTMLElement>('[data-slide]'));
  let current = 0;
  let requested = 0;
  let active = false;
  let paused = false;
  let rotating: number | undefined;
  let introDone = false;
  const toggle = root.querySelector<HTMLButtonElement>('[data-pause-slides]')!;
  const pauseLabel = toggle.getAttribute('aria-label')!;
  const template = gallery.querySelector<HTMLTemplateElement>('[data-home-frames]')!;

  function loadFrames() {
    if (slides.length > 1) return;
    gallery.appendChild(template.content.cloneNode(true));
    slides = Array.from(gallery.querySelectorAll<HTMLElement>('[data-slide]'));
  }

  function showFrame(next: number) {
    if (next === requested) return;
    requested = next;
    const img = slides[next].querySelector('img')!;
    const reveal = () => {
      if (requested !== next || controller.signal.aborted) return;
      slides[current].hidden = true;
      slides[next].hidden = false;
      current = next;
    };
    if (img.complete && img.naturalWidth > 0) reveal();
    else {
      img.loading = 'eager';
      img.decode().then(reveal).catch(() => { if (requested === next) requested = current; });
    }
  }

  function refreshRotation() {
    window.clearInterval(rotating);
    const allow = !finePointer.matches && !reduced.matches && introDone;
    toggle.hidden = !allow;
    if (allow && active && !paused && !document.hidden) {
      loadFrames();
      rotating = window.setInterval(() => showFrame((current + 1) % slides.length), 1500);
    }
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? toggle.dataset.playLabel! : pauseLabel);
    toggle.firstElementChild!.textContent = paused ? '▶' : 'Ⅱ';
    refreshRotation();
  }, options);

  const onPointer = (event: PointerEvent) => {
    if (!finePointer.matches || reduced.matches) return;
    loadFrames();
    const rect = gallery.getBoundingClientRect();
    const section = Math.floor((event.clientX - rect.left) / rect.width * slides.length);
    showFrame(Math.max(0, Math.min(slides.length - 1, section)));
  };
  gallery.addEventListener('pointermove', onPointer, options);
  gallery.addEventListener('pointerleave', () => showFrame(0), options);
  document.addEventListener('visibilitychange', refreshRotation, options);
  finePointer.addEventListener('change', refreshRotation, options);
  reduced.addEventListener('change', () => { showFrame(0); refreshRotation(); }, options);
  const observer = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
    refreshRotation();
  }, { threshold: .45 });
  observer.observe(gallery);

  animation.add('(prefers-reduced-motion: no-preference)', () => {
    const isAtTop = window.scrollY < 35 && !location.hash;
    let played = true;
    try {
      played = sessionStorage.getItem('isabelly-home-intro') === '1';
      if (isAtTop) sessionStorage.setItem('isabelly-home-intro', '1');
    } catch { /* A visita funciona com armazenamento desativado. */ }
    const local = new AbortController();
    const inlet = root.querySelector<HTMLTemplateElement>('#home-intro-content')!;
    let overlay: HTMLElement | null = null;
    const markReady = () => {
      overlay?.remove();
      overlay = null;
      introDone = true;
      refreshRotation();
    };
    if (isAtTop && !played) {
      overlay = inlet.content.firstElementChild!.cloneNode(true) as HTMLElement;
      document.body.append(overlay);
      const tl = gsap.timeline({ onComplete: markReady });
      const greeting = overlay.querySelector('.intro-greeting')!;
      tl.from(greeting, { y: 40, opacity: 0, duration: .48, ease: 'power3.out' }, .12)
        .to(greeting, { y: '-18vh', duration: .7, ease: 'power2.inOut' }, .4)
        .to(greeting.querySelectorAll('i'), { y: -20, duration: .23, repeat: 1, yoyo: true, stagger: .1 }, .36)
        .to(greeting.querySelector('i:first-of-type'), { xPercent: 119, duration: .46 }, .48)
        .to(greeting.querySelector('i:last-of-type'), { xPercent: -119, duration: .46 }, .48)
        .to(greeting, { opacity: 0, duration: .25 }, 1.1)
        .to(overlay.querySelectorAll('.intro-bubbles i'), { scale: 1.32, stagger: { amount: .23, from: 'center' }, duration: .56, ease: 'power2.inOut' }, .94)
        .to(overlay, { opacity: 0, duration: .31 }, 1.68)
        .from(root.querySelector('.hero-frame-content'), { clipPath: 'inset(47% 47%)', scale: 1.08, duration: .86, ease: 'power3.out' }, 1.72)
        .from(root.querySelector('.hero-vline'), { scaleY: 0, duration: .78 }, 1.75)
        .from(root.querySelector('.hero-hline'), { scaleX: 0, duration: .78 }, 1.75)
        .from(root.querySelectorAll('.hero-orbit'), { scale: .4, opacity: 0, stagger: .1, duration: .79 }, 1.78)
        .from(root.querySelectorAll('.hero-index a'), { y: 20, opacity: 0, stagger: .05, duration: .46 }, 1.92)
        .from(root.querySelector('.hero-first > span'), { xPercent: 45, opacity: 0, duration: .92, ease: 'power2.out' }, 2.17)
        .from(root.querySelector('.hero-last > span'), { xPercent: -45, opacity: 0, duration: .92, ease: 'power2.out' }, 2.17)
        .from(root.querySelectorAll('.hero-bar, .hero-lower, .hero-edition, .hero-profession'), { y: 8, opacity: 0, stagger: .045, duration: .55 }, 2.42);
      window.addEventListener('keydown', () => tl.progress(1), { once: true, signal: local.signal });
      window.addEventListener('wheel', () => tl.progress(1), { once: true, passive: true, signal: local.signal });
    } else {
      if (isAtTop) gsap.from(root.querySelector('.hero-name'), { y: 7, opacity: .55, duration: .55 });
      markReady();
    }

    const splits: SplitText[] = [];
    const lettering = root.querySelector('.service-lettering')!;
    const reveal = gsap.timeline({
      scrollTrigger: { trigger: lettering, start: 'top 75%', once: true },
    });
    lettering.querySelectorAll('.service-line').forEach((line, i) => {
      const characters = Array.from(line.querySelectorAll('[data-letters]')).flatMap(item => {
        const split = SplitText.create(item, { type: 'chars', aria: 'none' });
        splits.push(split);
        return split.chars;
      });
      reveal.from(characters, { x: 50, opacity: 0, duration: .8, ease: 'power3.out', stagger: .025 }, i * .15);
    });
    reveal.from(lettering.querySelector('.service-star'), { rotate: 180, opacity: 0, duration: .75 }, .2)
      .from(lettering.querySelector('.service-hand path'), { strokeDasharray: 1, strokeDashoffset: 1, duration: .9 }, .65)
      .from(lettering.querySelector('.service-amp span + span'), { x: 22, rotation: -35, opacity: 0, duration: .6 }, .6);

    const sections = root.querySelectorAll<HTMLElement>('[data-feature]');
    sections.forEach(section => {
      const range = { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true };
      gsap.fromTo(section.querySelectorAll('.feature-art img,.feature-detail img'), { scale: 1.17, yPercent: -7 }, {
        yPercent: 7, ease: 'none', scrollTrigger: range,
      });
      gsap.fromTo(section.querySelector('.feature-initial'), { y: -24 }, { y: 24, scrollTrigger: range });
      gsap.fromTo(section.querySelector('.feature-right'), { '--colour-scale': 0 }, {
        '--colour-scale': 1, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'center 85%', once: true },
      });
    });
    return () => {
      local.abort();
      overlay?.remove();
      splits.forEach(split => split.revert());
      introDone = true;
      refreshRotation();
    };
  }, root);

  animation.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
    const effects = [
      ['.hero-portrait-drift', -12], ['.hero-name', 20], ['.hero-orbit-system', -6],
    ] as const;
    const drifts = effects.map(([selector, distance]) => {
      const el = root.querySelector(selector);
      return {
        distance,
        x: gsap.quickTo(el, 'x', { duration: .6, ease: 'power2.out' }),
        y: gsap.quickTo(el, 'y', { duration: .6, ease: 'power2.out' }),
      };
    });
    const move = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 2 - 1;
      const y = (event.clientY - rect.top) / rect.height * 2 - 1;
      drifts.forEach(d => { d.x(x * d.distance); d.y(y * d.distance); });
    };
    const centre = () => drifts.forEach(d => { d.x(0); d.y(0); });
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', centre);
    return () => {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', centre);
    };
  }, root);
  release = () => {
    controller.abort();
    observer.disconnect();
    animation.revert();
    window.clearInterval(rotating);
    release = undefined;
  };
}

// O evento também cobre a primeira navegação com o ClientRouter do Astro.
document.addEventListener('astro:page-load', setupHome);
document.addEventListener('astro:before-swap', () => release?.());
if (!document.querySelector('meta[name="astro-view-transitions-enabled"]')) setupHome();
