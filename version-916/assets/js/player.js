(function () {
  window.initMoviePlayer = function (streamUrl) {
    function setup() {
      var video = document.getElementById('movie-player');
      var cover = document.querySelector('[data-player-cover]');
      var hlsInstance = null;
      var attached = false;

      if (!video || !streamUrl) {
        return;
      }

      function attachStream() {
        if (attached) {
          return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function startPlayback() {
        attachStream();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', startPlayback);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  };
})();
