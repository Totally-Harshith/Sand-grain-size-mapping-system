import numpy as np
import os
import cv2
import pandas as pd

os.makedirs("images", exist_ok=True)

# Create 100 random colored "sand" images (texture-like)
for i in range(100):
    img = np.random.randint(100, 255, (256,256,3), dtype=np.uint8)
    cv2.imwrite(f"images/img_{i:03d}.jpg", img)

# Create dummy labels (in mm, random between 0.1 and 1.0)
labels = {
    "image_path": [f"img_{i:03d}.jpg" for i in range(100)],
    "label_mm": np.random.uniform(0.1, 1.0, 100)
}
pd.DataFrame(labels).to_csv("labels.csv", index=False)

print("✅ Dummy dataset ready (replace this with your real sand data later)")