/* ============================================================
   ISABELLY LIMA — PORTFOLIO
   main.js — Shared JS
   ============================================================ */

'use strict';

/* ── Static UI strings ──────────────────────────────────────── */
const UI_STRINGS = {
  processoTitle:   'Processo criativo',
  prevLabel:       '← Projeto anterior',
  nextLabel:       'Próximo projeto →',
  emptyGrid:       'Projetos em breve.',
  caseErro:        'Esse projeto não existe ou foi removido.',
};

/* ── Header Scroll ──────────────────────────────────────────── */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ── Nav Toggle (hamburger) ─────────────────────────────────── */
function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function openNav() {
    toggle.classList.add('open');
    nav.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    toggle.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    if (toggle.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Close on any nav link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.classList.contains('open')) {
      closeNav();
    }
  });
}

/* ── Active Nav ─────────────────────────────────────────────── */
function initActiveNav() {
  const links = document.querySelectorAll('.site-nav a');
  if (!links.length) return;

  const path = window.location.pathname;
  // Normalize: get the last meaningful segment
  const fileName = path.split('/').pop() || 'index.html';
  const isInProjetos = path.includes('/projetos/');

  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    const hrefFile = href.split('/').pop();

    let isActive = false;

    if (isInProjetos && (hrefFile === 'projetos.html' || href.includes('projetos'))) {
      isActive = true;
    } else if (!isInProjetos && hrefFile === fileName) {
      isActive = true;
    }

    if (isActive) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ── Create Card Element ────────────────────────────────────── */
/**
 * Creates an <a class="card"> DOM element for a given project.
 *
 * @param {Object} projeto  - Project data object from projetos.js
 * @param {string} root     - Path prefix for hrefs and image src
 *                            e.g. '' for root pages, '../' for /projetos/ pages
 * @returns {HTMLAnchorElement}
 */
function createCard(projeto, root) {
  const card = document.createElement('a');
  card.className = 'card-v2';
  card.href = root + 'projetos/case.html?slug=' + projeto.slug;

  const titulo = projeto.titulo;
  const categoria = projeto.categoria;
  const thumbSrc = (projeto.imagens && projeto.imagens.length > 0)
    ? root + encodeURI(projeto.imagens[0]) : '';

  card.innerHTML = `
    ${thumbSrc
      ? `<img class="card-v2__img" src="${thumbSrc}" alt="${escapeHtml(titulo)}" loading="lazy">`
      : `<div class="card-v2__img" style="background:var(--color-surface2)"></div>`
    }
    <div class="card-v2__overlay">
      <p class="card-v2__name">${escapeHtml(titulo)}</p>
      <div class="card-v2__footer">
        <span class="card-v2__tag">${escapeHtml(categoria)}</span>
        <span class="card-v2__arrow">
          <svg width="16" height="16" viewBox="0 0 21 21" fill="none">
            <path d="M20.5 2C20.5 1.17 19.83 0.5 19 0.5L5.5 0.5C4.67 0.5 4 1.17 4 2C4 2.83 4.67 3.5 5.5 3.5H17.5V15.5C17.5 16.33 18.17 17 19 17C19.83 17 20.5 16.33 20.5 15.5L20.5 2ZM3.06 20.06L20.06 3.06L17.94 0.94L0.94 17.94L3.06 20.06Z" fill="currentColor"/>
          </svg>
        </span>
      </div>
    </div>`;
  return card;
}

/* ── Escape HTML helper ─────────────────────────────────────── */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Get root prefix from data attribute ────────────────────── */
function getRoot() {
  return document.documentElement.dataset.root || '';
}

/* ── Render Destaque (Featured Projects) ────────────────────── */
/**
 * Renders only projects where destaque === true into the given container.
 *
 * @param {string} containerId - ID of the container element
 */
function renderDestaque(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Expect projetos array from projetos.js
  if (typeof projetos === 'undefined' || !Array.isArray(projetos)) {
    container.innerHTML = '';
    return;
  }

  const root = getRoot();
  const destaque = projetos.filter(p => p.destaque === true);

  container.innerHTML = '';

  if (destaque.length === 0) {
    container.innerHTML = '<p style="color: var(--color-muted); grid-column: 1/-1;">Projetos em breve.</p>';
    return;
  }

  destaque.forEach(projeto => {
    container.appendChild(createCard(projeto, root));
  });
}

/* ── Render All Projetos ────────────────────────────────────── */
/**
 * Renders all projects (optionally filtered by categoria) into the given container.
 *
 * @param {string} containerId - ID of the container element
 * @param {string|null} filter - Optional categoria string to filter by
 */
function renderAllProjetos(containerId, filter) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (typeof projetos === 'undefined' || !Array.isArray(projetos)) {
    container.innerHTML = '';
    return;
  }

  const root = getRoot();

  let list = [...projetos];

  // Filter by categoria if provided
  if (filter && filter !== 'todos') {
    list = list.filter(p =>
      p.categoria && p.categoria.toLowerCase() === filter.toLowerCase()
    );
  }

  // Sort by ano descending
  list.sort((a, b) => (b.ano || 0) - (a.ano || 0));

  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = `<p style="color: var(--color-muted); grid-column: 1/-1;">${UI_STRINGS.emptyGrid}</p>`;
    return;
  }

  list.forEach(projeto => {
    container.appendChild(createCard(projeto, root));
  });
}

