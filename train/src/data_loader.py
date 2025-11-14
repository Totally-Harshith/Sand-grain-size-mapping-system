import tensorflow as tf
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from .config import IMG_SIZE, BATCH_SIZE, SEED

data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip('horizontal'),
    tf.keras.layers.RandomRotation(0.06),
    tf.keras.layers.RandomZoom(0.05),
])

def preprocess_image(path, label, img_size=(224, 224)):
    """
    Load and preprocess a single image.
    """
    # Read image
    image = tf.io.read_file(path)
    image = tf.image.decode_jpeg(image, channels=3)
    image = tf.image.resize(image, img_size)
    image = tf.cast(image, tf.float32) / 255.0
    return image, label

def load_data(csv_path, image_root):
    df = pd.read_csv(csv_path)
    df["path"] = df["image_path"].apply(lambda p: f"{image_root}/{p}")
    df = df[df["path"].apply(lambda x: tf.io.gfile.exists(x))]

    train_df, test_df = train_test_split(df, test_size=0.15, random_state=SEED)
    train_df, val_df = train_test_split(train_df, test_size=0.1765, random_state=SEED)
    return train_df, val_df, test_df

def load_and_preprocess(path, label):
    img = tf.io.read_file(path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.convert_image_dtype(img, tf.float32)
    img = tf.image.resize(img, IMG_SIZE)
    return img, label

def augment(image, label):
    """
    Apply data augmentation (no variable creation here).
    """
    image = data_augmentation(image, training=True)
    return image, label

def make_dataset(df, batch_size=32, shuffle=False, augment_flag=False, img_size=(224, 224)):
    """
    Create a TensorFlow dataset from a DataFrame.
    """
    # Convert paths and labels to tensors
    paths = tf.constant(df['path'].values)
    labels = tf.constant(df['label'].values)

    ds = tf.data.Dataset.from_tensor_slices((paths, labels))
    ds = ds.map(lambda x, y: preprocess_image(x, y, img_size),
                num_parallel_calls=tf.data.AUTOTUNE)

    if shuffle:
        ds = ds.shuffle(buffer_size=len(df))

    if augment_flag:
        ds = ds.map(augment, num_parallel_calls=tf.data.AUTOTUNE)

    ds = ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return ds
