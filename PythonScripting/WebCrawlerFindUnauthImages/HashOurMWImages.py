import os
import imagehash
from PIL import Image
import json

# Supported image formats
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff")

def compute_phash(image_path):
    """Compute perceptual hash of an image file."""
    try:
        with Image.open(image_path) as img:
            return str(imagehash.phash(img))
    except Exception as e:
        print(f"Error hashing {image_path}: {e}")
        return None

def hash_images_in_folder(root_folder):
    """Walk through folder and hash all valid image files."""
    hash_dict = {}
    for dirpath, _, filenames in os.walk(root_folder):
        for filename in filenames:
            if filename.lower().endswith(IMAGE_EXTENSIONS):
                full_path = os.path.join(dirpath, filename)
                img_hash = compute_phash(full_path)
                if img_hash:
                    # Save relative path for portability
                    rel_path = os.path.relpath(full_path, root_folder)
                    hash_dict[rel_path] = img_hash
    return hash_dict

if __name__ == "__main__":
    image_root = "C:/Users/zstthomas_mandwdesig/OneDrive/Documents/Web Images - SKU only"   
    output_json = "hashed_images.json"

    result = hash_images_in_folder(image_root)

    # Save hash data to file
    with open(output_json, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ Hashed {len(result)} images. Results saved to {output_json}")
