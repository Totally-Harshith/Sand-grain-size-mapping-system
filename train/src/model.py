import tensorflow as tf
from tensorflow.keras import layers, models

def build_model(img_size):
    base = tf.keras.applications.MobileNetV2(
        include_top=False, input_shape=img_size + (3,), weights="imagenet"
    )
    base.trainable = False

    inputs = layers.Input(shape=img_size + (3,))
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(1, activation="linear")(x)
    model = models.Model(inputs, outputs)

    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3),
                  loss="mse",
                  metrics=[tf.keras.metrics.MeanAbsoluteError()])
    return model
