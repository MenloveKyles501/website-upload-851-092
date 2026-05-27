(function () {
  const sourcePool = [
    { type: 'hls', label: '高清HLS 1', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 2', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 3', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 4', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 5', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 6', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 7', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 8', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 9', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8' },
    { type: 'hls', label: '高清HLS 10', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u80' },
    { type: 'hls', label: '高清HLS 11', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u81' },
    { type: 'hls', label: '高清HLS 12', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u82' },
    { type: 'hls', label: '高清HLS 13', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u83' },
    { type: 'hls', label: '高清HLS 14', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u84' },
    { type: 'hls', label: '高清HLS 15', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u85' },
    { type: 'hls', label: '高清HLS 16', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u86' },
    { type: 'hls', label: '高清HLS 17', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u87' },
    { type: 'hls', label: '高清HLS 18', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u88' },
    { type: 'hls', label: '高清HLS 19', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u89' },
    { type: 'hls', label: '高清HLS 20', url: 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u80' },
    { type: 'mp4', label: '兼容MP4', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  ];

  const HLS = window.Hls;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function setupMenu() {
    const btn = qs('[data-menu-toggle]');
    const nav = qs('[data-mobile-nav]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = !nav.hasAttribute('hidden');
      if (open) {
        nav.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        nav.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function posterize(container) {
    qsa('.movie-poster, .hero-card-poster, .detail-poster, .mini-poster, .topic-feature', container).forEach((node) => {
      const style = getComputedStyle(node);
      const c1 = style.getPropertyValue('--c1').trim();
      const c2 = style.getPropertyValue('--c2').trim();
      const c3 = style.getPropertyValue('--c3').trim();
      if (c1 && c2 && c3) {
        node.style.background = `linear-gradient(160deg, ${c1}, ${c2} 52%, ${c3})`;
      }
    });
  }

  function attachPlayer() {
    const shell = qs('.player-shell');
    const video = qs('.player-video');
    if (!shell || !video) return;
    const rawKeys = shell.getAttribute('data-source-keys') || '';
    const keys = rawKeys.split(',').map((v) => Number(v.trim())).filter((n) => Number.isFinite(n));
    const sources = keys.map((k) => sourcePool[k] || sourcePool[0]);
    const buttons = qsa('.source-btn', shell);
    let hlsInstance = null;

    function clearHls() {
      if (hlsInstance) {
        try { hlsInstance.destroy(); } catch (err) {}
        hlsInstance = null;
      }
    }

    function playSource(source, button) {
      clearHls();
      buttons.forEach((btn) => btn.classList.toggle('active', btn === button));
      if (!source) return;
      if (source.type === 'hls' && HLS && typeof HLS.isSupported === 'function' && HLS.isSupported()) {
        hlsInstance = new HLS();
        hlsInstance.loadSource(source.url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(HLS.Events.MANIFEST_PARSED, function () {
          const promise = video.play();
          if (promise && typeof promise.catch === 'function') promise.catch(() => {});
        });
      } else {
        video.src = source.url;
        video.load();
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      }
    }

    if (buttons.length) {
      buttons.forEach((button, idx) => {
        button.addEventListener('click', () => playSource(sources[idx] || sources[0], button));
      });
      playSource(sources[0], buttons[0]);
    }
  }

  function buildOption(select, values, placeholder) {
    if (!select) return;
    const seen = new Set();
    values.forEach((v) => {
      if (!v || seen.has(v)) return;
      seen.add(v);
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
  }

  function setupSearch() {
    if (document.body.dataset.page !== 'search') return;
    const data = window.MOVIES_INDEX || [];
    const input = qs('#searchInput');
    const typeFilter = qs('#typeFilter');
    const regionFilter = qs('#regionFilter');
    const bucketFilter = qs('#bucketFilter');
    const resetBtn = qs('#resetSearch');
    const results = qs('#searchResults');
    const summary = qs('#searchSummary');

    buildOption(typeFilter, data.map((x) => x.type));
    buildOption(regionFilter, data.map((x) => x.region));
    buildOption(bucketFilter, data.map((x) => x.bucket));

    function render(list) {
      results.innerHTML = list.slice(0, 120).map((item, idx) => `
        <a class="movie-card card-compact" href="${item.url}" style="--c1:hsl(${(item.score * 13) % 360},78%,58%);--c2:hsl(${(item.score * 29) % 360},78%,56%);--c3:hsl(${(item.score * 41) % 360},78%,48%);">
          <div class="movie-poster">
            <span class="rank-badge">${idx + 1}</span>
            <div class="poster-glow"></div>
            <div class="poster-title">${item.title}</div>
            <div class="poster-sub">${item.bucket}</div>
          </div>
          <div class="movie-body">
            <div class="movie-title">${item.title}</div>
            <div class="movie-meta">${item.region} · ${item.type} · ${item.year}</div>
            <p class="movie-line">${(item.oneLine || '').slice(0, 72)}</p>
            <div class="movie-tags">${(item.tags || []).slice(0,3).map((t) => `<span>${t}</span>`).join('')}</div>
          </div>
        </a>`).join('');
      summary.textContent = `共找到 ${list.length} 部影片，当前展示前 ${Math.min(120, list.length)} 部。`;
    }

    function apply() {
      const q = (input.value || '').trim().toLowerCase();
      const type = typeFilter.value;
      const region = regionFilter.value;
      const bucket = bucketFilter.value;
      const filtered = data.filter((item) => {
        const text = [item.title, item.region, item.type, item.genre, item.bucket, item.oneLine, item.summary, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return (!q || text.includes(q)) && (!type || item.type === type) && (!region || item.region === region) && (!bucket || item.bucket === bucket);
      });
      render(filtered.sort((a, b) => b.score - a.score));
    }

    input.addEventListener('input', apply);
    typeFilter.addEventListener('change', apply);
    regionFilter.addEventListener('change', apply);
    bucketFilter.addEventListener('change', apply);
    resetBtn.addEventListener('click', () => {
      input.value = '';
      typeFilter.value = '';
      regionFilter.value = '';
      bucketFilter.value = '';
      apply();
    });
    apply();
  }

  function setupTheme() {
    posterize(document);
    setupMenu();
    attachPlayer();
    setupSearch();
  }

  document.addEventListener('DOMContentLoaded', setupTheme);
})();
