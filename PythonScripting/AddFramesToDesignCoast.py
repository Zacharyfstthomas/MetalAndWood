from PIL import Image
import os
import numpy as np

print("Starting script...")

# File paths
frame_path = "./Hamill/COAST/HAMILL_COAST_FRAME.jpg"
designs_folder = "./Hamill/COAST"
output_folder = "./Hamill/COAST/CoastFrame"
frame_box = (166, 168, 686, 688)  # (left, top, right, bottom)

os.makedirs(output_folder, exist_ok=True)

def trim_white_border(img, bg_color=(255, 255, 255), tolerance=10):
    img = img.convert("RGB")
    np_img = np.array(img)
    diff = np.abs(np_img - np.array(bg_color)).sum(axis=2)
    mask = diff > tolerance
    coords = np.argwhere(mask)
    if coords.any():
        top_left = coords.min(axis=0)
        bottom_right = coords.max(axis=0)
        cropped_img = img.crop((*top_left[::-1], *bottom_right[::-1]))
        return cropped_img
    return img

# Load frame image and get size
frame = Image.open(frame_path).convert("RGB")
frame_width, frame_height = frame.size
box_width = frame_box[2] - frame_box[0]
box_height = frame_box[3] - frame_box[1]

# Process each design
for filename in os.listdir(designs_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')) and not filename.startswith("framed_"):
        design_path = os.path.join(designs_folder, filename)
        design = Image.open(design_path).convert("RGB")
      
        design = trim_white_border(design)

        # Resize design to fit the frame box
        design_resized = design.resize((round(box_width*0.9), round(box_height*0.9)), Image.Resampling.LANCZOS)

        # Paste onto a copy of the frame
        framed = frame.copy()
        framed.paste(design_resized, frame_box[:2])

        # Save output
        output_path = os.path.join(output_folder, f"framed_{filename}")
        print(f"Saving: {output_path}")
        framed.save(output_path)

print("Framing complete!")
