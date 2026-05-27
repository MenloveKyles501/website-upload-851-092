(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = $('[data-menu-button]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
        slide.setAttribute('aria-hidden', String(i !== index));
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setActive(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setActive(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setActive(i);
        play();
      });
    });
    setActive(0);
    play();
  }

  function setupSearch() {
    var input = $('[data-search-input]');
    var cards = $all('[data-search-card]');
    var empty = $('[data-empty-state]');
    var button = $('[data-search-button]');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
    }

    function filter() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-card') || '').toLowerCase();
        var show = !query || text.indexOf(query) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', filter);
    if (button) {
      button.addEventListener('click', filter);
    }
    filter();
  }

  function setupBackTop() {
    var button = $('[data-back-top]');
    if (!button) {
      return;
    }
    function toggle() {
      button.classList.toggle('is-visible', window.scrollY > 500);
    }
    window.addEventListener('scroll', toggle, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupBackTop();
  });
})();
