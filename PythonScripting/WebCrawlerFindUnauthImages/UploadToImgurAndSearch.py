import requests

SERPAPI_KEY = #Import via env
LOCAL_IMAGE_PATH = 'framed_TRVL005.jpg'

# Upload image to 0x0.st
def upload_to_0x0(image_path):
    headers = {
        'User-Agent': 'ZFSBabyee'
    }
    with open(image_path, 'rb') as f:
        response = requests.post('https://0x0.st', files={'file': f}, headers=headers)
    if response.status_code == 200:
        url = response.text.strip()
        print("Image uploaded to 0x0.st:", url)
        return url
    else:
        raise Exception(f"Upload failed: {response.status_code} - {response.text}")

# Use public image URL in SerpApi reverse image search 
def search_with_serpapi(image_url):
    params = {
        'engine': 'google_reverse_image',
        'image_url': image_url,
        'api_key': SERPAPI_KEY
    }
    response = requests.get('https://serpapi.com/search', params=params)
    return response.json()


image_url = upload_to_0x0(LOCAL_IMAGE_PATH)
results = search_with_serpapi(image_url)

for result in results.get('image_results', []):
    print(result.get('title'), "-", result.get('link'))
