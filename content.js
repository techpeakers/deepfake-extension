
// content.js
async function captureZoomMedia() {
    try {
        let stream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: 10 },
            audio: true
        });
        
        let videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.style.display = "none";
        document.body.appendChild(videoElement);
        
        processVideoFrames(videoElement);
        processAudio(stream);
    } catch (err) {
        console.error("Media capture failed:", err);
    }
}

async function processVideoFrames(video) {
    let model = await tf.loadGraphModel("model/video_model.json");
    setInterval(async () => {
        let tensor = tf.browser.fromPixels(video)
            .resizeNearestNeighbor([224, 224])
            .toFloat()
            .expandDims(0);
        let prediction = model.predict(tensor);
        let videoTrustScore = (1 - prediction.dataSync()[0]) * 100;
        updateOverlay(videoTrustScore, null);
    }, 1000);
}

async function processAudio(stream) {
    let audioContext = new AudioContext();
    let source = audioContext.createMediaStreamSource(stream);
    let analyzer = audioContext.createAnalyser();
    source.connect(analyzer);
    let dataArray = new Float32Array(analyzer.fftSize);
    setInterval(() => {
        analyzer.getFloatFrequencyData(dataArray);
        let audioDeepfakeScore = detectDeepfakeAudio(dataArray);
        updateOverlay(null, audioDeepfakeScore);
    }, 1000);
}

function detectDeepfakeAudio(frequencyData) {
    let aiModelPrediction = Math.random() * 100; // Replace with real AI model
    return aiModelPrediction;
}

function updateOverlay(videoScore, audioScore) {
    let overlay = document.getElementById("deepfakeOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "deepfakeOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "10px";
        overlay.style.right = "10px";
        overlay.style.background = "rgba(255, 0, 0, 0.7)";
        overlay.style.color = "white";
        overlay.style.padding = "10px";
        overlay.style.fontSize = "16px";
        overlay.style.borderRadius = "5px";
        document.body.appendChild(overlay);
    }
    let finalScore = (videoScore ? videoScore : 50) * 0.6 + (audioScore ? audioScore : 50) * 0.4;
    overlay.innerText = `⚠️ Deepfake Detection Score: ${finalScore.toFixed(2)}%`;
}

captureZoomMedia();
