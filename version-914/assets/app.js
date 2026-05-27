(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var slides = qsa('.hero-slide');
    var dots = qsa('[data-hero-dot]');
    var active = 0;
    var timer = null;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === active);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        stopHero();
        timer = window.setInterval(function () {
            setSlide(active + 1);
        }, 5000);
    }

    function stopHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-hero-dot')) || 0;
            setSlide(index);
            startHero();
        });
    });

    setSlide(0);
    startHero();

    var filterInput = qs('[data-filter-input]');
    if (filterInput) {
        var cards = qsa('.js-card');
        filterInput.addEventListener('input', function () {
            var query = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                card.classList.toggle('hidden-card', query && text.indexOf(query) === -1);
            });
        });
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function movieCard(movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(' ');
        return '' +
            '<a class="movie-card js-card" href="' + movie.url + '" data-search="' + escapeHtml(text) + '">' +
                '<span class="poster-wrap">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-shade"></span>' +
                    '<span class="card-play">▶</span>' +
                    '<span class="corner-badge">' + escapeHtml(movie.type) + '</span>' +
                    '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
                '</span>' +
                '<span class="movie-card-body">' +
                    '<strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<em>' + escapeHtml(movie.oneLine) + '</em>' +
                    '<span class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></span>' +
                '</span>' +
            '</a>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    var results = qs('#search-results');
    if (results && Array.isArray(window.SEARCH_MOVIES)) {
        var q = getQuery();
        var input = qs('.search-page-form input');
        if (input) {
            input.value = q;
        }
        var normalized = q.toLowerCase();
        var matches = window.SEARCH_MOVIES.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(' ').toLowerCase();
            return text.indexOf(normalized) !== -1;
        }).slice(0, 160);
        if (matches.length) {
            results.innerHTML = matches.map(movieCard).join('');
        } else {
            results.innerHTML = '<div class="empty-result">没有找到匹配影片。</div>';
        }
    }
})();
