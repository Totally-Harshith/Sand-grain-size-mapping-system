import matplotlib.pyplot as plt
from sklearn.metrics import mean_absolute_error, r2_score
import numpy as np
from .data_loader import make_dataset

def evaluate_model(model, test_df):
    test_ds = make_dataset(test_df)
    y_true, y_pred = [], []
    for imgs, labels in test_ds:
        preds = model.predict(imgs, verbose=0)
        y_true.extend(labels.numpy())
        y_pred.extend(preds.squeeze())

    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    print(f"✅ Test MAE: {mae:.4f} mm | R²: {r2:.4f}")

    plt.scatter(y_true, y_pred, alpha=0.6)
    plt.plot([min(y_true), max(y_true)], [min(y_true), max(y_true)], "k--")
    plt.xlabel("True (mm)")
    plt.ylabel("Predicted (mm)")
    plt.title("Predicted vs True Grain Size")
    plt.show()
