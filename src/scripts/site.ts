import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let dispose: (() => void) | undefined;
let curtainActive = false;

function bindPage() {
  dispose?.();
  const controller = new AbortController();
  const { signal } = controller;
  const cleaners: (() => void)[] = [];
  const header = document.querySelector<HTMLElement>('.site-header');
  const menu = document.querySelector<HTMLDetailsElement>('.mobile-menu');
  const summary = menu?.querySelector<HTMLElement>('summary');
  const clocks = document.querySelectorAll<HTMLTimeElement>('[data-clock]');
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const updateClock = () => {
    const now = new Date();
    clocks.forEach((el) => {
      el.dateTime = now.toISOString();
      el.textContent = fmt.format(now);
    });
  };
  updateClock();
  const interval = window.setInterval(updateClock, 15000);
  const smooth = reduced.matches
    ? null
    : new Lenis({
        lerp: 0.1,
        // O Astro cuida das âncoras e do histórico de navegação no índice do Sobre.
        anchors: !document.querySelector('.about-index'),
        allowNestedScroll: true,
      });
  if (smooth) {
    smooth.on('scroll', ScrollTrigger.update);
    const tick = (seconds: number) => smooth.raf(seconds * 1000);
    gsap.ticker.add(tick);
    cleaners.push(() => {
      gsap.ticker.remove(tick);
      smooth.destroy();
    });
  }
  let lastTop = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const y = Math.max(0, window.scrollY);
      if (Math.abs(y - lastTop) < 6) return;
      header?.classList.toggle('is-away', y > 120 && y > lastTop && !menu?.open);
      lastTop = y;
    },
    { passive: true, signal },
  );
  menu?.addEventListener(
    'toggle',
    () => {
      if (!summary) return;
      summary.setAttribute('aria-expanded', String(menu.open));
      summary.setAttribute(
        'aria-label',
        (menu.open ? summary.dataset.closeLabel : summary.dataset.openLabel) || 'Menu',
      );
      if (menu.open) {
        smooth?.stop();
        menu.querySelector<HTMLAnchorElement>('nav a')?.focus();
      } else smooth?.start();
    },
    { signal },
  );
  const mq = matchMedia('(max-width:767px)');
  mq.addEventListener(
    'change',
    () => {
      if (!mq.matches && menu) menu.open = false;
    },
    { signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (!menu?.open) return;
      if (event.key === 'Escape') {
        menu.open = false;
        summary?.focus();
        return;
      }
      if (event.key === 'Tab') {
        const links = [summary, ...menu.querySelectorAll<HTMLElement>('a')].filter(
          (el): el is HTMLElement => !!el,
        );
        const current = links.indexOf(document.activeElement as HTMLElement);
        if (event.shiftKey && current <= 0) {
          event.preventDefault();
          links.at(-1)?.focus();
        } else if (!event.shiftKey && (current === -1 || current === links.length - 1)) {
          event.preventDefault();
          links[0]?.focus();
        }
      }
    },
    { signal },
  );
  menu?.addEventListener(
    'click',
    (event) => {
      if ((event.target as Element).closest('a')) menu.open = false;
    },
    { signal },
  );
  const toast = document.querySelector<HTMLElement>('.toast');
  let toastTimer = 0;
  document.addEventListener(
    'click',
    async (event) => {
      const link = (event.target as Element).closest('[data-copy-email]');
      if (!link || !toast) return;
      event.preventDefault();
      const email = 'limaisabelly285@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        toast.textContent = toast.dataset.copied!;
      } catch {
        toast.textContent = email;
        const range = document.createRange();
        range.selectNodeContents(toast);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => (toast.textContent = ''), 3200);
    },
    { signal },
  );
  const cat = document.querySelector<HTMLElement>('.cat-cursor');
  if (cat && !reduced.matches && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const label = cat.querySelector<HTMLElement>('.cursor-label')!;
    const labels: Record<string, string> =
      document.body.dataset.lang === 'pt'
        ? { case: 'ver case', drag: 'arraste', sound: 'som' }
        : { case: 'view case', drag: 'drag', sound: 'sound' };
    const x = gsap.quickTo(cat, 'x', { duration: 0.16, ease: 'power3.out' });
    const y = gsap.quickTo(cat, 'y', { duration: 0.16, ease: 'power3.out' });
    document.addEventListener(
      'pointermove',
      (e) => {
        const target = e.target;
        if (
          e.pointerType !== 'mouse' ||
          !(target instanceof Element) ||
          target.closest('input,textarea,select,[contenteditable=true]')
        ) {
          document.documentElement.classList.remove('has-cursor');
          return;
        }
        if (!document.documentElement.classList.contains('has-cursor')) {
          gsap.set(cat, { x: e.clientX, y: e.clientY });
          document.documentElement.classList.add('has-cursor');
        }
        x(e.clientX);
        y(e.clientY);
        cat.toggleAttribute('data-hover', !!target.closest('a,button,summary'));
        label.textContent =
          labels[target.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? ''] || '';
      },
      { signal, passive: true },
    );
    document.addEventListener(
      'pointerout',
      (e) => {
        if (!e.relatedTarget) document.documentElement.classList.remove('has-cursor');
      },
      { signal },
    );
    document.addEventListener('pointerdown', () => cat.toggleAttribute('data-down', true), { signal });
    document.addEventListener('pointerup', () => cat.removeAttribute('data-down'), { signal });
    cleaners.push(() => {
      gsap.killTweensOf(cat);
      document.documentElement.classList.remove('has-cursor');
    });
  }
  if (curtainActive) {
    const curtain = document.querySelector<HTMLElement>('.page-curtain');
    if (curtain && !reduced.matches)
      gsap.fromTo(
        curtain,
        { visibility: 'visible', yPercent: -101 },
        {
          yPercent: -202,
          duration: 0.45,
          ease: 'power3.inOut',
          onComplete: () => gsap.set(curtain, { clearProps: 'all' }),
        },
      );
    curtainActive = false;
  }
  dispose = () => {
    controller.abort();
    clearInterval(interval);
    clearTimeout(toastTimer);
    cleaners.forEach((clean) => clean());
    dispose = undefined;
  };
}
document.addEventListener('astro:before-preparation', (event) => {
  const nav = event as TransitionBeforePreparationEvent;
  if (
    reduced.matches ||
    nav.from.pathname === nav.to.pathname ||
    (nav.sourceElement instanceof Element && nav.sourceElement.closest('[data-cursor="case"]'))
  )
    return;
  const curtain = document.querySelector<HTMLElement>('.page-curtain');
  if (!curtain) return;
  const load = nav.loader;
  nav.loader = async () => {
    const motion = gsap.fromTo(
      curtain,
      { visibility: 'visible', y: '101%' },
      { y: '0%', duration: 0.42, ease: 'power3.inOut' },
    );
    try {
      await Promise.all([motion.then(), load()]);
      curtainActive = true;
    } catch (error) {
      gsap.set(curtain, { clearProps: 'all' });
      throw error;
    }
    if (nav.signal.aborted) {
      curtainActive = false;
      gsap.set(curtain, { clearProps: 'all' });
    }
  };
});
document.addEventListener('astro:before-swap', () => dispose?.());
document.addEventListener('astro:page-load', bindPage);
reduced.addEventListener('change', bindPage);
if (document.readyState !== 'loading') bindPage();
