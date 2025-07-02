import csv
import re

def extract_id_and_reformat(url):
    match = re.search(r'/d/([^/]+)', url)
    if match:
        file_id = match.group(1)
        return f"https://drive.usercontent.google.com/download?id={file_id}"
    return "Invalid URL"

def process_single_row_csv(input_csv, output_csv):
    with open(input_csv, newline='') as infile:
        reader = csv.reader(infile)
        original_row = next(reader)

    converted_row = [extract_id_and_reformat(cell.strip()) for cell in original_row]

    with open(output_csv, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(original_row)
        writer.writerow(converted_row)

# Example usage
input_file = 'GoogleFileNames.csv'
output_file = 'converted_drive_links.csv'
process_single_row_csv(input_file, output_file)
