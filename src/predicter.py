# src/predictor_tflite.py
import numpy as np
import tflite_runtime.interpreter as tflite
from src.utils import load_and_preprocess_image

class TFLiteGrainSizePredictor:
    def __init__(self, model_path="model/grain_size_model.tflite"):
        # Use tflite-runtime's Interpreter instead of tensorflow.lite.Interpreter
        self.interpreter = tflite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()

    def predict(self, image_path):
        img = load_and_preprocess_image(image_path)

        # Ensure img matches input tensor shape and dtype
        input_index = self.input_details[0]['index']
        output_index = self.output_details[0]['index']
        input_dtype = self.input_details[0]['dtype']
        input_shape = self.input_details[0]['shape']

        # Resize / cast if needed
        img = np.array(img, dtype=input_dtype).reshape(input_shape)

        self.interpreter.set_tensor(input_index, img)
        self.interpreter.invoke()
        output = self.interpreter.get_tensor(output_index)
        return float(output[0][0])
