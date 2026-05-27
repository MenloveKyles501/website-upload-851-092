
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    let index = 0;
    let timer;

    function show(nextIndex) {
      index = nextIndex;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    }

    function next() {
      show((index + 1) % slides.length);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      show(i);
      reset();
    }));

    function reset() {
      clearInterval(timer);
      timer = setInterval(next, 5200);
    }

    show(0);
    reset();
  }

  function initCatalogFilters() {
    const search = document.getElementById('catalogSearch');
    const year = document.getElementById('catalogYear');
    const summary = document.getElementById('filterSummary');
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const cards = Array.from(document.querySelectorAll('.movie-card[data-search]'));
    if (!search && !year && !cards.length) return;

    const state = {
      type: '全部',
      region: '全部',
      year: '全部',
      query: ''
    };

    function updateActive() {
      buttons.forEach(btn => {
        const group = btn.dataset.filterGroup;
        const value = btn.dataset.filterValue;
        const active = (group === 'type' && state.type === value) || (group === 'region' && state.region === value);
        btn.classList.toggle('is-active', active);
      });
    }

    function apply() {
      const q = state.query.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const text = card.dataset.search || '';
        const type = card.dataset.typeGroup || '';
        const region = card.dataset.regionGroup || '';
        const y = card.dataset.year || '';
        const ok = (!q || text.includes(q))
          && (state.type === '全部' || type === state.type)
          && (state.region === '全部' || region === state.region)
          && (state.year === '全部' || y === state.year);
        card.hidden = !ok;
        if (ok) visible += 1;
      });
      updateActive();
      if (summary) {
        summary.textContent = `当前显示 ${visible} 条结果`;
      }
      document.querySelectorAll('[data-year-block]').forEach(block => {
        const anyVisible = Array.from(block.querySelectorAll('.movie-card')).some(card => !card.hidden);
        block.hidden = !anyVisible;
      });
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.filterGroup;
        const value = btn.dataset.filterValue;
        state[group] = value;
        apply();
      });
    });

    if (search) {
      search.addEventListener('input', () => {
        state.query = search.value || '';
        apply();
      });
    }

    if (year) {
      year.addEventListener('change', () => {
        state.year = year.value || '全部';
        apply();
      });
    }

    updateActive();
    apply();
  }

  function initPlayer() {
    const shell = document.querySelector('[data-player-shell]');
    if (!shell) return;
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play]');
    if (!video || !button) return;

    const m3u8 = video.dataset.m3u8;
    const mp4 = video.dataset.mp4;

    if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8;
    } else {
      video.src = mp4;
    }

    function sync() {
      button.textContent = video.paused ? '点击播放' : '正在播放';
    }

    button.addEventListener('click', async () => {
      try {
        if (video.paused) {
          await video.play();
        } else {
          video.pause();
        }
      } catch (err) {
        console.error(err);
      }
      sync();
    });

    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('ended', sync);
    sync();
  }

  function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.type = 'button';
    btn.textContent = '顶部';
    btn.setAttribute('aria-label', '返回顶部');
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-show', window.scrollY > 600);
    }, { passive: true });
  }

  const extraStyle = document.createElement('style');
  extraStyle.textContent = `
    .back-to-top {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 60;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(8, 14, 26, .82);
      color: #fff;
      border-radius: 999px;
      padding: 11px 14px;
      box-shadow: 0 16px 30px rgba(0,0,0,.24);
      cursor: pointer;
      opacity: 0;
      transform: translateY(10px);
      pointer-events: none;
      transition: .2s ease;
    }
    .back-to-top.is-show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  `;
  document.head.appendChild(extraStyle);

  ready(() => {
    initHeroCarousel();
    initCatalogFilters();
    initPlayer();
    initBackToTop();
  });
})();
