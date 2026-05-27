function initMoviePlayer(videoId, buttonId, layerId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var layer = document.getElementById(layerId);
    var hlsInstance = null;

    if (!video || !button || !layer || !sourceUrl) {
        return;
    }

    function bindSource() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== sourceUrl) {
                video.src = sourceUrl;
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            }
            return;
        }

        if (video.src !== sourceUrl) {
            video.src = sourceUrl;
        }
    }

    function begin() {
        bindSource();
        layer.classList.add('hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                layer.classList.remove('hidden');
            });
        }
    }

    button.addEventListener('click', begin);
    layer.addEventListener('click', begin);
    video.addEventListener('click', function () {
        if (video.paused) {
            begin();
        }
    });
    video.addEventListener('play', function () {
        layer.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            layer.classList.remove('hidden');
        }
    });
    video.addEventListener('ended', function () {
        layer.classList.remove('hidden');
    });
    bindSource();
}
