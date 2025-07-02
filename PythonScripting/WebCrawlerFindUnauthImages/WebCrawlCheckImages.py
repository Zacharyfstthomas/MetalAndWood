import os
import imagehash
import json
from PIL import Image
from google.cloud import vision
import requests
from bs4 import BeautifulSoup
from io import BytesIO
import tldextract
from dotenv import load_dotenv
import os

load_dotenv()  # Loads the .env file into os.environ

# Now the client can pick up GOOGLE_APPLICATION_CREDENTIALS
from google.cloud import vision
client = vision.ImageAnnotatorClient()
print("Credential path:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

# Load known image hashes
with open("hashed_images.json", "r") as f:
    known_hashes = json.load(f)
known_hashes = {k: imagehash.hex_to_hash(v) for k, v in known_hashes.items()}
HASH_THRESHOLD = 5

# Store keywords that hint at commercial use
STORE_KEYWORDS = ['shop', 'store', 'product', 'cart', 'buy', 'checkout', 'posters', 'design', 'art','travel','souviner']
def is_commercial_site(url):
    parts = tldextract.extract(url)
    domain_path = url.lower()
    return any(kw in domain_path for kw in STORE_KEYWORDS)

def search_by_image(image_path):
    with open(image_path, 'rb') as img_file:
        content = img_file.read()
    image = vision.Image(content=content)
    response = client.web_detection(image=image)

    urls = []
    if response.web_detection.pages_with_matching_images:
        for page in response.web_detection.pages_with_matching_images:
            if is_commercial_site(page.url):
                urls.append(page.url)
    return urls

def extract_and_match_images(url):
    try:
        print(f" Crawling {url}")
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.content, "html.parser")
        img_tags = soup.find_all("img", src=True)

        matches = []
        for tag in img_tags:
            src = tag["src"]
            if src.startswith("//"):
                src = "https:" + src
            elif src.startswith("/"):
                parsed = requests.utils.urlparse(url)
                src = f"{parsed.scheme}://{parsed.netloc}{src}"

            if not src.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue

            img_hash = download_and_hash_image(src)
            if img_hash:
                match = compare_to_known_hashes(img_hash)
                if match:
                    matches.append((match, url, src))
        return matches
    except Exception as e:
        print(f"[!] Error crawling {url}: {e}")
        return []

def download_and_hash_image(image_url):
    try:
        resp = requests.get(image_url, timeout=10)
        img = Image.open(BytesIO(resp.content))
        return imagehash.phash(img)
    except Exception:
        return None

def compare_to_known_hashes(ph):
    for filename, known in known_hashes.items():
        if abs(ph - known) <= HASH_THRESHOLD:
            return filename
    return None

if __name__ == "__main__":
    image_folder = "your/image/folder"  # <- Change this
    output_json = "vision_matches.json"
    all_matches = []

    for filename in os.listdir(image_folder):
        if filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            image_path = os.path.join(image_folder, filename)
            print(f" Searching for: {filename}")
            try:
                result_urls = search_by_image(image_path)
                for url in result_urls:
                    matches = extract_and_match_images(url)
                    all_matches.extend(matches)
            except Exception as e:
                print(f"[!] Failed image search for {filename}: {e}")

    with open(output_json, "w") as f:
        json.dump(all_matches, f, indent=2)

    print(f"\n {len(all_matches)} matches found and saved to {output_json}")
