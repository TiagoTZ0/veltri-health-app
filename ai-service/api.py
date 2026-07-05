from fastapi import FastAPI, UploadFile, File
import io
import json
from pathlib import Path
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
from torchvision import models, transforms

import config

app = FastAPI(title="Veltri Health AI Microservice", description="Food Detection API")


def load_labels():
    if not Path(config.CLASSES_PATH).exists():
        return []
    return list(np.load(config.CLASSES_PATH, allow_pickle=True))


def _norm(s: str) -> str:
    return str(s).strip().lower().replace('_', ' ').replace('-', ' ')


def load_calories() -> dict:
    p = Path(config.CALORIES_JSON)
    if not p.exists():
        return {}
    raw = json.loads(p.read_text(encoding="utf-8"))
    return {_norm(k): float(v) for k, v in raw.items()}


def kcal_lookup(label: str, cal_map: dict) -> float:
    cands = [
        label,
        label.lower(),
        label.replace('_', ' '),
        label.replace('_', '-'),
        _norm(label)
    ]
    for c in cands:
        v = cal_map.get(c)
        if v is None:
            v = cal_map.get(_norm(c))

        if v is not None and v > 0:
            return float(v)
    return 0.0


def load_model(n_classes: int):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = models.mobilenet_v2(weights=None)
    in_feat = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_feat, n_classes)

    if Path(config.MODEL_PATH).exists():
        ckpt = torch.load(config.MODEL_PATH, map_location=device)
        if "state_dict" in ckpt:
            model.load_state_dict(ckpt["state_dict"], strict=False)
        else:
            model.load_state_dict(ckpt, strict=False)

    model.eval().to(device)
    return model, device


def get_eval_tfm():
    return transforms.Compose([
        transforms.Resize((config.IMG_SIZE, config.IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=config.IMAGENET_MEAN, std=config.IMAGENET_STD),
    ])


def softmax_np(x):
    x = x - np.max(x)
    e = np.exp(x)
    return e / e.sum()


# Init globals
labels = load_labels()
cal_map = load_calories()
if len(labels) > 0:
    model, device = load_model(len(labels))
    tfm = get_eval_tfm()
else:
    model, device, tfm = None, None, None


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "num_classes": len(labels)
    }


@app.post("/predict/")
async def predict_food(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model not loaded. Ensure labels and weights are present."}

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        return {"error": f"Invalid image format: {e}"}

    x = tfm(image).unsqueeze(0).to(device)
    with torch.no_grad():
        logits = model(x).cpu().numpy().squeeze()

    probs = softmax_np(logits)

    top_idx = int(np.argmax(probs))
    top_class = labels[top_idx]
    top_prob = float(probs[top_idx])

    kcal_100 = kcal_lookup(top_class, cal_map)

    # get top 3
    top3 = []
    top3_idx = np.argsort(-probs)[:3]
    for idx in top3_idx:
        p_val = float(probs[idx])
        if p_val > 0.01:
            top3.append({
                "class": labels[idx],
                "probability": p_val
            })

    return {
        "prediction": top_class.replace('_', ' ').title(),
        "confidence": top_prob,
        "kcal_per_100g": kcal_100,
        "alternatives": top3
    }
