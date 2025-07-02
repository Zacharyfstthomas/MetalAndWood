import csv
import re
from googleapiclient.discovery import build
from urllib.parse import urlparse, parse_qs

# Replace with your API key
API_KEY = 'AIzaSyBhw_zvClt83l1pPAqFomRmfOrkHq1typs'

# Initialize Drive API
def get_drive_service():
    return build('drive', 'v3', developerKey=API_KEY)

# Extract folder ID from URL
def extract_folder_id(url):
    parsed = urlparse(url)
    if 'folders' in url:
        return url.split('/folders/')[1].split('?')[0]
    elif 'id=' in url:
        return parse_qs(parsed.query)['id'][0]
    else:
        raise ValueError("Invalid Google Drive folder URL")

# Recursively crawl folders
def crawl_folder(service, folder_id, folder_name, results):
    query = f"'{folder_id}' in parents and trashed = false"
    page_token = None

    while True:
        response = service.files().list(
            q=query,
            spaces='drive',
            fields='nextPageToken, files(id, name, mimeType)',
            pageToken=page_token
        ).execute()

        for file in response.get('files', []):
            if file['mimeType'] == 'application/vnd.google-apps.folder':
                crawl_folder(service, file['id'], file['name'], results)
            elif file['mimeType'].startswith('image/'):
                match = re.match(rf"^{re.escape(folder_name)}\d{{3}}\.jpg$", file['name'], re.IGNORECASE)
                if match:
                    public_link = f"https://drive.google.com/uc?id={file['id']}"
                    results.append({'File Name': file['name'], 'Link': public_link})

        page_token = response.get('nextPageToken', None)
        if page_token is None:
            break

# Main function
def main(folder_url, output_csv='output.csv'):
    folder_id = extract_folder_id(folder_url)
    service = get_drive_service()
    results = []
    crawl_folder(service, folder_id, "ROOT", results)

    # Save to CSV
    with open(output_csv, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['File Name', 'Link'])
        writer.writeheader()
        writer.writerows(results)

    print(f"Exported {len(results)} image links to {output_csv}")

# Example usage
if __name__ == '__main__':
    public_folder_url = 'https://drive.google.com/drive/folders/1pchPKQSiE2qXZl7P5hwjRsd1UA5DvFmY'
    main(public_folder_url)
