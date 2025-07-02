import csv
import re
import requests
import os
from urllib.parse import urlparse

# CONFIG
input_csv = "C:/Users/zstthomas_mandwdesig/Downloads/GoogleFileNames.csv"
output_csv = "C:/Users/zstthomas_mandwdesig/Downloads/GoogleFileNames_Fixed.csv"
download_folder = "C:/Users/zstthomas_mandwdesig/Downloads/temp_images"

# Ensure download folder exists
os.makedirs(download_folder, exist_ok=True)

# Step 1: Read single-row, multi-column CSV
with open(input_csv, newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    row = next(reader)  # Only one row assumed
    image_links = [cell.strip() for cell in row if cell.strip()]
    print(image_links)    
link_with_numbers = []


def extract_file_id(drive_url):
    match = re.search(r"/d/([^/]+)", drive_url)
    print('fileID:',match)
    return match.group(1) if match else None

def download_drive_file(file_id):
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    session = requests.Session()
    response = session.get(url, stream=True)

    # Handle confirmation for large files
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            response = session.get(url, params={"confirm": value}, stream=True)
            break

    # Extract filename from Content-Disposition
    content_disp = response.headers.get('Content-Disposition', '')
    filename_match = re.search(r'filename="(.+?)"', content_disp)
    filename = filename_match.group(1) if filename_match else f"{file_id}.jpg"
    local_path = os.path.join(download_folder, filename)

    with open(local_path, 'wb') as f:
        for chunk in response.iter_content(32768):
            f.write(chunk)

    return filename
count = 0
for link in image_links:
    file_id = extract_file_id(link)
    if not file_id:
        print(f"Invalid Google Drive link: {link}")
        continue

    try:
        filename = download_drive_file(file_id)
        match = re.search(r'framed_TRVL(\d+)', filename, re.IGNORECASE)
        trvl_num = int(match.group(1)) if match else float('inf')
        link_with_numbers.append((link, trvl_num))
        print("File no: ", count)
        print(f"✅ {filename} → TRVL-{trvl_num}")
        count+=1
    except Exception as e:
        print(f"Failed to download/process {link}: {e}")

# Step 3: Sort links by TRVL number
sorted_links = [link for link, _ in sorted(link_with_numbers, key=lambda x: x[1])]

# Step 4: Write sorted links to 1-column CSV
with open(output_csv, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    for link in sorted_links:
        writer.writerow([link])

print(f"✅ Sorted links saved to {output_csv}")
