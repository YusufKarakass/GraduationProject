
from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import base64
import cv2
import numpy as np
import random

app = Flask(__name__)
CORS(app)
music_suggestions = {
    "happy": [
        "https://www.youtube.com/watch?v=ZbZSe6N_BXs",
        "https://www.youtube.com/watch?v=3GwjfUFyY6M",
        "https://www.youtube.com/watch?v=9bZkp7q19f0",
        "https://www.youtube.com/watch?v=hT_nvWreIhg",
        "https://www.youtube.com/watch?v=OPf0YbXqDm0"
    ],
    "sad": [
        "https://www.youtube.com/watch?v=RgKAFK5djSk",
        "https://www.youtube.com/watch?v=J_ub7Etch2U",
        "https://www.youtube.com/watch?v=5anLPw0Efmo",
        "https://www.youtube.com/watch?v=YQHsXMglC9A",
        "https://www.youtube.com/watch?v=dvgZkm1xWPE"
    ],
    "angry": [
        "https://www.youtube.com/watch?v=YVkUvmDQ3HY",
        "https://www.youtube.com/watch?v=04F4xlWSFh0",
        "https://www.youtube.com/watch?v=2vjPBrBU-TM",
        "https://www.youtube.com/watch?v=uelHwf8o7_U",
        "https://www.youtube.com/watch?v=fLexgOxsZu0"
    ],
    "surprise": [
        "https://www.youtube.com/watch?v=lWA2pjMjpBs",
        "https://www.youtube.com/watch?v=09R8_2nJtjg",
        "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
        "https://www.youtube.com/watch?v=lp-EO5I60KA",
        "https://www.youtube.com/watch?v=CevxZvSJLk8"
    ],
    "neutral": [
        "https://www.youtube.com/watch?v=kXYiU_JCYtU",
        "https://www.youtube.com/watch?v=ktvTqknDobU",
        "https://www.youtube.com/watch?v=7wtfhZwyrcc",
        "https://www.youtube.com/watch?v=VPRjCeoBqrI",
        "https://www.youtube.com/watch?v=ScNNfyq3d_w"
    ],
    "fear": [
        "https://www.youtube.com/watch?v=0KSOMA3QBU0",
        "https://www.youtube.com/watch?v=8UVNT4wvIGY",
        "https://www.youtube.com/watch?v=uelHwf8o7_U",
        "https://www.youtube.com/watch?v=YlUKcNNmywk",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    ],
    "disgust": [
        "https://www.youtube.com/watch?v=3YxaaGgTQYM",
        "https://www.youtube.com/watch?v=Zi_XLOBDo_Y",
        "https://www.youtube.com/watch?v=NF-kLy44Hls",
        "https://www.youtube.com/watch?v=WNeLUngb-Xg",
        "https://www.youtube.com/watch?v=RBumgq5yVrA"
    ]
}

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        image_data = data.get("image")
        if not image_data:
            return jsonify({'error': 'Resim verisi alınamadı'}), 400
        encoded_data = image_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        result = DeepFace.analyze(img_path=img, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']
        suggestions = music_suggestions.get(emotion.lower(), music_suggestions["neutral"])
        selected_music = random.choice(suggestions)
        return jsonify({'emotion': emotion, 'music': selected_music})
    except Exception as e:
        print("Hata:", str(e))
        return jsonify({'error': 'Analiz yapılamadı'}), 400

if __name__ == '__main__':
    app.run(debug=True)
