(function () {
  function query(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var toggle = query('[data-nav-toggle]');
    var panel = query('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function bindSearchForms() {
    queryAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = query('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = 'search.html?q=' + encodeURIComponent(value);
        } else {
          window.location.href = 'search.html';
        }
      });
    });
  }

  function bindHeroCarousel() {
    var root = query('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = queryAll('[data-hero-slide]', root);
    var dots = queryAll('[data-hero-dot]', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    root.addEventListener('mouseleave', start);
    start();
  }

  function bindFilters() {
    queryAll('[data-filter-bar]').forEach(function (bar) {
      var buttons = queryAll('[data-filter]', bar);
      var section = bar.closest('.content-section') || document;
      var cards = queryAll('[data-card]', section);
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var filter = button.getAttribute('data-filter');
          buttons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          cards.forEach(function (card) {
            var type = card.getAttribute('data-type') || '';
            var year = card.getAttribute('data-year') || '';
            var visible = filter === 'all' || type === filter || year === filter;
            card.classList.toggle('is-hidden', !visible);
          });
        });
      });
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card compact" data-card>' +
      '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(item.category) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
      '<p class="card-desc">' + escapeHtml(item.description || '') + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(item.year || '') + '</span><span>' + escapeHtml(item.region || '') + '</span><span>' + escapeHtml(item.type || '') + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function bindSearchPage() {
    var root = query('[data-search-page]');
    if (!root || !window.movieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    queryAll('[data-search-input]').forEach(function (input) {
      input.value = keyword;
    });
    if (!keyword) {
      return;
    }
    var box = query('[data-search-results]', root);
    var title = query('[data-search-title]', root);
    var lower = keyword.toLowerCase();
    var results = window.movieSearchIndex.filter(function (item) {
      return [item.title, item.description, item.region, item.type, item.genre, item.year, (item.tags || []).join(' '), item.category].join(' ').toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = '搜索结果';
    }
    if (box) {
      box.innerHTML = results.length ? results.map(cardTemplate).join('') : '<div class="text-panel"><h2>暂无匹配结果</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>';
    }
  }

  function bindPlayers() {
    queryAll('[data-player]').forEach(function (player) {
      var video = query('video', player);
      var button = query('[data-play-button]', player);
      var src = player.getAttribute('data-video');
      var started = false;
      var hls = null;
      if (!video || !src) {
        return;
      }
      function attach() {
        if (started) {
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
      }
      function play() {
        attach();
        if (button) {
          button.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindSearchForms();
    bindHeroCarousel();
    bindFilters();
    bindSearchPage();
    bindPlayers();
  });
})();
