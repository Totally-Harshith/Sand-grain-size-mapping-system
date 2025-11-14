import os

# --- File paths ---
DATA_DIR = os.path.join("data", "images")
CSV_PATH = os.path.join("data", "labels.csv")
MODEL_PATH = "best_model.h5"

# --- Training parameters ---
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 10
SEED = 42
