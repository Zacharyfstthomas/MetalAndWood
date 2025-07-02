from PIL import Image, ImageDraw, ImageFont  
import numpy as np
import os 

frame_path = "C:/Users/zstthomas_mandwdesig/OneDrive/Documents/Web Images - SKU only/Hamill/1117P/11x17_Empty_Frame_PNG.png"  # Your frame image
output_folder = "C:/Users/zstthomas_mandwdesig/OneDrive/Documents/Web Images - SKU only/Hamill/1117P/Framed"

# Composite over white if needed (to prevent weird alpha blending)

frame = Image.open(frame_path).convert("RGBA")
background = Image.new("RGBA", frame.size, (255, 255, 255, 255))
design = Image.alpha_composite(background, frame)
output_path = os.path.join(output_folder, f"fixed_frame.png")
framed_image = design.convert("RGB")
framed_image.save(output_path)
