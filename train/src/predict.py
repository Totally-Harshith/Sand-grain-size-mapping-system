import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from .config import IMG_SIZE

def predict_image(model, image_path):
    img = tf.keras.utils.load_img(image_path, target_size=IMG_SIZE)
    x = tf.keras.utils.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    pred_mm = model.predict(x, verbose=0)[0, 0]

    plt.imshow(tf.keras.utils.load_img(image_path))
    plt.title(f"Predicted Mean Grain Size: {pred_mm:.3f} mm")
    plt.axis("off")
    plt.show()
