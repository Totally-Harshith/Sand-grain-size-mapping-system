# app.py
from tkinter import Tk, messagebox
from src.ui import GrainSizeApp

def main():
    try:
        root = Tk()
        app = GrainSizeApp(root)
        root.mainloop()
    except Exception as e:
        messagebox.showerror("Application Error", f"An unexpected error occurred:\n{e}")

if __name__ == "__main__":
    main()
