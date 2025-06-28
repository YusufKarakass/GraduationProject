const video = document.getElementById('video');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyzeBtn');
const startBtn = document.getElementById('startBtn');

function startSystem() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.style.display = 'block';
            analyzeBtn.style.display = 'inline-block';
            startBtn.style.display = 'none';
        })
        .catch(err => {
            console.error("Kamera açılamadı:", err);
            resultDiv.innerText = "Kamera açılamadı.";
        });
}

async function captureAndAnalyze() {
    resultDiv.innerText = "Analiz ediliyor...";

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg');

    const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageDataUrl })
    });

    const data = await response.json();

    if (data.error) {
        resultDiv.innerText = "Hata: " + data.error;
    } else {
        resultDiv.innerHTML = `
            <p>Duygu: <strong>${data.emotion}</strong></p>
            <a href="${data.music}" target="_blank">🎵 Size önerdiğimiz müzik bu!</a>
        `;
    }
}

startBtn.addEventListener('click', startSystem);
analyzeBtn.addEventListener('click', captureAndAnalyze);
