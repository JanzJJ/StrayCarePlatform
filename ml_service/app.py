"""
StrayGare — Dog Skin Disease Detection Microservice
====================================================
Runs on  : http://0.0.0.0:7860 (Hugging Face Spaces)
Called by: Express backend at /api/disease-detection/analyze

REAL version using trained MobileNetV2 model (dog_skin_model.h5).
"""

import os
import io
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import tensorflow as tf

app = Flask(_name_)
CORS(app)

# ─── Class Configuration ───────────────────────────────────────────────────
# ORDER = alphabetical sort of your actual training folder names.
# Python sorts lowercase before uppercase (ASCII order): 'd' < 'D', 'r' < 'R'
# Verified from your dataset screenshot:
CLASS_NAMES = [
    "Dermatitis",        # [0]  folder: Dermatitis
    "Fungal_infections", # [1]  folder: Fungal_infections
    "Healthy",           # [2]  folder: Healthy
    "Hypersensitivity",  # [3]  folder: Hypersensitivity
    "demodicosis",       # [4]  folder: demodicosis
    "ringworm",          # [5]  folder: ringworm
]

# ─── Per-class metadata for the frontend ──────────────────────────────────
DISEASE_META = {
    "demodicosis": {
        "severity": "High",
        "description": "Caused by an overgrowth of Demodex mites. Leads to patchy hair loss and scaly skin.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Demodectic mange is NOT typically contagious to humans.",
    },
    "Dermatitis": {
        "severity": "Moderate",
        "description": "Dermatitis is a general term for skin inflammation. In dogs it commonly presents as red, itchy, swollen skin.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Dermatitis in dogs is not contagious to humans.",
    },
    "Fungal_infections": {
        "severity": "Moderate",
        "description": "A fungal skin infection commonly caused by Malassezia yeast or Aspergillus. Antifungal treatment is usually effective.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Most canine fungal infections are not contagious to humans under normal conditions.",
    },
    "Healthy": {
        "severity": "Low",
        "description": "No significant skin disease detected. The dog's skin appears healthy with no visible signs of infection or inflammation.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "No disease detected. Safe for normal contact.",
    },
    "Hypersensitivity": {
        "severity": "Low",
        "description": "An allergic skin reaction triggered by food, pollen, flea bites, or environmental allergens.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Allergic dermatitis is not contagious to humans.",
    },
    "ringworm": {
        "severity": "Moderate",
        "description": "A fungal infection causing circular, scaly, hairless patches. Highly contagious between animals and to humans.",
        "contagiousToHumans": True,
        "humanSafetyMessage": "Ringworm CAN be transmitted to humans. Wear gloves and wash hands thoroughly.",
    },
    "Uncertain": {
        "severity": "Low",
        "description": "The model could not identify a clear condition. Please upload a clearer, well-lit photo.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Please consult a veterinarian for a proper in-person assessment.",
    },
}

# ─── Load Model at Startup ─────────────────────────────────────────────────
IMG_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 40.0  # percent — below this → return "Uncertain"

# ─── Download model from Hugging Face if not already cached ───────────────
HF_MODEL_URL = "https://huggingface.co/spaces/vishwa2k3/straycare-ml/resolve/main/model/dog_skin_model.h5"
MODEL_PATH = "/tmp/dog_skin_model.h5"

def download_model():
    if os.path.exists(MODEL_PATH):
        print("[INFO] Model already cached at /tmp/dog_skin_model.h5", flush=True)
        return True
    print(f"[INFO] Downloading model from Hugging Face...", flush=True)
    try:
        import urllib.request
        urllib.request.urlretrieve(HF_MODEL_URL, MODEL_PATH)
        size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        print(f"[INFO] Model downloaded successfully ({size_mb:.1f} MB)", flush=True)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to download model: {e}", flush=True)
        return False

download_model()

print(f"[INFO] Loading model from: {MODEL_PATH}", flush=True)
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    model_loaded = True
    print("[INFO] Model loaded successfully.", flush=True)
    print(f"[INFO] Classes: {CLASS_NAMES}", flush=True)
except Exception as e:
    model = None
    model_loaded = False
    print(f"[ERROR] Failed to load model: {e}", flush=True)


def preprocess_image(file_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes → model-ready numpy array (1, 224, 224, 3)."""
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
    return np.expand_dims(arr, axis=0)


# ─── Routes ───────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "service": "StrayCare ML Disease Detection API",
        "modelLoaded": model_loaded,
        "classes": CLASS_NAMES,
        "message": "Send a POST request with an image file to /predict.",
        "endpoints": ["/health", "/predict"],
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "modelLoaded": model_loaded,
    })


@app.route("/predict", methods=["POST"])
def predict():
    if not model_loaded:
        return jsonify({"error": "Model not loaded. Check server logs."}), 503

    if "image" not in request.files:
        return jsonify({"error": "No image field in request"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        file_bytes = file.read()
        input_tensor = preprocess_image(file_bytes)

        predictions = model.predict(input_tensor, verbose=0)  # (1, 6)
        probs = predictions[0]                                  # (6,)

        predicted_idx = int(np.argmax(probs))
        confidence = float(probs[predicted_idx]) * 100

        if confidence < CONFIDENCE_THRESHOLD:
            predicted_class = "Uncertain"
        else:
            predicted_class = CLASS_NAMES[predicted_idx]

        meta = DISEASE_META[predicted_class]

        result = {
            "disease": predicted_class,
            "confidence": round(confidence, 1),
            **meta,
        }

        print(f"[PREDICT] {predicted_class} ({confidence:.1f}%)", flush=True)
        return jsonify(result)

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}", flush=True)
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# ─── Entry point ──────────────────────────────────────────────────────────
if _name_ == "_main_":
    port = int(os.environ.get("PORT", 7860))
    print(f"[INFO] Starting Flask server on port {port}...", flush=True)
    app.run(host="0.0.0.0", port=port, debug=False)