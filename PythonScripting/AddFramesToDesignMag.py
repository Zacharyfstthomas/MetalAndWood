from PIL import Image, ImageDraw, ImageFont  
import numpy as np
import os

print ("Starting script...")
# File paths  
# Configuration
frame_path = "./Hamill/1117P/HAMILL_SUBM_MOCKUP_PNG.png"  # Your frame image
designs_folder = "./Hamill/1117P/NewDesigns"  # Folder containing design images
output_folder = "./Hamill/1117P/MagFrame"
frame_box = (166, 87, 481, 575)  # (left, top, right, bottom) coordinates of the frame area

os.makedirs(output_folder, exist_ok=True)

def trim_alpha_border(img, threshold=5):
    alpha = img.split()[-1]
    mask = alpha.point(lambda p: 255 if p > threshold else 0)
    bbox = mask.getbbox()
    return img.crop(bbox) if bbox else img

def mask_soft_shadow(frame_img, threshold=200):
    r, g, b, a = frame_img.split()
    np_alpha = np.array(a)
    np_alpha[np_alpha < threshold] = 0
    new_alpha = Image.fromarray(np_alpha, mode='L')
    return Image.merge('RGBA', (r, g, b, new_alpha))

# Load the frame image
frame = Image.open(frame_path).convert("RGBA")
frame = mask_soft_shadow(frame)  # <--- apply the mask fix
frame_cleaned = trim_alpha_border(frame)
frame_width, frame_height = frame.size
box_width = frame_box[2] - frame_box[0]
box_height = frame_box[3] - frame_box[1]

# Process each design
for filename in os.listdir(designs_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        design_path = os.path.join(designs_folder, filename)
        design = Image.open(design_path).convert("RGBA")

        # Trim edges if needed
        design = trim_alpha_border(design)

        # Flatten onto white BEFORE resizing to prevent edge halo
        flattened = Image.new("RGB", design.size, (255, 255, 255))  # no alpha channel
        flattened.paste(design, mask=design.split()[-1])  # paste with alpha channel as mask

        # Resize after flattening
        design = flattened.resize((box_width, box_height), Image.Resampling.LANCZOS)

        # Convert back to RGBA for final composite
        design = design.convert("RGBA")

        canvas = Image.new("RGBA", (frame_width, frame_height), (255, 255, 255, 0))
        canvas.paste(design, frame_box[:2])
        final = Image.alpha_composite(canvas, frame)

        # Save the result
        output_path = os.path.join(output_folder, f"framed_{filename}")
        framed_image = final.convert("RGB")
        print(output_path)
        framed_image.save(output_path)

print("Framing complete!")