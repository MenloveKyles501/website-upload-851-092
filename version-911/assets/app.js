(function () {
    const by = (selector, root = document) => root.querySelector(selector);
    const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function initMenu() {
        const toggle = by("[data-menu-toggle]");
        const nav = by("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        const hero = by("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = all("[data-hero-slide]", hero);
        const dots = all("[data-hero-dot]", hero);
        if (slides.length < 2) {
            return;
        }
        let current = 0;
        let timer = null;
        const show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        };
        const start = function () {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        };
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function initFilters() {
        const cards = all("[data-movie-card]");
        const input = by("[data-search-input]");
        const buttons = all("[data-filter-value]");
        if (!cards.length || (!input && !buttons.length)) {
            return;
        }
        let active = "all";
        const apply = function () {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                const text = card.getAttribute("data-search") || "";
                const type = card.getAttribute("data-type") || "";
                const matchText = !keyword || text.includes(keyword);
                const matchType = active === "all" || type === active;
                card.classList.toggle("is-hidden", !(matchText && matchType));
            });
        };
        if (input) {
            input.addEventListener("input", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                active = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
    }

    function cardTemplate(item) {
        const tags = item.tags.slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\" data-movie-card data-search=\"" + escapeHtml(item.search) + "\" data-type=\"" + escapeHtml(item.type) + "\" data-year=\"" + escapeHtml(item.year) + "\">" +
            "<a class=\"poster-link\" href=\"./" + escapeHtml(item.page) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
            "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(item.type) + "</span><span class=\"poster-play\">▶</span></a>" +
            "<div class=\"card-body\"><div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span></div>" +
            "<h2><a href=\"./" + escapeHtml(item.page) + "\">" + escapeHtml(item.title) + "</a></h2>" +
            "<p>" + escapeHtml(item.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (match) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[match];
        });
    }

    function initGlobalSearch() {
        const input = by("[data-global-search]");
        const results = by("[data-global-results]");
        if (!input || !results || !Array.isArray(window.MOVIE_INDEX)) {
            return;
        }
        const render = function () {
            const keyword = input.value.trim().toLowerCase();
            const list = keyword ? window.MOVIE_INDEX.filter(function (item) {
                return item.search.includes(keyword);
            }).slice(0, 96) : window.MOVIE_INDEX.slice(180, 216);
            results.innerHTML = list.map(cardTemplate).join("");
        };
        input.addEventListener("input", render);
    }

    window.SitePlayer = {
        setup: function (source) {
            const video = by("[data-player-video]");
            const button = by("[data-player-button]");
            const box = by("[data-player-box]");
            if (!video || !source) {
                return;
            }
            const attach = function () {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!video.getAttribute("src")) {
                        video.src = source;
                    }
                } else if (window.Hls && window.Hls.isSupported()) {
                    if (!video.hlsReady) {
                        const hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        video.hlsReady = true;
                    }
                } else {
                    video.src = source;
                }
            };
            const play = function () {
                attach();
                if (button) {
                    button.classList.add("hidden");
                }
                const attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        if (button) {
                            button.classList.remove("hidden");
                        }
                    });
                }
            };
            attach();
            if (button) {
                button.addEventListener("click", play);
            }
            if (box) {
                box.addEventListener("click", function (event) {
                    if (event.target === video && video.paused) {
                        play();
                    }
                });
            }
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove("hidden");
                }
            });
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initGlobalSearch();
    });
})();
