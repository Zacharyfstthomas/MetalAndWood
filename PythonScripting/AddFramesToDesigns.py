from PIL import Image, ImageDraw, ImageFont  
import numpy as np
import os

print ("Starting script...")
# File paths  
# Configuration
frame_path = "./Hamill/1117P/HAMILL_PEEL_MOCKUP_PNG.png"  # Your frame image
designs_folder = "./Hamill/1117P/NewDesigns"  # Folder containing design images
output_folder = "./Hamill/1117P/PEELFrame"
frame_box = (200, 128, 602, 734) # (left, top, right, bottom) coordinates of the frame area

os.makedirs(output_folder, exist_ok=True)

def trim_alpha_border(img, threshold=5):
    alpha = img.split()[-1]
    mask = alpha.point(lambda p: 255 if p > threshold else 0)
    return img.crop(mask.getbbox())

# Load the frame image
frame = Image.open(frame_path).convert("RGBA")
frame_cleaned = trim_alpha_border(frame)
frame_width, frame_height = frame.size
box_width = frame_box[2] - frame_box[0]
box_height = frame_box[3] - frame_box[1]

# Process each design
for filename in os.listdir(designs_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        design_path = os.path.join(designs_folder, filename)
        design = Image.open(design_path).convert("RGBA")
        # Composite over white if needed (to prevent weird alpha blending)
        background = Image.new("RGBA", design.size, (255, 255, 255, 255))
        design = Image.alpha_composite(background, design)
        # Resize design to fit into the frame box
        design = design.resize((box_width, box_height), Image.Resampling.LANCZOS)

        canvas = Image.new("RGBA", (frame_width, frame_height), (255, 255, 255, 0))
        canvas.paste(design, frame_box[:2], design)
        final = Image.alpha_composite(canvas, frame)

        # Save the result
        output_path = os.path.join(output_folder, f"framed_{filename}")
        framed_image = final.convert("RGB")
        print(output_path)
        framed_image.save(output_path)

print("Framing complete!")