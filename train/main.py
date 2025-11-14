from src.config import DATA_DIR, CSV_PATH, IMG_SIZE
from src.data_loader import load_data
from src.model import build_model
from src.train import train_model
from src.evaluate import evaluate_model
from src.predict import predict_image

if __name__ == "__main__":
    print("Beach Sand Grain Size Predictor")

    # Load data
    train_df, val_df, test_df = load_data(CSV_PATH, DATA_DIR)

    train_df.rename(columns={'label_mm': 'label'}, inplace=True)
    val_df.rename(columns={'label_mm': 'label'}, inplace=True)
    test_df.rename(columns={'label_mm': 'label'}, inplace=True)

    # Build model
    model = build_model(IMG_SIZE)

    # Train
    train_model(model, train_df, val_df)

    # Evaluate
    evaluate_model(model, test_df)

    # Predict new image
    sample_img = test_df["path"].iloc[0]
    predict_image(model, sample_img)

    print("Done!")
