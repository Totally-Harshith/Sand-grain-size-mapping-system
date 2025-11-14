# src/ui.py
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
from src.predicter import TFLiteGrainSizePredictor  # ✅ uses TFLite predictor
from src.utils import (
    save_prediction_log, format_prediction,
    is_valid_image, capture_image, PICAMERA_AVAILABLE
)

class GrainSizeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Beach Sand Grain Size Predictor")
        self.root.geometry("600x500")
        self.predictor = TFLiteGrainSizePredictor()
        self.selected_image = None

        # Title label
        self.label = tk.Label(root, text="Upload or Capture a Sand Image", font=("Arial", 16))
        self.label.pack(pady=10)

        # Buttons
        self.upload_btn = tk.Button(root, text="Select Image", command=self.select_image, width=20)
        self.upload_btn.pack(pady=5)

        if PICAMERA_AVAILABLE:
            self.capture_btn = tk.Button(root, text="Capture via PiCamera", command=self.capture_image, width=20)
            self.capture_btn.pack(pady=5)

        self.predict_btn = tk.Button(root, text="Predict Grain Size", command=self.predict, width=20)
        self.predict_btn.pack(pady=10)

        # Image display
        self.image_label = tk.Label(root)
        self.image_label.pack(pady=10)

        # Result label
        self.result_label = tk.Label(root, text="", font=("Arial", 14, "bold"))
        self.result_label.pack(pady=15)

    def select_image(self):
        # ✅ fixed file dialog (supports jpg, jpeg, png)
        path = filedialog.askopenfilename(
            filetypes=[
                ("Image files", ("*.jpg", "*.jpeg", "*.png")),
                ("All files", "*.*")
            ]
        )
        if not path or not is_valid_image(path):
            messagebox.showwarning("Invalid", "Please select a valid image file.")
            return

        self.selected_image = path
        img = Image.open(path)
        img.thumbnail((250, 250))
        self.tk_img = ImageTk.PhotoImage(img)
        self.image_label.config(image=self.tk_img)

    def capture_image(self):
        try:
            img_path = capture_image("captured_sand.jpg")
            self.selected_image = img_path
            img = Image.open(img_path)
            img.thumbnail((250, 250))
            self.tk_img = ImageTk.PhotoImage(img)
            self.image_label.config(image=self.tk_img)
        except Exception as e:
            messagebox.showerror("Camera Error", str(e))

    def predict(self):
        if not self.selected_image:
            messagebox.showwarning("No Image", "Please select or capture an image first.")
            return

        result = self.predictor.predict(self.selected_image)
        save_prediction_log(self.selected_image, result)
        self.result_label.config(text=f"Predicted Grain Size: {format_prediction(result)}")
