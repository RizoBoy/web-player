const playlist = [
    { cover: './assets/img/track/getlow.jpg', audio: './assets/audio/getlow.mp3', title: 'Get Low', author: 'Ying Yang Twins' },
    { cover: './assets/img/track/whistle.jpg', audio: './assets/audio/whistle.mp3', title: 'Whistle', author: 'Flo Rida' },
    { cover: './assets/img/track/freestyler.jpg', audio: './assets/audio/freestyler.mp3', title: 'Freestyler', author: 'Bomfunk MC\'s' },
    { cover: './assets/img/track/rickroll.jpg', audio: './assets/audio/rickroll.mp3', title: 'Never Gonna Give You Up', author: 'Rick Astley' }
];

let currentAudioIndex = 0;

window.onload = () => {
    const audioSource = document.getElementById('audio-source');
    const audioFile = document.getElementById('audio-file');

    const progressBar = document.getElementById('progressbar-filled');
    const progressBarContainer = document.getElementById('progressbar');
    const volumeProgressBarContainer = document.getElementById('volume-progressbar');
    const volumeProgressBarFilled = document.getElementById('volume-progressbar-filled');
    const volumeValue = document.getElementById('volume-value');
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');
    const playButton = document.getElementById('play-button');
    const previousButton = document.getElementById('previous-button');
    const nextButton = document.getElementById('next-button');
    const playPauseImage = document.getElementById('play-pause');
    const coverImage = document.getElementById('cover-image');
    const coverCanvas = document.getElementById('cover-canvas');
    const songName = document.getElementById('song-name');
    const songAuthor = document.getElementById('song-author');
    const canvas = document.getElementById('visualizer');
    const player = document.getElementById('player-section');
    const canvasCtx = canvas.getContext('2d');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();

    changeAudioSource(playlist[currentAudioIndex].audio);
    updateUi();

    audioSource.addEventListener('timeupdate', () => {
        updateUi();
        drawVisualizer();
    });

    audioSource.addEventListener('ended', () => nextTrack());

    playButton.addEventListener('click', () => {
        if (audioSource.paused) {
            if (audioCtx.state == 'suspended') {
                audioCtx.resume();
            }

            audioSource.play();
        }
        else {
            audioSource.pause();
        }
    });

    progressBarContainer.addEventListener('click', (ev) => {
        const progressBarRect = progressBarContainer.getBoundingClientRect();
        const clickPosition = ev.clientX - progressBarRect.left;

        const totalWidth = progressBarContainer.clientWidth;
        const timePercentage = clickPosition / totalWidth;
        const newTime = audioSource.duration * timePercentage;

        audioSource.currentTime = newTime;
    });

    volumeProgressBarContainer.addEventListener('click', (ev) => {
        const progressBarRect = volumeProgressBarContainer.getBoundingClientRect();
        const clickPosition = ev.clientX - progressBarRect.left;

        const totalWidth = progressBarRect.width;
        const newVolume = clickPosition / totalWidth;
        
        audioSource.volume = newVolume;
    })

    previousButton.addEventListener('click', () => {
        if (audioSource.currentTime > 3)
            audioSource.currentTime = 0;
        else
            previousTrack();
    });

    nextButton.addEventListener('click', () => nextTrack());

    function changeAudioSource(newSrc) {
        audioFile.src = newSrc;

        audioSource.load();
    }    

    function updateUi() {
        const currentAudio = playlist[currentAudioIndex];
        const percentage = (audioSource.currentTime / audioSource.duration) * 100;
        const volume = Math.floor(audioSource.volume * 100);

        coverImage.src = currentAudio.cover;
        progressBar.style.width = percentage + '%';
        volumeProgressBarFilled.style.width = volume + '%';
        currentTime.textContent = formatTime(audioSource.currentTime);
        totalTime.textContent = formatTime(isNaN(audioSource.duration) ? 0 : audioSource.duration);
        songName.textContent = currentAudio.title;
        songAuthor.textContent = currentAudio.author;
        volumeValue.textContent = volume + '%';

        const averageColor = getAverageColor();

        player.style.backgroundColor = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
        canvasCtx.fillStyle = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        if (audioSource.paused)
            playPauseImage.src = './assets/img/play.svg';
        else
            playPauseImage.src = './assets/img/pause.svg';
    }

    function nextTrack() {
        audioSource.pause();

        if (currentAudioIndex + 1 < playlist.length)
            currentAudioIndex++;
        else
            currentAudioIndex = 0;

        changeAudioSource(playlist[currentAudioIndex].audio);
        audioSource.play();
    }

    function previousTrack() {
        audioSource.pause();

        if (currentAudioIndex > 0)
            currentAudioIndex--;
        else
            currentAudioIndex = playlist.length - 1;

        changeAudioSource(playlist[currentAudioIndex].audio);
        audioSource.play();  
    }

    function getAverageColor() {
        coverCanvas.width = coverImage.width;
        coverCanvas.height = coverImage.height;

        const ctx = coverCanvas.getContext('2d');

        ctx.drawImage(coverImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, coverCanvas.width, coverCanvas.height);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;

        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }

        r = Math.round(r / (data.length / 4));
        g = Math.round(g / (data.length / 4));
        b = Math.round(b / (data.length / 4));

        return { r: r, g: g, b: b };
    }

    function drawVisualizer() {
        let source;

        if (!audioSource.sourceNode) {
            source = audioCtx.createMediaElementSource(audioSource);
            audioSource.sourceNode = source;
        } else {
            source = audioSource.sourceNode;
        }

        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const drawVisual = requestAnimationFrame(drawVisualizer);

        analyser.getByteFrequencyData(dataArray);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }
    }
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
}