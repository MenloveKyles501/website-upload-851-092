import { H as Hls } from './hls-vendor.js';

export function initMoviePlayer(settings) {
  var video = settings.video;
  var overlay = settings.overlay;
  var button = settings.button;
  var source = settings.source;
  var started = false;
  var hls = null;

  if (!video || !overlay || !button || !source) {
    return;
  }

  function attachSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    }
  }

  function start() {
    if (!started) {
      started = true;
      attachSource();
      video.controls = true;
      overlay.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setTimeout(function () {
          video.play().catch(function () {});
        }, 180);
      });
    }
  }

  button.addEventListener('click', start);
  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!started) {
      start();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
