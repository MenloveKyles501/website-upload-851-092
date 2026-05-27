(function () {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function initMobileMenu() {
    const button = $('[data-mobile-menu-button]');
    const nav = $('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', () => {
      button.classList.toggle('is-open');
      nav.classList.toggle('is-open');
    });
  }

  function initImageFallbacks() {
    $$('.poster-frame img').forEach((image) => {
      image.addEventListener('error', () => {
        const frame = image.closest('.poster-frame');
        if (frame) {
          frame.classList.add('poster-missing');
        }
        image.remove();
      }, { once: true });
    });
  }

  function initHeroCarousel() {
    const carousel = $('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    const slides = $$('[data-hero-slide]', carousel);
    const dots = $$('[data-hero-dot]', carousel);
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function initHeroSearch() {
    const form = $('#hero-search-form');
    if (!form) {
      return;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('input[name="q"]', form);
      const query = input ? input.value.trim() : '';
      const target = query ? `movies.html?q=${encodeURIComponent(query)}` : 'movies.html';
      window.location.href = target;
    });
  }

  function initFilters() {
    $$('.js-filter-section').forEach((section) => {
      const container = $('.js-card-container', section);
      const cards = $$('.movie-card', section);
      const searchInput = $('.js-search-input', section);
      const filterSelects = $$('.js-filter-select', section);
      const sortSelect = $('.js-sort-select', section);
      const resultCount = $('.js-result-count', section);
      const emptyState = $('[data-empty-state]', section);

      if (!container || cards.length === 0) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');
      if (query && searchInput) {
        searchInput.value = query;
      }

      function matches(card) {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const haystack = (card.dataset.search || card.textContent || '').toLowerCase();

        if (keyword && !haystack.includes(keyword)) {
          return false;
        }

        for (const select of filterSelects) {
          const value = select.value;
          const key = select.name;
          if (value !== 'all' && (card.dataset[key] || '') !== value) {
            return false;
          }
        }

        return true;
      }

      function sortCards(visibleCards) {
        const mode = sortSelect ? sortSelect.value : 'default';
        const sorted = visibleCards.slice();

        if (mode === 'rating') {
          sorted.sort((a, b) => Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0));
        }

        if (mode === 'heat') {
          sorted.sort((a, b) => Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0));
        }

        if (mode === 'year') {
          sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
        }

        sorted.forEach((card) => container.appendChild(card));
      }

      function apply() {
        const visible = [];

        cards.forEach((card) => {
          const isVisible = matches(card);
          card.hidden = !isVisible;
          if (isVisible) {
            visible.push(card);
          }
        });

        sortCards(visible);

        if (resultCount) {
          resultCount.textContent = String(visible.length);
        }

        if (emptyState) {
          emptyState.hidden = visible.length > 0;
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }

      filterSelects.forEach((select) => select.addEventListener('change', apply));

      if (sortSelect) {
        sortSelect.addEventListener('change', apply);
      }

      apply();
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.Hls));
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.defer = true;
      script.dataset.hlsLoader = 'true';
      script.onload = () => resolve(window.Hls);
      script.onerror = () => reject(new Error('HLS library failed to load'));
      document.head.appendChild(script);
    });
  }

  function initPlayers() {
    $$('[data-player]').forEach((player) => {
      const video = $('video[data-src]', player);
      const overlay = $('.play-overlay', player);
      const message = $('[data-player-message]', player);

      if (!video) {
        return;
      }

      const source = video.dataset.src;
      let hlsInstance = null;
      let initialized = false;

      function setMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.hidden = !text;
      }

      async function initialize() {
        if (initialized) {
          return;
        }

        initialized = true;
        setMessage('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setMessage('');
          return;
        }

        try {
          const Hls = await loadHlsLibrary();
          if (!Hls || !Hls.isSupported()) {
            setMessage('当前浏览器不支持 HLS 播放。');
            return;
          }

          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => setMessage(''));
          hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setMessage('网络加载异常，正在重试...');
              hlsInstance.startLoad();
              return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              setMessage('媒体解析异常，正在恢复...');
              hlsInstance.recoverMediaError();
              return;
            }

            setMessage('无法加载当前视频源。');
          });
        } catch (error) {
          setMessage('播放器初始化失败，请检查网络或浏览器设置。');
        }
      }

      async function play() {
        await initialize();
        overlay && overlay.classList.add('is-hidden');
        video.controls = true;

        try {
          await video.play();
        } catch (error) {
          setMessage('浏览器阻止了自动播放，请再次点击视频播放。');
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      $$('.js-play-button').forEach((button) => {
        button.addEventListener('click', () => {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          play();
        });
      });

      window.addEventListener('pagehide', () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initImageFallbacks();
    initHeroCarousel();
    initHeroSearch();
    initFilters();
    initPlayers();
  });
})();
