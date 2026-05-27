
(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');
  if (navToggle && navPanel) {
    navToggle.addEventListener('click', () => {
      navPanel.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
  }

  function initPlayer(video) {
    const src = video.dataset.src;
    if (!src) return;
    if (src.includes('.m3u8')) {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            video.src = src;
          }
        });
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }
    }
    video.src = src;
  }

  document.querySelectorAll('video[data-src]').forEach(initPlayer);

  const heroRoot = document.querySelector('[data-hero-slider]');
  if (heroRoot) {
    const slides = Array.from(heroRoot.querySelectorAll('[data-hero-slide]'));
    const prev = heroRoot.querySelector('[data-hero-prev]');
    const next = heroRoot.querySelector('[data-hero-next]');
    let index = Math.max(0, slides.findIndex((el) => el.classList.contains('active')));
    function show(i) {
      if (!slides.length) return;
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, s) => slide.classList.toggle('active', s === index));
    }
    if (prev) prev.addEventListener('click', () => show(index - 1));
    if (next) next.addEventListener('click', () => show(index + 1));
    setInterval(() => show(index + 1), 6500);
  }

  const filterInput = document.querySelector('[data-filter-input]');
  if (filterInput) {
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const doFilter = () => {
      const q = filterInput.value.trim().toLowerCase();
      cards.forEach((card) => {
        const hay = `${card.dataset.title || ''} ${card.dataset.tags || ''} ${card.dataset.region || ''} ${card.dataset.format || ''}`;
        card.hidden = !!q && !hay.includes(q);
      });
    };
    filterInput.addEventListener('input', doFilter);
    doFilter();
  }

  const searchRoot = document.getElementById('search-results');
  const searchSummary = document.getElementById('search-summary');
  const searchForm = document.querySelector('[data-search-form]');
  const filterButtons = Array.from(document.querySelectorAll('[data-search-filter]'));
  if (searchRoot && window.MOVIE_INDEX) {
    const url = new URL(window.location.href);
    const qInput = searchForm ? searchForm.querySelector('input[name="q"]') : null;
    if (qInput && url.searchParams.get('q')) qInput.value = url.searchParams.get('q');
    let region = 'all';
    function render() {
      const q = (qInput ? qInput.value : url.searchParams.get('q') || '').trim().toLowerCase();
      const filtered = window.MOVIE_INDEX.filter((item) => {
        const hay = [item.title, item.region, item.regionGroup, item.type, item.formatGroup, item.genre, item.oneLine, item.summary, (item.tags || []).join(' ')].join(' ').toLowerCase();
        const okQ = !q || hay.includes(q);
        const okRegion = region === 'all' || item.regionGroup === region;
        return okQ && okRegion;
      }).sort((a, b) => b.score - a.score).slice(0, 240);
      if (searchSummary) searchSummary.textContent = `共找到 ${filtered.length} 条结果`;
      searchRoot.innerHTML = filtered.map((item, idx) => `
        <article class="search-row">
          <a class="search-row-poster" href="${item.url}">
            <img src="assets/posters/${item.id}.svg" alt="${item.title}" loading="lazy">
          </a>
          <div class="search-row-body">
            <div class="search-row-top">
              <h3><a href="${item.url}">${item.title}</a></h3>
              <span>#${String(idx + 1).padStart(3, '0')}</span>
            </div>
            <p>${item.year} · ${item.regionGroup} · ${item.type} · ${item.genre}</p>
            <p>${item.oneLine || item.summary || ''}</p>
            <div class="movie-tags">${(item.tags || []).slice(0, 4).map(t => `<span>${t}</span>`).join('')}</div>
          </div>
        </article>
      `).join('');
    }
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        params.set('q', qInput ? qInput.value : '');
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
        render();
      });
    }
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        region = btn.dataset.searchFilter || 'all';
        render();
      });
    });
    render();
  }
})();