/* ── Portfolio Grid (shared: index.html + projetos.html) ─────── */
/**
 * Generates filter buttons dynamically from projetos.js categories,
 * renders the full grid, and wires click events.
 * Both index.html and projetos.html use this same function.
 *
 * @param {string} containerId - ID of the <div> that receives the cards
 */
function initPortfolioGrid(containerId) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  if (typeof projetos === 'undefined' || !Array.isArray(projetos)) return;

  const root = getRoot();
  const arrowSvg = '<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.5 2C20.5 1.17157 19.8284 0.5 19 0.5L5.5 0.499999C4.67157 0.499999 4 1.17157 4 2C4 2.82843 4.67157 3.5 5.5 3.5H17.5V15.5C17.5 16.3284 18.1716 17 19 17C19.8284 17 20.5 16.3284 20.5 15.5L20.5 2ZM3.06066 20.0607L20.0607 3.06066L17.9393 0.939339L0.93934 17.9393L3.06066 20.0607Z" fill="currentColor"/></svg>';

  function renderGrid(filtro) {
    var list = projetos.slice();
    if (filtro && filtro !== 'todos') {
      list = list.filter(function(p) { return p.categoria === filtro; });
    }
    list.sort(function(a, b) { return (b.ano || 0) - (a.ano || 0); });
    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = '<p style="color:var(--color-muted);grid-column:1/-1;">Nenhum projeto encontrado.</p>';
      return;
    }
    list.forEach(function(p) {
      var a = document.createElement('a');
      a.href = root + 'projetos/case.html?slug=' + p.slug;
      a.className = 'cs_portfolio cs_style_1';
      a.innerHTML = '<img src="' + root + encodeURI(p.imagens[0]) + '" alt="' + escapeHtml(p.titulo) + '" loading="lazy">'
        + '<span class="cs_portfolio_btn cs_semibold"><span>' + escapeHtml(p.titulo) + '</span>' + arrowSvg + '</span>';
      grid.appendChild(a);
    });
  }

  // Generate filter buttons from unique categories (in order of appearance)
  const wrap = document.querySelector('.cs_filtros_wrap');
  if (wrap) {
    const cats = [];
    projetos.forEach(function(p) {
      if (p.categoria && !cats.includes(p.categoria)) cats.push(p.categoria);
    });
    wrap.innerHTML = '<button class="cs_filtro_btn cs_filtro_btn--active" data-filtro="todos">Todos</button>';
    cats.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'cs_filtro_btn';
      btn.dataset.filtro = cat;
      btn.textContent = cat;
      wrap.appendChild(btn);
    });

    wrap.addEventListener('click', function(e) {
      var btn = e.target.closest('.cs_filtro_btn');
      if (!btn) return;
      wrap.querySelectorAll('.cs_filtro_btn').forEach(function(b) { b.classList.remove('cs_filtro_btn--active'); });
      btn.classList.add('cs_filtro_btn--active');
      renderGrid(btn.dataset.filtro);
      grid.style.opacity = '0';
      setTimeout(function() { grid.style.opacity = '1'; grid.style.transition = 'opacity 0.25s'; }, 50);
    });
  }

  renderGrid('todos');
}

/* ── Video helper ─────────────────────────────────────────────── */
function isVideoSrc(src) {
  return /\.mp4(\?.*)?$/i.test(src) || src.includes('youtube.com/embed/');
}

