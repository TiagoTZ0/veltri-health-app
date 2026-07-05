from pathlib import Path

# Rutas base
SERVICE_DIR = Path(__file__).parent
MODELS_DIR  = SERVICE_DIR / "models"

MODEL_PATH    = MODELS_DIR / "food101_torch.pth"
CLASSES_PATH  = MODELS_DIR / "food101_classes.npy"
CALORIES_JSON = MODELS_DIR / "calories.json"

# Parámetros de inferencia
IMG_SIZE = 224

# Normalización tipo ImageNet
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD  = (0.229, 0.224, 0.225)
