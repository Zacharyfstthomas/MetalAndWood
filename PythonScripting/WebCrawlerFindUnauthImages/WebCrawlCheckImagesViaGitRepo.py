import os
import imagehash
import json

import requests

#gameplan: use github reverse image search, hash the image, then compare hashes


with open("hashed_images_relpath_keys.json", "r") as f:
    known_hashes = json.load(f)
known_hashes = {k: imagehash.hex_to_hash(v) for k, v in known_hashes.items()}
HASH_THRESHOLD = 5


#Modify this to loop through a list of URLs
url = "https://google-reverse-image-api.vercel.app/reverse"
data = {
    "imageUrl": "https://graph.org/file/1668e5e51e612341b945e.jpg" #"https://drive.google.com/file/d/1L-6d46_JbFpL5sC7m8xTdgQaxXv60Rsg/view"
}

response = requests.post(url, json=data)

if response.ok:
    print(response.json())
else:
    print(response.status_code)
    print(response.json())