/* ── Lightbox ────────────────────────────────────────────────── */
/**
 * Initialises the lightbox for gallery images (images only, not videos).
 * @param {Array<{src: string, alt: string}>} images
 */
function initLightbox(images) {
  const lb        = document.getElementById('lightbox');
  const backdrop  = document.getElementById('lightbox-backdrop');
  const img       = document.getElementById('lightbox-img');
  const counter   = document.getElementById('lightbox-counter');
  const btnClose  = document.getElementById('lightbox-close');
  const btnPrev   = document.getElementById('lightbox-prev');
  const btnNext   = document.getElementById('lightbox-next');

  if (!lb || !img) return;

  let current = 0;
  let touchStartX = 0;

  /* ── Open / Close ─────────────────────────────────────────── */
  function open(index) {
    current = index;
    updateImage(false);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── Navigate ─────────────────────────────────────────────── */
  function goTo(index) {
    if (index === current) return;

    img.classList.add('is-changing');

    setTimeout(() => {
      current = (index + images.length) % images.length;
      updateImage(true);
    }, 160);
  }

  function updateImage(afterChange) {
    const { src, alt } = images[current];
    img.src  = src;
    img.alt  = alt;

    if (afterChange) {
      // Remove class after next paint so transition re-triggers
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          img.classList.remove('is-changing');
        });
      });
    }

    counter.textContent = (current + 1) + ' / ' + images.length;

    // Hide nav buttons if only one image
    const showNav = images.length > 1;
    btnPrev.style.display = showNav ? '' : 'none';
    btnNext.style.display = showNav ? '' : 'none';
  }

  /* ── Event listeners ──────────────────────────────────────── */
  btnClose.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   goTo(current - 1);
    if (e.key === 'ArrowRight')  goTo(current + 1);
  });

  // Touch swipe
  lb.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lb.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goTo(current + 1);
    else           goTo(current - 1);
  }, { passive: true });

  /* ── Wire gallery items (somente imagens, não vídeos) ────── */
  const galeriaEl = document.getElementById('case-galeria');
  if (!galeriaEl) return;

  galeriaEl.querySelectorAll('.galeria-item:not(.galeria-item--video)').forEach((item, i) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', 'Ampliar imagem ' + (i + 1));

    item.addEventListener('click', () => open(i));

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i);
      }
    });
  });
}

