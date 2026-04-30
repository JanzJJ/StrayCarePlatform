"""
StrayGare — Dog Skin Disease Detection Microservice
====================================================
Runs on  : http://localhost:5002
Called by: Express backend at /api/disease-detection/analyze

Start:
    cd ml_service
    venv\\Scripts\\activate        (Windows)
    source venv/bin/activate      (Mac/Linux)
    python app.py

NOTE: This is a MOCK version for frontend testing.
To use the real ML model, install TensorFlow 2.15+ with Python 3.11 or earlier.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Sample disease data for testing
DISEASE_SAMPLES = [
    {
        "disease": "Healthy Skin",
        "severity": "Low",
        "confidence": 92,
        "description": "No significant skin disease detected. The dog's skin appears healthy with no visible signs of infection or inflammation.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "No disease detected. Safe for normal contact.",
    },
    {
        "disease": "Dermatitis",
        "severity": "Moderate",
        "confidence": 85,
        "description": "Dermatitis is a general term for skin inflammation. In dogs it commonly presents as red, itchy, swollen skin.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Dermatitis in dogs is not contagious to humans.",
    },
    {
        "disease": "Fungal Infection",
        "severity": "Moderate",
        "confidence": 78,
        "description": "A fungal skin infection commonly caused by Malassezia yeast or Aspergillus. Antifungal treatment is usually effective.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Most canine fungal infections are not contagious to humans under normal conditions.",
    },
    {
        "disease": "Hypersensitivity / Allergic Dermatitis",
        "severity": "Low",
        "confidence": 88,
        "description": "An allergic skin reaction triggered by food, pollen, flea bites, or environmental allergens.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Allergic dermatitis is not contagious to humans.",
    },
    {
        "disease": "Demodicosis (Demodectic Mange)",
        "severity": "High",
        "confidence": 82,
        "description": "Caused by an overgrowth of Demodex mites. Leads to patchy hair loss and scaly skin.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Demodectic mange is NOT typically contagious to humans.",
    },
    {
        "disease": "Ringworm (Dermatophytosis)",
        "severity": "Moderate",
        "confidence": 79,
        "description": "A fungal infection causing circular, scaly, hairless patches. Highly contagious between animals and to humans.",
        "contagiousToHumans": True,
        "humanSafetyMessage": "Ringworm CAN be transmitted to humans. Wear gloves and wash hands thoroughly.",
    },
    {
        "disease": "Uncertain",
        "severity": "Low",
        "confidence": 45,
        "description": "The model could not identify a clear condition. Please upload a clearer, well-lit photo.",
        "contagiousToHumans": False,
        "humanSafetyMessage": "Please consult a veterinarian for a proper in-person assessment.",
    }
]


@app.route("/health", methods=["GET"])
def health():
    """Express pings this to check if the service is alive."""
    return jsonify({
        "status": "ok",
        "modelLoaded": True,
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accepts : multipart/form-data  field = 'image'
    Returns : JSON matching DetectionResult shape used by the frontend
    """
    if "image" not in request.files:
        return jsonify({"error": "No image field in request"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        # Return a random sample prediction for testing
        result = random.choice(DISEASE_SAMPLES)
        return jsonify(result)

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# ── Entry point ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("[INFO⚠️ ] Running in MOCK MODE for testing", flush=True)
    print("[INFO] This version returns sample predictions.", flush=True)
    print("[INFO] Starting Flask server on http://0.0.0.0:5002", flush=True)
    print("[INFO] To use real predictions, install: pip install tensorflow==2.15.0 on Python 3.11", flush=True)
    try:
        app.run(host="0.0.0.0", port=5002, debug=False)
    except Exception as e:
        print(f"[ERROR] Failed to start Flask server: {e}", flush=True)
        exit(1)