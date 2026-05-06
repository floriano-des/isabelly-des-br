(function ($) {
  'use strict';

  /*
  |--------------------------------------------------------------------------
  | Template Name: Partosa
  | Author: Laralink
  | Version: 1.0.0
  |--------------------------------------------------------------------------
  |--------------------------------------------------------------------------
  | TABLE OF CONTENTS:
  |--------------------------------------------------------------------------
  |
  | 1. Preloader
  | 2. Mobile Menu
  | 3. Sticky Header
  | 4. Dynamic Background
  | 5. Modal Video
  | 6. Review
  | 7. Hobble Effect
  | 8. Light Gallery
  |
  */

  /*--------------------------------------------------------------
    Scripts initialization
  --------------------------------------------------------------*/
  $.exists = function (selector) {
    return $(selector).length > 0;
  };

  $(document).ready(function () {
    preloader();
  });

  $(function () {
    mainNav();
    stickyHeader();
    dynamicBackground();
    modalVideo();
    review();
    hobbleEffect();
    lightGallery();
    particles();
    rippleInit();
    if ($.exists('.wow')) {
      new WOW().init();
    }
  });

  /*--------------------------------------------------------------
    1. Preloader
  --------------------------------------------------------------*/
  function preloader() {
    $('.cs_preloader_in').fadeOut(150);
    $('.cs_preloader').delay(50).fadeOut(200);
  }

  /*--------------------------------------------------------------
    2. Mobile Menu
  --------------------------------------------------------------*/
  function mainNav() {
    $('.cs_nav').append('<span class="cs_menu_toggle"><span></span></span>');
    $('.menu-item-has-children').append(
      '<span class="cs_menu_dropdown_toggle"><span></span></span>',
    );
    $('.cs_menu_toggle').on('click', function () {
      $(this)
        .toggleClass('cs_toggle_active')
        .siblings('.cs_nav_list')
        .toggleClass('cs_active');
    });
    $('.cs_nav_list a').on('click', function () {
      $('.cs_nav_list').removeClass('cs_active');
      $('.cs_menu_toggle').removeClass('cs_toggle_active');
    });
    $('.cs_menu_toggle')
      .parents('body')
      .find('.cs_side_header')
      .addClass('cs_has_main_nav');
    $('.cs_menu_dropdown_toggle').on('click', function () {
      $(this).toggleClass('active').siblings('ul').slideToggle();
      $(this).parent().toggleClass('active');
    });
  }

  /*--------------------------------------------------------------
    3. Sticky Header
  --------------------------------------------------------------*/
  function stickyHeader() {
    var $window = $(window);
    var lastScrollTop = 0;
    var $header = $('.cs_sticky_header');
    var headerHeight = $header.outerHeight() + 30;

    $window.scroll(function () {
      var windowTop = $window.scrollTop();

      if (windowTop >= headerHeight) {
        $header.addClass('cs_gescout_sticky');
      } else {
        $header.removeClass('cs_gescout_sticky');
        $header.removeClass('cs_gescout_show');
      }

      if ($header.hasClass('cs_gescout_sticky')) {
        if (windowTop < lastScrollTop) {
          $header.addClass('cs_gescout_show');
        } else {
          $header.removeClass('cs_gescout_show');
        }
      }

      lastScrollTop = windowTop;
    });
  }

  /*--------------------------------------------------------------
    4. Dynamic Background
  --------------------------------------------------------------*/
  function dynamicBackground() {
    $('[data-src]').each(function () {
      var src = $(this).attr('data-src');
      $(this).css({
        'background-image': 'url(' + src + ')',
      });
    });
  }

  /*--------------------------------------------------------------
    5. Modal Video
  --------------------------------------------------------------*/
  function modalVideo() {
    if ($.exists('.cs_video_open')) {
      $('body').append(`
        <div class="cs_video_popup">
          <div class="cs_video_popup-overlay"></div>
          <div class="cs_video_popup-content">
            <div class="cs_video_popup-layer"></div>
            <div class="cs_video_popup_container">
              <div class="cs_video_popup-align">
                <div class="embed-responsive embed-responsive-16by9">
                  <iframe class="embed-responsive-item" src="about:blank"></iframe>
                </div>
              </div>
              <div class="cs_video_popup_close"></div>
            </div>
          </div>
        </div>
      `);
      $(document).on('click', '.cs_video_open', function (e) {
        e.preventDefault();
        var video = $(this).attr('href');

        $('.cs_video_popup_container iframe').attr('src', `${video}`);

        $('.cs_video_popup').addClass('active');
      });
      $('.cs_video_popup_close, .cs_video_popup-layer').on(
        'click',
        function (e) {
          $('.cs_video_popup').removeClass('active');
          $('html').removeClass('overflow-hidden');
          $('.cs_video_popup_container iframe').attr('src', 'about:blank');
          e.preventDefault();
        },
      );
    }
  }

  /*--------------------------------------------------------------
    6. Review
  --------------------------------------------------------------*/
  function review() {
    $('.cs_rating').each(function () {
      var review = $(this).data('rating');
      var reviewVal = review * 20 + '%';
      $(this).find('.cs_rating_percentage').css('width', reviewVal);
    });
  }

  /*--------------------------------------------------------------
    7. Hobble Effect
  --------------------------------------------------------------*/
  function hobbleEffect() {
    $(document)
      .on('mousemove', '.cs_hobble', function (event) {
        var halfW = this.clientWidth / 2;
        var halfH = this.clientHeight / 2;
        var coorX = halfW - (event.pageX - $(this).offset().left);
        var coorY = halfH - (event.pageY - $(this).offset().top);
        var degX1 = (coorY / halfH) * 8 + 'deg';
        var degY1 = (coorX / halfW) * -8 + 'deg';
        var degX3 = (coorY / halfH) * -15 + 'px';
        var degY3 = (coorX / halfW) * 15 + 'px';

        $(this)
          .find('.cs_hover_layer_1')
          .css('transform', function () {
            return (
              'perspective( 800px ) translate3d( 0, 0, 0 ) rotateX(' +
              degX1 +
              ') rotateY(' +
              degY1 +
              ')'
            );
          });
        $(this)
          .find('.cs_hover_layer_2')
          .css('transform', function () {
            return (
              'perspective( 800px ) translateX(' +
              degX3 +
              ') translateY(' +
              degY3 +
              ') scale(1.04)'
            );
          });
      })
      .on('mouseout', '.cs_hobble', function () {
        $(this).find('.cs_hover_layer_1').removeAttr('style');
        $(this).find('.cs_hover_layer_2').removeAttr('style');
      });
  }

  /*--------------------------------------------------------------
    8. Light Gallery
  --------------------------------------------------------------*/
  function lightGallery() {
    $('.cs_lightgallery').each(function () {
      $(this).lightGallery({
        selector: '.cs_lightbox_item',
        subHtmlSelectorRelative: false,
        thumbnail: true,
        mousewheel: true,
      });
    });
  }
  /*--------------------------------------------------------------
    9. particles
  --------------------------------------------------------------*/
  function particles() {
    if ($.exists('#particles-js')) {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: 355,
            density: {
              enable: true,
              value_area: 789.1476416322727,
            },
          },
          color: {
            value: '#ffffff',
          },
          shape: {
            type: 'circle',
            stroke: {
              width: 0,
              color: '#000000',
            },
            polygon: {
              nb_sides: 5,
            },
            image: {
              src: 'img/github.svg',
              width: 100,
              height: 100,
            },
          },
          opacity: {
            value: 0.48927153781200905,
            random: false,
            anim: {
              enable: true,
              speed: 0.6,
              opacity_min: 0,
              sync: false,
            },
          },
          size: {
            value: 2,
            random: true,
            anim: {
              enable: true,
              speed: 5,
              size_min: 0,
              sync: false,
            },
          },
          line_linked: {
            enable: false,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.2,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200,
            },
          },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'bubble',
            },
            onclick: {
              enable: true,
              mode: 'push',
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 400,
              line_linked: {
                opacity: 1,
              },
            },
            bubble: {
              distance: 83.91608391608392,
              size: 1,
              duration: 3,
              opacity: 1,
              speed: 3,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
            push: {
              particles_nb: 4,
            },
            remove: {
              particles_nb: 2,
            },
          },
        },
        retina_detect: true,
      });
    }
  }

  /*--------------------------------------------------------------
    10. Ripple
  --------------------------------------------------------------*/
  function rippleInit() {
    if ($.exists('.cs_ripple_version')) {
      $('.cs_ripple_version').each(function () {
        $('.cs_ripple_version').ripples({
          resolution: 512,
          dropRadius: 20,
          perturbance: 0.04,
        });
      });
    }
  }

  /*--------------------------------------------------------------
    22. Cursor Animation
  --------------------------------------------------------------*/
  $(function () {
    $('body').append('<span class="cs_cursor_lg d"></span>');
    $('body').append('<span class="cs_cursor_sm"></span>');
    $(
      '.cs_text_btn, .cs_site_header a, .cs_down_btn, .cs_social_btns a, .cs_menu_widget',
    ).on('mouseenter', function () {
      $('.cs_cursor_lg').addClass('opacity-0');
      $('.cs_cursor_sm').addClass('opacity-0');
    });
    $(
      '.cs_text_btn, .cs_site_header a, .cs_down_btn, .cs_social_btns a, .cs_menu_widget',
    ).on('mouseleave', function () {
      $('.cs_cursor_lg').removeClass('opacity-0');
      $('.cs_cursor_sm').removeClass('opacity-0');
    });
  });
  function cursorMovingAnimation(event) {
    try {
      const timing = gsap.timeline({
        defaults: {
          x: event.clientX,
          y: event.clientY,
        },
      });

      timing
        .to('.cs_cursor_lg', {
          ease: 'power2.out',
        })
        .to(
          '.cs_cursor_sm',
          {
            ease: 'power2.out',
          },
          '-=0.4',
        );
    } catch (err) {
      console.log(err);
    }
  }
  document.addEventListener('mousemove', cursorMovingAnimation);
})(jQuery); // End of use strict