/* ── Case Page Renderer ──────────────────────────────────────── */
function renderCase() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const root = document.documentElement.dataset.root || '';

  if (!slug || typeof projetos === 'undefined') { showCaseErro(); return; }

  const projeto = projetos.find(p => p.slug === slug);
  if (!projeto) { showCaseErro(); return; }

  const ui = UI_STRINGS;

  const titulo    = projeto.titulo;
  const categoria = projeto.categoria;
  const descCurta = projeto.descricao_curta;
  const descLonga = projeto.descricao_longa;

  // Atualiza <title> e meta description
  document.title = titulo + ' — Isabelly Lima';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', descCurta);

  // Preenche hero
  document.getElementById('case-categoria').textContent = categoria;
  document.getElementById('case-ano').textContent = projeto.ano;
  document.getElementById('case-titulo').textContent = titulo;
  document.getElementById('case-desc-curta').textContent = descCurta;

  // Ferramentas
  const toolsEl = document.getElementById('case-ferramentas');
  toolsEl.innerHTML = projeto.ferramentas.map(t => `<span class="tag">${t}</span>`).join('');

  // ── Cover (primeiro item) — exibido em destaque no topo ──────
  const coverEl = document.getElementById('case-cover');
  const coverSrc = projeto.imagens[0];
  if (coverEl && coverSrc) {
    if (isVideoSrc(coverSrc)) {
      const coverVideo = document.createElement('video');
      coverVideo.src = root + encodeURI(coverSrc);
      coverVideo.className = 'case-cover__media';
      coverVideo.autoplay = true;
      coverVideo.muted = true;
      coverVideo.loop = true;
      coverVideo.setAttribute('playsinline', '');
      coverVideo.setAttribute('controls', '');
      // Ajusta o container ao formato real do vídeo
      coverVideo.addEventListener('loadedmetadata', () => {
        if (coverVideo.videoHeight > coverVideo.videoWidth) {
          coverEl.classList.add('case-cover--portrait');
        }
      });
      coverEl.innerHTML = '';
      coverEl.appendChild(coverVideo);
    } else {
      coverEl.innerHTML = `<img src="${root}${encodeURI(coverSrc)}" alt="${escapeHtml(titulo)}" class="case-cover__media" loading="eager">`;
    }
  }

  // ── Galeria (imagens restantes, índice 1 em diante) ───────────
  const galeriaEl   = document.getElementById('case-galeria');
  const galleryItems = projeto.imagens.slice(1);

  galeriaEl.innerHTML = '';
  galleryItems.forEach((src, i) => {
    const figure = document.createElement('figure');
    figure.className = 'galeria-item';

    if (isVideoSrc(src) && !src.includes('youtube.com/embed/')) {
      figure.classList.add('galeria-item--video');
      const video = document.createElement('video');
      video.src = root + encodeURI(src);
      video.setAttribute('playsinline', '');
      video.setAttribute('controls', '');
      video.setAttribute('muted', '');
      video.setAttribute('loop', '');

      // Detecta orientação real do vídeo após carregar os metadados
      video.addEventListener('loadedmetadata', () => {
        if (video.videoHeight > video.videoWidth) {
          // Portrait (stories, reels 9:16)
          galeriaEl.classList.add('galeria--vertical');
          galeriaEl.classList.remove('galeria--single');
        } else {
          // Landscape
          galeriaEl.classList.add('galeria--landscape');
        }
      });

      figure.appendChild(video);
    } else if (src.includes('youtube.com/embed/')) {
      figure.classList.add('galeria-item--video', 'galeria-item--youtube');
      const iframe = document.createElement('iframe');
      iframe.src = src + '?rel=0&playsinline=1';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      figure.appendChild(iframe);
    } else {
      const img = document.createElement('img');
      img.src = root + encodeURI(src);
      img.alt = escapeHtml(titulo) + ' — imagem ' + (i + 1);
      img.loading = 'lazy';

      // Detect wide images (banners, website screenshots) — ratio > 2.0 → full row
      const checkRatio = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          if (img.naturalWidth / img.naturalHeight > 2.0) {
            figure.classList.add('galeria-item--wide');
          }
        }
      };
      if (img.complete) {
        checkRatio();
      } else {
        img.addEventListener('load', checkRatio);
      }

      figure.appendChild(img);
    }

    galeriaEl.appendChild(figure);
  });

  // Lightbox: apenas imagens (sem vídeos ou embeds)
  const lightboxImages = galleryItems
    .filter(src => !isVideoSrc(src))
    .map((src, i) => ({
      src: root + encodeURI(src),
      alt: titulo + ' — imagem ' + (i + 1),
    }));
  if (lightboxImages.length > 0) initLightbox(lightboxImages);

  // Processo criativo
  const processoEl = document.getElementById('case-processo');
  processoEl.innerHTML = `
    <div class="case-processo__texto">
      <span class="section-eyebrow">${ui.processoTitle}</span>
      <h2>${escapeHtml(titulo)}</h2>
      <p>${escapeHtml(descLonga)}</p>
    </div>`;

  // Navegação prev/next
  const idx = projetos.indexOf(projeto);
  const prev = projetos[idx - 1];
  const next = projetos[idx + 1];
  const navEl = document.getElementById('case-nav-grid');

  const prevNome = prev ? prev.titulo : '';
  const nextNome = next ? next.titulo : '';

  navEl.innerHTML = `
    ${prev ? `<a href="case.html?slug=${prev.slug}" class="case-nav__item case-nav__item--prev">
      <span class="case-nav__label">${ui.prevLabel}</span>
      <span class="case-nav__nome">${escapeHtml(prevNome)}</span>
    </a>` : '<div></div>'}
    ${next ? `<a href="case.html?slug=${next.slug}" class="case-nav__item case-nav__item--next">
      <span class="case-nav__label">${ui.nextLabel}</span>
      <span class="case-nav__nome">${escapeHtml(nextNome)}</span>
    </a>` : '<div></div>'}`;
}

function showCaseErro() {
  const main = document.getElementById('case-main');
  const erro = document.getElementById('case-erro');
  if (main) main.style.display = 'none';
  if (erro) erro.style.display = 'block';
}

/* ── DOMContentLoaded ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Preloader — handled by assets/js/main.js via jQuery on document.ready

  initHeaderScroll();
  initNavToggle();
  initActiveNav();

});
