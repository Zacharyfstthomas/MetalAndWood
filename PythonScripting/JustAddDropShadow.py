from PIL import Image, ImageFilter, ImageOps
import os

print("Starting shadow script...")

# Paths
designs_folder = "./Hamill/1117P"
output_folder = "./Hamill/1117P/Shadowed"

os.makedirs(output_folder, exist_ok=True)

# Shadow settings
padding = 180  # Even more padding for larger shadow
blur_radius = 60  # Increased blur for softer, more spread out shadow
shadow_offset = (12, 16)  # Larger offset for more dramatic shadow
shadow_color = (0, 0, 0, 200)  # Darker shadow

for filename in os.listdir(designs_folder):
    if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        continue

    img_path = os.path.join(designs_folder, filename)
    img = Image.open(img_path).convert("RGBA")

    # Create base canvas with padding for shadow
    new_size = (img.width + padding * 2, img.height + padding * 2)
    canvas = Image.new("RGBA", new_size, (255, 255, 255, 0))  # Transparent background

    # Create shadow layer - start with the original image's alpha
    shadow_layer = Image.new("RGBA", new_size, (0, 0, 0, 0))
    
    # Create a solid black version of the image for shadow
    shadow_shape = Image.new("RGBA", img.size, (0, 0, 0, 255))
    
    # Use the original image's alpha channel as mask for shadow
    if img.mode == "RGBA":
        alpha_mask = img.split()[3]
        shadow_shape.putalpha(alpha_mask)
    
    # Position and blur the shadow
    shadow_position = (padding + shadow_offset[0], padding + shadow_offset[1])
    shadow_layer.paste(shadow_shape, shadow_position, shadow_shape)
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(blur_radius))
    
    # Adjust shadow opacity - make it darker and more pronounced
    shadow_alpha = shadow_layer.split()[3]
    # Make shadow much darker by scaling the alpha more aggressively
    shadow_alpha = shadow_alpha.point(lambda x: min(255, int(x * 0.85)) if x > 0 else 0)
    shadow_layer.putalpha(shadow_alpha)

    # Create white background for the final image
    final_canvas = Image.new("RGB", new_size, (255, 255, 255))
    
    # Paste shadow first
    final_canvas.paste(shadow_layer, (0, 0), shadow_layer)
    
    # Paste original image on top
    image_position = (padding, padding)
    final_canvas.paste(img, image_position, img)

    # Save output
    output_path = os.path.join(output_folder, f"shadowed_{filename}")
    final_canvas.save(output_path, quality=95)
    print(f"Saved {output_path}")

print("Done.")