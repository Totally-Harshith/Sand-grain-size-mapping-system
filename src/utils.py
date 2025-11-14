# src/utils.py

import os
import numpy as np
from PIL import Image
import datetime


# --------------------------------------------------
# ✅ Function: Validate image file
# --------------------------------------------------
def is_valid_image(path):
    """
    Check if the given file path points to a valid image.
    Accepts .jpg, .jpeg, and .png formats.
    """
    valid_extensions = ('.jpg', '.jpeg', '.png')
    return os.path.isfile(path) and path.lower().endswith(valid_extensions)


# --------------------------------------------------
# ✅ Function: Load + preprocess image for model
# --------------------------------------------------
def load_and_preprocess_image(image_path, target_size=(224, 224)):
    """
    Loads an image and prepares it for TFLite model prediction.
    Converts to RGB, resizes, normalizes to [0,1], and expands dims.
    """
    try:
        img = Image.open(image_path).convert("RGB")
        img = img.resize(target_size)
        img_array = np.array(img, dtype=np.float32) / 255.0  # normalize
        img_array = np.expand_dims(img_array, axis=0)        # add batch dimension
        return img_array
    except Exception as e:
        raise ValueError(f"Error loading image {image_path}: {e}")


# --------------------------------------------------
# ✅ Function: Format prediction result
# --------------------------------------------------
def format_prediction(value):
    """
    Format the grain size prediction value nicely for display.
    """
    return f"{value:.3f} mm"


# --------------------------------------------------
# ✅ Function: Save prediction to log file
# --------------------------------------------------
def save_prediction_log(image_path, prediction, log_file="prediction_log.txt"):
    """
    Appends the prediction result with timestamp to a log file.
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"{timestamp} | Image: {os.path.basename(image_path)} | Predicted Grain Size: {prediction:.3f} mm\n"

    try:
        with open(log_file, "a") as f:
            f.write(entry)
    except Exception as e:
        print(f"⚠️ Failed to write log: {e}")


# --------------------------------------------------
# ✅ Stub values for UI compatibility (no PiCamera)
# --------------------------------------------------
PICAMERA_AVAILABLE = False

def capture_image(output_path="captured_sand.jpg"):
    """
    Dummy placeholder when no PiCamera is connected.
    """
    raise RuntimeError("PiCamera not available on this system. Please upload an image instead.")
