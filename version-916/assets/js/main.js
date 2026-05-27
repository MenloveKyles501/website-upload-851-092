(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var root = panel.parentElement;
    var input = panel.querySelector('[data-search-input]');
    var filterButtons = panel.querySelectorAll('[data-filter-value]');
    var cards = root ? Array.prototype.slice.call(root.querySelectorAll('.movie-card')) : [];
    var emptyState = root ? root.querySelector('[data-empty-state]') : null;
    var activeFilter = '';

    function cardText(card) {
      return [
        card.dataset.title,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = cardText(card);
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        var show = passQuery && passFilter;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeFilter = button.dataset.filterValue || '';
        applyFilter();
      });
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setHero(current + 1);
    }, 4500);
  }
})();
