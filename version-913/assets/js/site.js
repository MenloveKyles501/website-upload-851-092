(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
  var arrows = Array.prototype.slice.call(document.querySelectorAll('.hero-arrow'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });

    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('is-active', thumbIndex === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(parseInt(dot.getAttribute('data-target'), 10) || 0);
      startHero();
    });
  });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('mouseenter', function () {
      showSlide(parseInt(thumb.getAttribute('data-target'), 10) || 0);
      startHero();
    });
  });

  arrows.forEach(function (arrow) {
    arrow.addEventListener('click', function () {
      var direction = arrow.getAttribute('data-direction') === 'prev' ? -1 : 1;
      showSlide(current + direction);
      startHero();
    });
  });

  startHero();

  var searchInput = document.querySelector('[data-card-search]');
  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-card'));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : '');
    var selected = {};

    filters.forEach(function (filter) {
      selected[filter.getAttribute('data-filter')] = normalize(filter.value);
    });

    cards.forEach(function (card) {
      var text = cardText(card);
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchSelects = filters.every(function (filter) {
        var key = filter.getAttribute('data-filter');
        var wanted = selected[key];
        return !wanted || normalize(card.getAttribute('data-' + key)).indexOf(wanted) !== -1;
      });

      card.classList.toggle('is-hidden', !(matchKeyword && matchSelects));
    });
  }

  if (searchInput || filters.length) {
    var query = new URLSearchParams(window.location.search).get('q');

    if (searchInput && query) {
      searchInput.value = query;
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();