/* ── Portfolio Grid — shared by index.html and projetos.html ──── */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initPortfolioGrid(containerId) {
  var grid = document.getElementById(containerId);
  if (!grid) return;
  if (typeof projetos === 'undefined' || !Array.isArray(projetos)) return;

  var arrowSvg = '<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.5 2C20.5 1.17157 19.8284 0.5 19 0.5L5.5 0.499999C4.67157 0.499999 4 1.17157 4 2C4 2.82843 4.67157 3.5 5.5 3.5H17.5V15.5C17.5 16.3284 18.1716 17 19 17C19.8284 17 20.5 16.3284 20.5 15.5L20.5 2ZM3.06066 20.0607L20.0607 3.06066L17.9393 0.939339L0.93934 17.9393L3.06066 20.0607Z" fill="currentColor"/></svg>';

  function renderGrid(filtro) {
    var list = projetos.slice();
    if (filtro && filtro !== 'todos') {
      list = list.filter(function(p) { return p.categoria === filtro; });
    }
    list.sort(function(a, b) { return (b.ano || 0) - (a.ano || 0); });
    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = '<p style="color:#888;grid-column:1/-1;">Nenhum projeto encontrado.</p>';
      return;
    }
    list.forEach(function(p) {
      var a = document.createElement('a');
      a.href = 'projetos/case.html?slug=' + p.slug;
      a.className = 'cs_portfolio cs_style_1';
      a.innerHTML = '<img src="' + encodeURI(p.imagens[0]) + '" alt="' + escapeHtml(p.titulo) + '" loading="lazy">'
        + '<span class="cs_portfolio_btn cs_semibold"><span>' + escapeHtml(p.titulo) + '</span>' + arrowSvg + '</span>';
      grid.appendChild(a);
    });
  }

  // Build filter buttons from categories in order of appearance
  var wrap = document.querySelector('.cs_filtros_wrap');
  if (wrap) {
    var cats = [];
    projetos.forEach(function(p) {
      if (p.categoria && cats.indexOf(p.categoria) === -1) cats.push(p.categoria);
    });
    wrap.innerHTML = '<button class="cs_filtro_btn cs_filtro_btn--active" data-filtro="todos">Todos</button>';
    cats.forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'cs_filtro_btn';
      btn.setAttribute('data-filtro', cat);
      btn.textContent = cat;
      wrap.appendChild(btn);
    });

    wrap.addEventListener('click', function(e) {
      var btn = e.target.closest ? e.target.closest('.cs_filtro_btn') : e.target;
      if (!btn || !btn.classList.contains('cs_filtro_btn')) return;
      wrap.querySelectorAll('.cs_filtro_btn').forEach(function(b) { b.classList.remove('cs_filtro_btn--active'); });
      btn.classList.add('cs_filtro_btn--active');
      renderGrid(btn.getAttribute('data-filtro'));
      grid.style.opacity = '0';
      setTimeout(function() { grid.style.opacity = '1'; grid.style.transition = 'opacity 0.25s'; }, 50);
    });
  }

  renderGrid('todos');
}
