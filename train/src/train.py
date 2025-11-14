from tensorflow.keras import callbacks
from .data_loader import make_dataset
from .config import EPOCHS, MODEL_PATH
import tensorflow as tf

def train_model(model, train_df, val_df):
    train_ds = make_dataset(train_df, shuffle=True, augment_flag=True)
    val_ds = make_dataset(val_df)

    ckpt_cb = callbacks.ModelCheckpoint(MODEL_PATH, save_best_only=True, monitor="val_loss")
    early_cb = callbacks.EarlyStopping(patience=3, restore_best_weights=True)

    history = model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS,
                        callbacks=[ckpt_cb, early_cb])
    model.save("grain_size_model.h5")

    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()

    with open("grain_size_model.tflite", "wb") as f:
        f.write(tflite_model)

    print("✅ TFLite model saved!")
    return history
